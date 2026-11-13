import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, findUserByName, createUser } from '../../../lib/userStore';
import { signJwt } from '../../../lib/jwt';
import { checkRateLimit, getClientIp, assertSafeInput } from '../../../lib/security';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { verifyOtp, isVerified } = require('../../../lib/otpStore');

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);

  // 1. DoS / Abuse Rate Limiting (Max 8 signup attempts per 15 mins per IP)
  const rateLimit = checkRateLimit(`ip:signup:${clientIp}`, 8, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      message: `Too many signup attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
    });
  }

  try {
    const { email, name, password, otp } = req.body || {};

    if (!email || typeof email !== 'string' || !name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Full name and email address are required.' });
    }

    // 2. Input Sanitization & SQL/NoSQL Injection Check
    const cleanName = assertSafeInput(name, 'name').trim();
    const cleanEmail = assertSafeInput(email, 'email').toLowerCase().trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({ success: false, message: 'Full legal name must be between 2 and 80 characters.' });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address format.' });
    }

    // 3. Strict Uniqueness Checks:
    // "only one account should exist by one email and no duplicate usernames"
    const existingEmail = findUserByEmail(cleanEmail);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    const existingName = findUserByName(cleanName);
    if (existingName) {
      return res.status(409).json({
        success: false,
        message: `The username / candidate name "${cleanName}" is already registered. Please choose a unique name.`,
      });
    }

    // 4. Verification Check: Candidate MUST verify via real-time Email OTP
    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email OTP code is required to verify ownership before account creation.',
      });
    }

    const isCodeValid = verifyOtp(cleanEmail, otp.trim()) || isVerified(cleanEmail);
    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired 6-digit verification code. Please request a new code.',
      });
    }

    // 5. Create the Candidate Account
    const user = createUser({
      name: cleanName,
      email: cleanEmail,
      role: 'applicant',
      password: password && typeof password === 'string' ? password.trim() : undefined,
    });

    // 6. Issue 7-day signed JWT session
    const token = signJwt(
      {
        email: user.email,
        name: user.name,
        role: user.role,
        verified: true,
      },
      7 * 24 * 3600
    );

    return res.status(201).json({
      success: true,
      message: 'Candidate account created and authenticated successfully! You may now proceed to apply.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[SIGNUP ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An error occurred during account registration. Please try again.',
    });
  }
}
