import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, verifyPassword } from '../../../../lib/userStore';
import { signJwt } from '../../../../lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Company recruiter email and access key are required.',
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const configuredRecruiterEmail = (process.env.RECRUITER_EMAIL || 'recruiter@gentrobyte.com').toLowerCase().trim();
  const configuredRecruiterPass = process.env.RECRUITER_PASSWORD || 'Gentrobyte@2026';

  // Check direct environment-configured credentials first
  const isEnvMatch = cleanEmail === configuredRecruiterEmail && password === configuredRecruiterPass;

  const user = findUserByEmail(cleanEmail);

  if (!isEnvMatch && (!user || (user.role !== 'recruiter' && user.role !== 'admin'))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only authorized company recruiters can access this portal.',
    });
  }

  let isPasswordValid = isEnvMatch;
  if (!isPasswordValid && user && user.passwordHash && user.passwordSalt) {
    isPasswordValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  }

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid company recruiter access credentials.',
    });
  }

  const token = signJwt(
    {
      email: cleanEmail,
      name: user?.name || 'Gentrobyte Talent Acquisition',
      role: 'recruiter',
      verified: true,
    },
    24 * 3600 // 24 hours recruiter session
  );

  return res.status(200).json({
    success: true,
    message: 'Authorized company recruiter access granted.',
    token,
    user: {
      id: user?.id || 'REC-001',
      name: user?.name || 'Gentrobyte Talent Acquisition',
      email: cleanEmail,
      role: 'recruiter',
    },
  });
}

