'use client';

import React from 'react';
import Link from 'next/link';
import { HiArrowRight, HiSparkles, HiUser, HiShieldCheck } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

const Hero: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden pt-20">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary-200/40 via-white to-transparent blur-3xl" />
        <div className="absolute -bottom-48 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent-200/40 via-white to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary-100/20 via-white to-accent-100/20 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-navy-50 border border-navy-100 text-primary-700 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 animate-fade-in shadow-sm">
            <HiSparkles className="h-4 w-4 sm:h-5 sm:w-5 text-accent-500" />
            <span className="text-[9px] sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
              Now Accepting Applications for 2026 Cohorts
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-navy-900 mb-4 sm:mb-6 leading-[1.2] sm:leading-[1.1] animate-fade-in-up tracking-tight px-2 sm:px-0">
            Gentrobyte Internships —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600">
              Build, Learn, Achieve
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-xl text-navy-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 font-medium px-4 sm:px-0">
            Join our mission to innovate and build real-world software systems. Authenticate to track your live application status or apply directly.
          </p>

          {/* Action CTAs: Explore + Auth Options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-400 px-4 sm:px-0 max-w-xl mx-auto">
            <Link
              href="/apply"
              className="w-full sm:w-auto bg-accent-600 hover:bg-accent-700 text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl shadow-accent-600/25 hover:shadow-accent-600/40 hover:-translate-y-0.5 active:scale-95"
            >
              <span>Apply Now</span>
              <HiArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/internships"
              className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 text-white px-7 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-navy-900/15 hover:-translate-y-0.5 active:scale-95"
            >
              <span>View Roles</span>
            </Link>

            {user ? (
              <Link
                href={user.role === 'recruiter' ? '/recruiter' : '/track'}
                className="w-full sm:w-auto bg-navy-50 hover:bg-navy-100 text-navy-900 border border-navy-200 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center space-x-2"
              >
                {user.role === 'recruiter' ? (
                  <>
                    <HiShieldCheck className="h-4 w-4 text-primary-600" />
                    <span>Recruiter Dashboard</span>
                  </>
                ) : (
                  <>
                    <HiUser className="h-4 w-4 text-primary-600" />
                    <span>My Applications</span>
                  </>
                )}
              </Link>
            ) : (
              <div className="w-full sm:w-auto flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex-1 sm:flex-none text-center bg-white hover:bg-navy-50 text-navy-900 border border-navy-200 px-5 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 sm:flex-none text-center bg-primary-600 hover:bg-primary-500 text-white px-5 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-primary-600/25"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Quick Authentication Status Strip */}
          <div className="mt-6 text-xs text-navy-500 font-medium">
            {user ? (
              <p>
                ✓ Logged in as <strong className="text-navy-900">{user.name}</strong> ({user.email}).{' '}
                <Link href={user.role === 'recruiter' ? '/recruiter' : '/track'} className="text-primary-600 font-bold underline">
                  Go to {user.role === 'recruiter' ? 'Recruiter Command Center' : 'Status Tracker'} →
                </Link>
              </p>
            ) : (
              <p>
                Already submitted an application?{' '}
                <Link href="/login" className="text-primary-600 font-bold underline hover:text-primary-700">
                  Sign In
                </Link>{' '}
                to track live progress, or{' '}
                <Link href="/signup" className="text-primary-600 font-bold underline hover:text-primary-700">
                  Sign Up
                </Link>{' '}
                for a new candidate account.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-14 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-12 max-w-5xl mx-auto animate-fade-in-up animation-delay-600 px-4 sm:px-0">
            {[
              { label: 'Interns Hired', value: '50+' },
              { label: 'Live Projects', value: '15+' },
              { label: 'Satisfaction Rate', value: '95%' },
              { label: 'Partner Companies', value: '10+' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl sm:text-5xl font-black text-navy-900 mb-1 sm:mb-3 group-hover:text-primary-600 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-navy-400 font-bold uppercase tracking-wider sm:tracking-widest text-[9px] sm:text-xs leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
