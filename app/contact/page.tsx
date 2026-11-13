import type { Metadata } from 'next';
import Link from 'next/link';
import { HiArrowLeft, HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

export const metadata: Metadata = {
  title: 'Contact Us - Gentrobyte',
  description: 'Get in touch with the Gentrobyte internship and recruitment support team.',
};

export default function ContactPage() {
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

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
            Get in <span className="text-primary-600">Touch</span>
          </h1>
          <p className="text-base sm:text-lg text-navy-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Have questions about internship tracks, submission requirements, or recruitment status? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-navy-100 text-center">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiMail className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-navy-900 mb-1">Email Support</h2>
            <p className="text-xs text-navy-500 mb-3">Response within 24-48 hours</p>
            <a
              href="mailto:internships@gentrobyte.com"
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              internships@gentrobyte.com
            </a>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-navy-100 text-center">
            <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiPhone className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-navy-900 mb-1">Phone Inquiry</h2>
            <p className="text-xs text-navy-500 mb-3">Mon-Fri: 9am - 6pm EST</p>
            <a
              href="tel:+1234567890"
              className="text-xs font-bold text-accent-600 hover:underline"
            >
              +1 (234) 567-890
            </a>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-navy-100 text-center">
            <div className="w-12 h-12 bg-navy-100 text-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiLocationMarker className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-navy-900 mb-1">Headquarters</h2>
            <p className="text-xs text-navy-500 mb-3">Innovation & Technology Campus</p>
            <span className="text-xs text-navy-700 font-medium">Silicon Valley, CA 94025</span>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-navy-900/5 border border-navy-100 text-center">
          <h2 className="text-xl font-bold text-navy-900 mb-2">Looking to check an existing application?</h2>
          <p className="text-sm text-navy-600 mb-6">
            You don&apos;t need to wait for email support — check your real-time recruitment pipeline progress instantly.
          </p>
          <Link
            href="/track"
            className="inline-flex items-center justify-center bg-navy-900 hover:bg-navy-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            Track Application Status
          </Link>
        </div>
      </div>
    </div>
  );
}

