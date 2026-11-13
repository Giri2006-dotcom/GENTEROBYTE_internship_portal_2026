import type { Metadata } from 'next';
import Link from 'next/link';
import { HiArrowLeft, HiDocumentText } from 'react-icons/hi';

export const metadata: Metadata = {
  title: 'Terms of Service - Gentrobyte',
  description: 'Terms and conditions governing use of the Gentrobyte application portal and internship program.',
};

export default function TermsPage() {
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
              <HiDocumentText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight">Terms of Service</h1>
              <p className="text-xs text-navy-400 font-semibold mt-1">Last Updated: January 2026</p>
            </div>
          </div>

          <div className="prose max-w-none text-navy-600 text-sm leading-relaxed space-y-6">
            <p>
              Welcome to <strong>Gentrobyte</strong>. By accessing or submitting an application through our portal, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h2 className="text-lg font-bold text-navy-900">1. Eligibility</h2>
            <p>
              Applicants must be currently enrolled in an accredited higher education institution or recent graduates seeking practical industry training. All information provided during the application process must be accurate, truthful, and complete.
            </p>

            <h2 className="text-lg font-bold text-navy-900">2. Verification & Integrity</h2>
            <p>
              Applications require email verification through our One-Time Password (OTP) system. Misrepresentation of academic credentials, plagiarism of code repositories, or submitting false contact information may lead to immediate disqualification from current and future Gentrobyte cohorts.
            </p>

            <h2 className="text-lg font-bold text-navy-900">3. Program Stipend & Mentorship</h2>
            <p>
              Internship roles offered through Gentrobyte involve structured mentorship, real-world project engagement, and stipulated monthly stipends as defined in individual internship track listings. Full terms are specified upon formal offer issuance.
            </p>

            <h2 className="text-lg font-bold text-navy-900">4. Intellectual Property</h2>
            <p>
              Proprietary codebase, curriculum assets, and internal tooling provided during the internship program remain the exclusive intellectual property of Gentrobyte and its partner organizations.
            </p>

            <h2 className="text-lg font-bold text-navy-900">5. Contact Information</h2>
            <p>
              For legal inquiries regarding our terms, please contact{' '}
              <a href="mailto:legal@gentrobyte.com" className="text-primary-600 font-bold underline">
                legal@gentrobyte.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

