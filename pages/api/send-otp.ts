import type { NextApiRequest, NextApiResponse } from 'next';
import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
import { findUserByEmail, findUserByName } from '../../lib/userStore';
import { checkRateLimit, getClientIp, assertSafeInput } from '../../lib/security';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sendOtpEmail } = require('../../mailer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { saveOtp } = require('../../lib/otpStore');

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);

  // 1. IP-level Rate Limiting & DoS Protection (Max 12 requests per 10 minutes per IP)
  const ipCheck = checkRateLimit(`ip:send-otp:${clientIp}`, 12, 10 * 60 * 1000);
  if (!ipCheck.allowed) {
    return res.status(429).json({
      success: false,
      message: `Too many requests from your network. Please wait ${ipCheck.retryAfterSeconds} seconds before requesting another code.`,
    });
  }

  try {
    const { email, purpose, name } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Recipient email address is required.' });
    }

    // 2. Input Sanitization & SQL/NoSQL Injection Prevention
    const safeEmail = assertSafeInput(email, 'email');
    const cleanEmail = safeEmail.toLowerCase().trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email format.' });
    }

    // 3. Email-level Throttling (Max 5 requests per 10 minutes, min 20 seconds between requests)
    const emailCheck = checkRateLimit(`email:send-otp:${cleanEmail}`, 5, 10 * 60 * 1000, 20 * 1000);
    if (!emailCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${emailCheck.retryAfterSeconds} seconds before requesting a new verification code for this email.`,
      });
    }

    // 4. Role/Purpose Verification:
    // "the otp should not sent to all email during sign in, only the signed up existing account should be sent otherwise it should show account or email does not exist"
    if (purpose === 'signin') {
      const existingUser = findUserByEmail(cleanEmail);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Account or email does not exist. Please sign up first to create your candidate profile.',
        });
      }
    } else if (purpose === 'signup') {
      // "only one account should exist by one email and no duplicate usernames"
      const existingUser = findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.',
        });
      }

      if (name && typeof name === 'string') {
        const safeName = assertSafeInput(name, 'name');
        const existingName = findUserByName(safeName);
        if (existingName) {
          return res.status(409).json({
            success: false,
            message: `The username / candidate name "${safeName}" is already registered. Please choose a unique name.`,
          });
        }
      }
    }

    // 5. Dispatch OTP via Nodemailer directly to the recipient's inbox in real-time
    const result = await sendOtpEmail(cleanEmail);
    saveOtp(cleanEmail, result.otp);

    if (result.liveDelivered) {
      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been dispatched directly to your email inbox (${cleanEmail}).`,
        liveDelivered: true,
      });
    }

    // If live dispatch failed
    return res.status(502).json({
      success: false,
      message: `Failed to dispatch verification code to ${cleanEmail}. ${result.error ? `(${result.error})` : 'Please verify that your email address is correct and can receive emails.'}`,
      liveDelivered: false,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[SEND-OTP ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to dispatch verification code. Please try again.',
    });
  }
}
