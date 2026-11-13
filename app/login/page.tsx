'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiMail,
  HiLockClosed,
  HiArrowLeft,
  HiExclamationCircle,
  HiShieldCheck,
  HiCheckCircle,
  HiKey,
} from 'react-icons/hi';
import { useAuth, AuthUser } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<'otp' | 'password'>('otp');
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
        body: JSON.stringify({ email: email.trim().toLowerCase(), purpose: 'signin' }),
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
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, string> = { email: email.trim().toLowerCase() };
      if (mode === 'otp') {
        if (!otp.trim()) {
          throw new Error('Please enter the 6-digit verification code sent to your email.');
        }
        payload.otp = otp.trim();
      } else {
        if (!password) {
          throw new Error('Please enter your account password.');
        }
        payload.password = password;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: { success?: boolean; message?: string; token?: string; user?: AuthUser } = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.status === 502 || res.status === 504 || res.status === 503
            ? 'The server is currently restarting. Please try again in 15 seconds.'
            : text.replace(/<[^>]*>?/gm, '').trim().substring(0, 150) || `Server error (${res.status})`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please verify your details.');
      }

      if (data.token && data.user) {
        login(data.token, data.user);
      }

      if (data.user?.role === 'recruiter') {
        router.push('/recruiter');
      } else {
        router.push('/track');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Authentication error.');
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
            <span className="py-2.5 text-center text-xs font-bold rounded-xl bg-primary-600 text-white shadow-md">
              Sign In
            </span>
            <Link
              href="/signup"
              className="py-2.5 text-center text-xs font-bold rounded-xl text-navy-400 hover:text-white transition-all"
            >
              Sign Up
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Candidate Portal Login</h1>
            <p className="text-xs text-navy-400 mt-1 font-medium">
              Access your applications, track recruitment stages, and manage documents.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-navy-950 p-1 rounded-2xl border border-navy-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('otp');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'otp'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              Email OTP Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'password'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              Password Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-300 mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-navy-950 border border-navy-700 rounded-xl text-white text-base sm:text-sm font-medium focus:border-accent-400 outline-none transition-all"
                />
              </div>
            </div>

            {mode === 'otp' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy-300">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpTimer > 0}
                    className="text-xs font-bold text-accent-400 hover:text-accent-300 disabled:opacity-50 transition-colors"
                  >
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : otpSent ? 'Resend OTP' : 'Send Code'}
                  </button>
                </div>
                <div className="relative">
                  <HiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 w-5 h-5" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-300 mb-2">
                  Account Password
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-navy-950 border border-navy-700 rounded-xl text-white text-base sm:text-sm font-medium focus:border-accent-400 outline-none transition-all"
                  />
                </div>
              </div>
            )}

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
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Sign In to Candidate Portal</span>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-navy-800 flex flex-col space-y-3 text-center text-xs">
            <p className="text-navy-400">
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" className="text-accent-400 hover:text-accent-300 font-bold transition-colors">
                Sign Up & Apply Now
              </Link>
            </p>

            <div className="pt-2">
              <Link
                href="/recruiter/login"
                className="inline-flex items-center gap-1.5 text-navy-400 hover:text-white font-medium transition-colors p-2 rounded-xl bg-navy-950 border border-navy-800"
              >
                <HiShieldCheck className="w-4 h-4 text-accent-400" />
                <span>Company Recruiter Portal Login →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

