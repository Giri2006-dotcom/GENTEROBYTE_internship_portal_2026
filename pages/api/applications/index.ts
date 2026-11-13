import type { NextApiRequest, NextApiResponse } from 'next';
import {
  saveApplication,
  findApplicationByEmailAndDomain,
  getApplicationById,
  getAllApplications,
  getApplicationsByEmail,
} from '../../../lib/applicationStore';
import { verifyJwt } from '../../../lib/jwt';
import { checkRateLimit, getClientIp, assertSafeInput } from '../../../lib/security';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { isVerified } = require('../../../lib/otpStore');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sendConfirmationEmail } = require('../../../mailer');

// Enable large body payload for resume data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

function generateAppId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GB-2026-${randomPart}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientIp = getClientIp(req);

  if (req.method === 'GET') {
    // Rate limit GET requests to prevent DoS scraping
    const getLimit = checkRateLimit(`ip:get-apps:${clientIp}`, 60, 60 * 1000);
    if (!getLimit.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please slow down.' });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required to view applications.' });
    }

    const decoded = verifyJwt(token);
    if (!decoded || !decoded.email) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }

    // Role-based access control: Company recruiter can see all, candidates can ONLY see their own!
    if (decoded.role === 'recruiter' || decoded.role === 'admin') {
      const all = await getAllApplications();
      return res.status(200).json({ success: true, count: all.length, applications: all });
    }

    const mine = await getApplicationsByEmail(decoded.email);
    return res.status(200).json({ success: true, count: mine.length, applications: mine });
  }

  if (req.method === 'POST') {
    // 1. Anti-DoS Rate Limiting on Application Submissions (Max 8 per 10 minutes per IP)
    const postLimit = checkRateLimit(`ip:post-app:${clientIp}`, 8, 10 * 60 * 1000);
    if (!postLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: `Submission rate limit exceeded. Please wait ${postLimit.retryAfterSeconds} seconds before submitting again.`,
      });
    }

    try {
      const data = req.body;
      const {
        email,
        confirmEmail,
        fullName,
        gender,
        whatsapp,
        country,
        college,
        collegeMail,
        degree,
        branch,
        graduationYear,
        githubUrl,
        portfolioUrl,
        skills,
        whyApply,
        domain,
        consent,
      } = data || {};

      // 2. Validate required presence
      if (!email || !fullName || !gender || !whatsapp || !country || !college || !domain) {
        return res.status(400).json({
          success: false,
          message: 'Missing essential personal details. Please fill out all required fields.',
        });
      }

      // 3. Security Parameter Sanitization (Prevent SQL & NoSQL Injection Attacks)
      const safeEmail = assertSafeInput(email, 'email').toLowerCase().trim();
      const safeConfirmEmail = assertSafeInput(confirmEmail || email, 'confirmEmail').toLowerCase().trim();
      const safeFullName = assertSafeInput(fullName, 'fullName').trim().toUpperCase();
      const safeGender = assertSafeInput(gender, 'gender');
      const safeWhatsapp = assertSafeInput(whatsapp, 'whatsapp').trim();
      const safeCountry = assertSafeInput(country, 'country').trim();
      const safeCollege = assertSafeInput(college, 'college').trim();
      const safeCollegeMail = collegeMail ? assertSafeInput(collegeMail, 'collegeMail').toLowerCase().trim() : '';
      const safeDegree = assertSafeInput(degree, 'degree');
      const safeBranch = assertSafeInput(branch, 'branch').trim();
      const safeGraduationYear = assertSafeInput(graduationYear, 'graduationYear').trim();
      const safeGithub = assertSafeInput(githubUrl || '', 'githubUrl').trim();
      const safePortfolio = portfolioUrl ? assertSafeInput(portfolioUrl, 'portfolioUrl').trim() : '';
      const safeSkills = assertSafeInput(skills || '', 'skills').trim();
      const safeWhyApply = assertSafeInput(whyApply || '', 'whyApply').trim();
      const safeDomain = assertSafeInput(domain, 'domain').trim();

      if (safeEmail !== safeConfirmEmail) {
        return res.status(400).json({
          success: false,
          message: 'Primary email and confirmation email do not match.',
        });
      }

      if (!consent) {
        return res.status(400).json({
          success: false,
          message: 'Applicant consent and accuracy declaration are required to submit.',
        });
      }

      // 4. Authentication Check (Verified Candidate Identity)
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      const token = bearerToken || data.authToken;

      let isCandidateAuthenticated = false;
      if (token) {
        const decoded = verifyJwt(token);
        if (decoded && decoded.email?.toLowerCase() === safeEmail) {
          isCandidateAuthenticated = true;
        }
      }

      const verified = isCandidateAuthenticated || isVerified(safeEmail);
      if (!verified) {
        return res.status(403).json({
          success: false,
          message: 'Your email address is not authenticated via OTP. Please sign up or log in first.',
        });
      }

      // 5. Strict Duplicate Application Prevention (No duplicates per domain)
      const existing = await findApplicationByEmailAndDomain(safeEmail, safeDomain);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `You have already submitted an application for "${safeDomain}" (Application ID: ${existing.applicationId}). Duplicate submissions are blocked. You can track your progress on the tracker.`,
          applicationId: existing.applicationId,
        });
      }

      // 6. Generate collision-free application ID
      let appId = generateAppId();
      let collision = await getApplicationById(appId);
      while (collision) {
        appId = generateAppId();
        collision = await getApplicationById(appId);
      }

      // 7. Assemble sanitized application record
      const newApp = {
        applicationId: appId,
        fullName: safeFullName,
        email: safeEmail,
        confirmEmail: safeConfirmEmail,
        gender: safeGender,
        whatsapp: safeWhatsapp,
        country: safeCountry,
        college: safeCollege,
        collegeMail: safeCollegeMail,
        degree: safeDegree,
        branch: safeBranch,
        graduationYear: safeGraduationYear,
        githubUrl: safeGithub,
        portfolioUrl: safePortfolio,
        skills: safeSkills,
        whyApply: safeWhyApply,
        domain: safeDomain,
        resumeUrl: data.resumeUrl ? assertSafeInput(data.resumeUrl, 'resumeUrl') : undefined,
        resumeFileName: data.resumeFileName ? assertSafeInput(data.resumeFileName, 'resumeFileName') : undefined,
        resumeFileSize: typeof data.resumeFileSize === 'number' ? data.resumeFileSize : undefined,
        resumeFileType: data.resumeFileType ? assertSafeInput(data.resumeFileType, 'resumeFileType') : undefined,
        resumeBase64: data.resumeBase64 && typeof data.resumeBase64 === 'string' && data.resumeBase64.length < 500000 ? data.resumeBase64 : undefined,
        consent: Boolean(consent),
        status: 'Under Review' as const,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 8. Save application to store
      await saveApplication(newApp);

      // 9. Dispatch official confirmation email
      try {
        await sendConfirmationEmail(newApp.email, {
          applicationId: appId,
          fullName: newApp.fullName,
          domain: newApp.domain,
        });
      } catch (mailError) {
        console.warn('[CONFIRMATION EMAIL NOTICE]:', mailError);
      }

      return res.status(201).json({
        success: true,
        message: 'Application submitted and logged into admissions pipeline successfully!',
        applicationId: appId,
        data: {
          applicationId: appId,
          fullName: newApp.fullName,
          email: newApp.email,
          domain: newApp.domain,
          submittedAt: newApp.submittedAt,
        },
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error submitting application:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'An internal server error occurred while processing your application. Please try again.',
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
