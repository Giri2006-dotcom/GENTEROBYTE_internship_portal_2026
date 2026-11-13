import type { NextApiRequest, NextApiResponse } from 'next';
import { getApplicationById, saveApplication, ApplicationData } from '../../../../lib/applicationStore';
import { verifyJwt } from '../../../../lib/jwt';

const ALLOWED_STATUSES = [
  'Under Review',
  'Shortlisted',
  'Technical Interview',
  'Interview Scheduled',
  'Offer Extended',
  'Accepted',
  'Rejected',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Enforce company recruiter authorization
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const decoded = token ? verifyJwt(token) : null;

  if (!decoded || (decoded.role !== 'recruiter' && decoded.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Recruitment pipeline transitions are strictly managed by authorized company recruiters.',
    });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid Application ID is required' });
  }

  try {
    const existing = await getApplicationById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `No application found with ID "${id}".`,
      });
    }

    const { status, reviewerNotes } = req.body || {};

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const updatedApp = {
      ...existing,
      status: status as ApplicationData['status'],
      reviewerNotes: reviewerNotes || existing.reviewerNotes,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveApplication(updatedApp);

    return res.status(200).json({
      success: true,
      message: `Status for ${id} updated to "${status}"`,
      application: saved,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[STATUS UPDATE ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update application status.',
    });
  }
}
