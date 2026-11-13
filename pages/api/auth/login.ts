import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, verifyPassword } from '../../../lib/userStore';
import { signJwt } from '../../../lib/jwt';
import { checkRateLimit, getClientIp, assertSafeInput } from '../../../lib/security';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { verifyOtp, isVerified } = require('../../../lib/otpStore');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);

  // 1. Rate Limiting / Brute-force & DoS Defense (Max 15 login attempts per 10 mins per IP)
  const rateLimit = checkRateLimit(`ip:login:${clientIp}`, 15, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
    });
  }

  try {
    const { email, password, otp } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    // 2. Input Sanitization & SQL/NoSQL Injection Check
    const cleanEmail = assertSafeInput(email, 'email').toLowerCase().trim();

    // 3. User Existence Check:
    // "only the signed up existing account should be sent otherwise it should show account or email does not exist"
    const user = findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No candidate account found with this email address. Please sign up first.',
      });
    }

    // Strategy 1: OTP Login
    if (otp) {
      const cleanOtp = String(otp).trim();
      const isOtpValid = verifyOtp(cleanEmail, cleanOtp) || isVerified(cleanEmail);

      if (!isOtpValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP verification code. Please check and try again.',
        });
      }

      const token = signJwt(
        {
          email: user.email,
          name: user.name,
          role: user.role,
          verified: true,
        },
        7 * 24 * 3600
      );

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully via email OTP!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Strategy 2: Password Login
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a valid password or request an OTP verification code to log in.',
      });
    }

    if (!user.passwordHash || !user.passwordSalt) {
      return res.status(400).json({
        success: false,
        message: 'This candidate account is configured for Email OTP login. Please click "Email OTP Login" above.',
      });
    }

    const match = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.',
      });
    }

    const token = signJwt(
      {
        email: user.email,
        name: user.name,
        role: user.role,
        verified: true,
      },
      7 * 24 * 3600
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
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
    console.error('[LOGIN ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An authentication error occurred. Please try again.',
    });
  }
}
