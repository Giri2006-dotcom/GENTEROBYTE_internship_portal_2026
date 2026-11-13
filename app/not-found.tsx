import Link from 'next/link';
import { HiHome, HiAcademicCap, HiSearch } from 'react-icons/hi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-50/50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-navy-100">
        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-black">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-navy-600 mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been relocated. Choose an option below to return to the Gentrobyte portal:
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            <HiHome className="w-5 h-5 text-accent-400" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/internships"
            className="w-full flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 py-3.5 px-6 rounded-xl font-bold text-sm transition-all border border-primary-200"
          >
            <HiAcademicCap className="w-5 h-5 text-primary-600" />
            <span>Explore Internships</span>
          </Link>

          <Link
            href="/track"
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-navy-50 text-navy-700 py-3.5 px-6 rounded-xl font-bold text-sm transition-all border border-navy-200"
          >
            <HiSearch className="w-5 h-5 text-navy-500" />
            <span>Track Application Status</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

