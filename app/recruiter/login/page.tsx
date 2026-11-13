'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiShieldCheck, HiLockClosed, HiMail, HiArrowLeft, HiExclamationCircle } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

export default function RecruiterLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/recruiter/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      login(data.token, data.user);
      router.push('/recruiter');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Invalid company recruiter access credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <HiArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Portal
        </Link>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/60">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/25 border border-indigo-400/30">
              <HiShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Recruiter Portal</h1>
            <p className="text-xs text-indigo-600 mt-1 font-semibold">
              Authorized Gentrobyte Recruitment &amp; Talent Acquisition System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Company Recruiter Email
              </label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="recruiter@gentrobyte.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Access Security Key / Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder-slate-400"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <HiExclamationCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Recruiter Command Center</span>
              )}
            </button>
          </form>

          {/* Restricted Access Compliance Notice */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
            <div className="flex items-center gap-2 mb-1.5 text-slate-700 font-bold text-xs">
              <HiShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Restricted Company Access</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This terminal is strictly for authorized Gentrobyte talent acquisition officers and company reviewers. All login attempts and review actions are monitored and encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
