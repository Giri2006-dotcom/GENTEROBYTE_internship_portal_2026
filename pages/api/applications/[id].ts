import type { NextApiRequest, NextApiResponse } from 'next';
import { getApplicationById } from '../../../lib/applicationStore';
import { verifyJwt } from '../../../lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { id, email } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Application ID is required' });
  }

  // Check auth header if present
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const decoded = token ? verifyJwt(token) : null;

  try {
    const app = await getApplicationById(id);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'No application found with ID ' + id,
      });
    }

    // Privacy Protection: Don't allow everyone to access another candidate's details!
    const isCompanyRecruiter = decoded && (decoded.role === 'recruiter' || decoded.role === 'admin');
    const isOwnerByToken = decoded && decoded.email?.toLowerCase() === app.email.toLowerCase();
    const isOwnerByEmailQuery = typeof email === 'string' && email.toLowerCase().trim() === app.email.toLowerCase();

    if (!isCompanyRecruiter && !isOwnerByToken && !isOwnerByEmailQuery) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: Please provide the matching registered email or log in to view this application.',
      });
    }

    // Return complete details for the verified owner or company recruiter
    return res.status(200).json({
      success: true,
      isRecruiterView: Boolean(isCompanyRecruiter),
      application: {
        applicationId: app.applicationId,
        fullName: app.fullName,
        email: app.email,
        domain: app.domain,
        college: app.college,
        collegeMail: app.collegeMail,
        degree: app.degree,
        branch: app.branch,
        graduationYear: app.graduationYear,
        gender: app.gender,
        whatsapp: app.whatsapp,
        country: app.country,
        githubUrl: app.githubUrl,
        portfolioUrl: app.portfolioUrl,
        skills: app.skills,
        whyApply: app.whyApply,
        status: app.status,
        submittedAt: app.submittedAt,
        updatedAt: app.updatedAt,
        resumeFileName: app.resumeFileName,
        resumeUrl: app.resumeUrl,
        reviewerNotes: app.reviewerNotes,
      },
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve application status. Please try again.',
    });
  }
}
