import type { Metadata } from 'next';
import Link from 'next/link';
import { HiArrowRight, HiBriefcase, HiSparkles, HiCheckCircle } from 'react-icons/hi';

export const metadata: Metadata = {
  title: 'Careers & Opportunities - Gentrobyte',
  description: 'Explore full-time pathways and fast-track internship programs at Gentrobyte.',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-navy-50/50 py-16 sm:py-24 pt-28 sm:pt-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-100 text-primary-700 px-4 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="w-4 h-4 text-accent-500" />
            <span>Join Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
            Careers at <span className="text-primary-600">Gentrobyte</span>
          </h1>
          <p className="text-base sm:text-lg text-navy-600 max-w-2xl mx-auto font-medium leading-relaxed">
            We are building high-impact software, fostering tech talent, and paving the pathway from internship cohorts to full-time engineering roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-navy-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
              <HiBriefcase className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">2026 Internship Cohorts</h2>
            <p className="text-sm text-navy-600 mb-6 leading-relaxed">
              Work on live production code, receive direct 1-on-1 mentorship, and fast-track your progression to full-time Associate Software Engineer offers.
            </p>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold text-sm"
            >
              <span>Explore 6+ Internship Tracks</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-navy-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center mb-6">
              <HiSparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Direct Internship Application</h2>
            <p className="text-sm text-navy-600 mb-6 leading-relaxed">
              Already know your domain? Submit your credentials, verify your email, and receive your tracking ID in minutes.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-bold text-sm"
            >
              <span>Open Application Portal</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-navy-900 text-white rounded-3xl p-8 sm:p-10">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Why Launch Your Career With Gentrobyte?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-navy-300">
            <div className="flex items-start gap-2">
              <HiCheckCircle className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
              <span>Competitive monthly stipends & performance bonuses</span>
            </div>
            <div className="flex items-start gap-2">
              <HiCheckCircle className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
              <span>Direct guidance from tech leads and senior architects</span>
            </div>
            <div className="flex items-start gap-2">
              <HiCheckCircle className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
              <span>High conversion rate from intern to full-time engineer</span>
            </div>
            <div className="flex items-start gap-2">
              <HiCheckCircle className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
              <span>Remote autonomy and flexible collaborative hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

