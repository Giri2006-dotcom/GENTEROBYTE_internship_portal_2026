import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../../lib/jwt';
import { findUserByEmail } from '../../../lib/userStore';
import { getApplicationsByEmail } from '../../../lib/applicationStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const decoded = verifyJwt(token);
  if (!decoded || !decoded.email) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }

  const user = findUserByEmail(decoded.email);
  const applications = decoded.role === 'applicant' ? await getApplicationsByEmail(decoded.email) : [];

  return res.status(200).json({
    success: true,
    user: {
      email: decoded.email,
      name: decoded.name || user?.name || decoded.email.split('@')[0],
      role: decoded.role || user?.role || 'applicant',
    },
    applications,
  });
}

