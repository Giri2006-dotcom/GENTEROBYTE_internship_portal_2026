'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiUser,
  HiMail,
  HiLockClosed,
  HiArrowLeft,
  HiExclamationCircle,
  HiCheckCircle,
  HiKey,
  HiShieldCheck,
} from 'react-icons/hi';
import { useAuth, AuthUser } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    if (!name || name.trim().length < 2) {
      setError('Please enter your full legal name first.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: 'signup',
          name: name.trim(),
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: { success?: boolean; message?: string } = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.status === 502 || res.status === 504 || res.status === 503
            ? 'The server is currently starting up or restarting. Please try again in 15 seconds.'
            : text.replace(/<[^>]*>?/gm, '').trim().substring(0, 150) || `Server error (${res.status})`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch verification code.');
      }

      setOtpSent(true);
      setOtpTimer(60);
      setSuccessMsg(data.message || `A 6-digit verification code has been dispatched directly to your inbox (${email.trim()}).`);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!otp.trim()) {
      setError('Please verify your email address with the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          password: password.trim() || undefined,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: { success?: boolean; message?: string; token?: string; user?: AuthUser } = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.status === 502 || res.status === 504 || res.status === 503
            ? 'The server is temporarily starting up. Please try again in 15 seconds.'
            : text.replace(/<[^>]*>?/gm, '').trim().substring(0, 150) || `Server error (${res.status})`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please verify the code.');
      }

      if (data.token && data.user) {
        login(data.token, data.user);
      }
      router.push('/apply');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Registration error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold text-navy-400 hover:text-white mb-6 transition-colors"
        >
          <HiArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40">
          {/* Main Auth Tabs (Sign In / Sign Up) */}
          <div className="grid grid-cols-2 p-1 bg-navy-950 rounded-2xl border border-navy-800 mb-6">
            <Link
              href="/login"
              className="py-2.5 text-center text-xs font-bold rounded-xl text-navy-400 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <span className="py-2.5 text-center text-xs font-bold rounded-xl bg-primary-600 text-white shadow-md">
              Sign Up
            </span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Create Candidate Account</h1>
            <p className="text-xs text-navy-400 mt-1 font-medium">
              Join the Gentrobyte 2026 Internship Cohort & verify your identity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-300 mb-2">
                Full Legal Name <span className="text-accent-400">*</span>
              </label>
              <div className="relative">
                <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-navy-950 border border-navy-700 rounded-xl text-white text-base sm:text-sm font-medium focus:border-accent-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-300 mb-2">
                Primary Email Address <span className="text-accent-400">*</span>
              </label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john.doe@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-navy-950 border border-navy-700 rounded-xl text-white text-base sm:text-sm font-medium focus:border-accent-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy-300">
                  Email Verification Code <span className="text-accent-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || otpTimer > 0}
                  className="text-xs font-bold text-accent-400 hover:text-accent-300 disabled:opacity-50 transition-colors"
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : otpSent ? 'Resend Code' : 'Send Code'}
                </button>
              </div>
              <div className="relative">
                <HiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 w-5 h-5" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full pl-11 pr-4 py-3 bg-navy-950 border border-navy-700 rounded-xl text-white text-base sm:text-sm font-mono tracking-widest font-bold focus:border-accent-400 outline-none transition-all"
                />
              </div>
              {otpSent && (
                <div className="mt-2.5 p-3 rounded-xl bg-primary-950/80 border border-primary-500/40 text-xs text-primary-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-400 animate-ping shrink-0"></span>
                  <span>Verification code dispatched to <strong className="text-white">{email}</strong>. Please check your email inbox and spam folder.</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-300 mb-2">
                Create Account Password (Optional)
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••• (leave empty for passwordless)"
                  className="w-full pl-11 pr-4 py-3 bg-navy-950 border border-navy-700 rounded-xl text-white text-base sm:text-sm font-medium focus:border-accent-400 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-navy-500 mt-1">
                You can always log in with instant email OTP verification.
              </p>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-green-950/60 border border-green-800 text-green-300 text-xs font-semibold flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 shrink-0 text-green-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-start gap-2">
                <HiExclamationCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register & Proceed to Apply</span>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-navy-800 flex flex-col space-y-3 text-center text-xs">
            <p className="text-navy-400">
              Already have an account?{' '}
              <Link href="/login" className="text-accent-400 hover:text-accent-300 font-bold transition-colors">
                Sign In to Candidate Portal
              </Link>
            </p>

            <div className="pt-2">
              <Link
                href="/recruiter/login"
                className="inline-flex items-center gap-1.5 text-navy-400 hover:text-white font-medium transition-colors p-2 rounded-xl bg-navy-950 border border-navy-800"
              >
                <HiShieldCheck className="w-4 h-4 text-accent-400" />
                <span>Authorized Recruiter Access →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

