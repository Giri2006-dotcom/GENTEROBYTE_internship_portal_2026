import type { Metadata } from 'next';
import Link from 'next/link';
import { HiArrowLeft, HiShieldCheck } from 'react-icons/hi';

export const metadata: Metadata = {
  title: 'Privacy Policy - Gentrobyte',
  description: 'Understand how Gentrobyte collects, protects, and handles applicant data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-50/50 py-16 sm:py-24 pt-28 sm:pt-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-bold text-navy-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <HiArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-navy-900/5 border border-navy-100 p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
              <HiShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-navy-400 font-semibold mt-1">Effective Date: January 1, 2026</p>
            </div>
          </div>

          <div className="prose max-w-none text-navy-600 text-sm leading-relaxed space-y-6">
            <p>
              At <strong>Gentrobyte</strong>, we respect your privacy and are committed to protecting the personal information you share with us throughout the internship application, review, and onboarding process.
            </p>

            <h2 className="text-lg font-bold text-navy-900">1. Information We Collect</h2>
            <p>
              When applying for our internship cohorts, we collect personal and academic information including your full name, email address, WhatsApp contact number, country of residence, college, degree, graduation year, resume document, and links to your professional profiles (e.g., GitHub, portfolio).
            </p>

            <h2 className="text-lg font-bold text-navy-900">2. How We Use Your Data</h2>
            <p>
              The data you provide is strictly utilized for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verifying candidate identity via email One-Time Passwords (OTP).</li>
              <li>Evaluating technical qualifications and matching you with suitable internship roles.</li>
              <li>Communicating recruitment decisions, interview invites, and cohort milestones.</li>
              <li>Generating your downloadable application receipt and facilitating live status tracking.</li>
            </ul>

            <h2 className="text-lg font-bold text-navy-900">3. Document & Resume Security</h2>
            <p>
              Uploaded resume files and documents are stored securely in encrypted storage. Only authorized Gentrobyte recruiters and technical interview panels have access to your submitted materials.
            </p>

            <h2 className="text-lg font-bold text-navy-900">4. Third-Party Sharing</h2>
            <p>
              Gentrobyte does not sell, lease, or distribute your personal details to third-party advertisers. Information is only processed through trusted infrastructure services (such as transactional email dispatch and secure database systems).
            </p>

            <h2 className="text-lg font-bold text-navy-900">5. Contact Our Privacy Team</h2>
            <p>
              If you have any questions or requests regarding your personal data or wish to withdraw your application, please reach out to us at{' '}
              <a href="mailto:privacy@gentrobyte.com" className="text-primary-600 font-bold underline">
                privacy@gentrobyte.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

