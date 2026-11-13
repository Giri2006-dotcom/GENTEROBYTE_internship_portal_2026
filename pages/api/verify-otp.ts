import type { NextApiRequest, NextApiResponse } from 'next';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { verifyOtp } = require('../../lib/otpStore');
import { signJwt } from '../../lib/jwt';
import { checkRateLimit, getClientIp, assertSafeInput } from '../../lib/security';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const ipCheck = checkRateLimit(`ip:verify-otp:${clientIp}`, 15, 10 * 60 * 1000);
  if (!ipCheck.allowed) {
    return res.status(429).json({
      verified: false,
      message: `Too many verification attempts from your network. Please wait ${ipCheck.retryAfterSeconds} seconds.`,
    });
  }

  const { email, otp } = req.body || {};
  if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string') {
    return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
  }

  const safeEmail = assertSafeInput(email, 'email');
  const cleanEmail = safeEmail.toLowerCase().trim();
  const cleanOtp = otp.trim().replace(/\D/g, '');

  const emailCheck = checkRateLimit(`email:verify-otp:${cleanEmail}`, 6, 5 * 60 * 1000);
  if (!emailCheck.allowed) {
    return res.status(429).json({
      verified: false,
      message: `Too many failed attempts for this email. Please wait ${emailCheck.retryAfterSeconds} seconds or request a new code.`,
    });
  }

  const verified = verifyOtp(cleanEmail, cleanOtp);
  if (!verified) {
    return res.status(200).json({
      verified: false,
      message: 'Invalid or expired verification code. Please check your inbox and try again.',
    });
  }

  // Issue signed applicant JWT token (valid for 2 hours)
  const token = signJwt(
    {
      email: cleanEmail,
      role: 'applicant',
      verified: true,
    },
    7200
  );

  return res.status(200).json({
    verified: true,
    token,
    message: 'Email address verified successfully!',
  });
}
