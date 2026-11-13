'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  HiSearch,
  HiCheckCircle,
  HiClock,
  HiDocumentText,
  HiAcademicCap,
  HiMail,
  HiClipboardCopy,
  HiArrowLeft,
  HiExclamationCircle,
  HiDownload,
  HiExternalLink,
  HiShieldCheck,
  HiUser,
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import ResumePreviewModal from './ResumePreviewModal';
import { generateApplicationPdf } from '@/lib/pdfGenerator';

interface TrackedApplication {
  applicationId: string;
  fullName: string;
  email: string;
  domain: string;
  college: string;
  collegeMail?: string;
  degree: string;
  branch: string;
  graduationYear: string;
  gender?: string;
  whatsapp?: string;
  country?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string;
  whyApply?: string;
  status: 'Under Review' | 'Shortlisted' | 'Technical Interview' | 'Interview Scheduled' | 'Offer Extended' | 'Accepted' | 'Rejected';
  submittedAt: string;
  updatedAt: string;
  resumeFileName?: string;
  resumeUrl?: string;
  reviewerNotes?: string;
}

export default function TrackApplication() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || '';

  const [applicationId, setApplicationId] = useState(initialId);
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<TrackedApplication | null>(null);
  const [userApplications, setUserApplications] = useState<TrackedApplication[]>([]);
  const [copied, setCopied] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Real-time Live Updates
  const [liveSync, setLiveSync] = useState(true);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Auto-fill user email when logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // Load candidate's own applications if logged in
  useEffect(() => {
    if (token && user?.role === 'applicant') {
      fetch('/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.applications)) {
            setUserApplications(data.applications);
            if (!initialId && data.applications.length > 0) {
              setApplication(data.applications[0]);
              setApplicationId(data.applications[0].applicationId);
            }
          }
        })
        .catch(() => {});
    }
  }, [token, user, initialId]);

  const fetchStatus = useCallback(
    async (idToFetch: string, emailToFetch?: string, isQuiet = false) => {
      if (!idToFetch.trim()) {
        if (!isQuiet) setError('Please enter your Application ID');
        return;
      }

      if (!isQuiet) {
        setLoading(true);
        setError(null);
      }

      try {
        const url = `/api/applications/${encodeURIComponent(idToFetch.trim())}${
          emailToFetch?.trim() ? `?email=${encodeURIComponent(emailToFetch.trim())}` : ''
        }`;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (!isQuiet) throw new Error(data.message || 'No application found with the provided details');
          return;
        }

        const fresh = data.application as TrackedApplication;
        setApplication((prev) => {
          if (prev && prev.status !== fresh.status) {
            setStatusToast(`⚡ Real-Time Update: Recruitment status updated to "${fresh.status}"!`);
            setTimeout(() => setStatusToast(null), 6000);
          }
          return fresh;
        });
      } catch (err: unknown) {
        const error = err as Error;
        if (!isQuiet) {
          setError(error.message || 'Failed to retrieve application status');
          setApplication(null);
        }
      } finally {
        if (!isQuiet) setLoading(false);
      }
    },
    [token]
  );

  // Real-time Polling Hook (Pushes live updates every 8 seconds)
  useEffect(() => {
    if (!application?.applicationId || !liveSync) return;

    const interval = setInterval(() => {
      fetchStatus(application.applicationId, application.email, true);
    }, 8000);

    return () => clearInterval(interval);
  }, [application?.applicationId, application?.email, liveSync, fetchStatus]);

  useEffect(() => {
    if (initialId) {
      setApplicationId(initialId);
      fetchStatus(initialId, email);
    }
  }, [initialId, email, fetchStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(applicationId, email);
  };

  const copyId = () => {
    if (!application) return;
    navigator.clipboard.writeText(application.applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!application) return;
    try {
      const doc = generateApplicationPdf({
        applicationId: application.applicationId,
        fullName: application.fullName,
        email: application.email,
        gender: application.gender || 'Not specified',
        whatsapp: application.whatsapp || 'Not specified',
        country: application.country || 'India',
        college: application.college,
        collegeMail: application.collegeMail || '',
        degree: application.degree,
        branch: application.branch,
        graduationYear: application.graduationYear,
        domain: application.domain,
        githubUrl: application.githubUrl || 'https://github.com',
        portfolioUrl: application.portfolioUrl || 'https://gentrobyte.com',
        skills: application.skills || 'Technical competencies verified',
        whyApply: application.whyApply || 'Applied for Gentrobyte 2026 Internship Cohort',
        status: application.status,
        submittedAt: application.submittedAt,
      });
      doc.save(`Gentrobyte-Application-${application.applicationId}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error generating application PDF receipt.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
      case 'Offer Extended':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Shortlisted':
      case 'Technical Interview':
      case 'Interview Scheduled':
        return 'bg-primary-100 text-primary-800 border-primary-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const stages = [
    { title: 'Application Submitted', desc: 'Application received & logged in portal' },
    { title: 'Initial Screening', desc: 'Academic background & criteria review' },
    { title: 'Technical Evaluation', desc: 'Code portfolio & technical motivation assessment' },
    { title: 'Final Decision', desc: 'Interview invite or admissions decision' },
  ];

  const getActiveStageIndex = (status: string) => {
    switch (status) {
      case 'Under Review':
        return 1;
      case 'Shortlisted':
      case 'Technical Interview':
      case 'Interview Scheduled':
        return 2;
      case 'Offer Extended':
      case 'Accepted':
      case 'Rejected':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = application ? getActiveStageIndex(application.status) : 0;

  return (
    <div className="min-h-screen bg-navy-50/50 py-16 sm:py-24 pt-28 sm:pt-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Company Recruiter Indicator (if logged in as recruiter) */}
        {user?.role === 'recruiter' && (
          <div className="mb-6 p-4 bg-navy-900 text-white rounded-2xl flex items-center justify-between border border-primary-500/30">
            <div className="flex items-center space-x-3">
              <HiShieldCheck className="w-6 h-6 text-accent-400" />
              <div>
                <p className="text-sm font-bold">Authorized Company Recruiter View</p>
                <p className="text-xs text-navy-300">Recruitment management is centralized in the Recruiter Portal.</p>
              </div>
            </div>
            <Link
              href="/recruiter"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              Open Recruiter Dashboard →
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-bold text-navy-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
            Track Application <span className="text-primary-600">Status</span>
          </h1>
          <p className="text-base sm:text-lg text-navy-600 max-w-2xl mx-auto font-medium">
            Enter your unique Application ID and registered email to check your live recruitment status.
          </p>
        </div>

        {/* Authentication Options Banner for Guests */}
        {!user && (
          <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-navy-900 to-primary-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 text-center sm:text-left">
              <div className="w-10 h-10 rounded-2xl bg-primary-600/30 border border-primary-500/40 text-primary-300 flex items-center justify-center shrink-0">
                <HiUser className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Sign In to See All Your Applications</p>
                <p className="text-[11px] sm:text-xs text-navy-300">
                  Authenticate to automatically load your submitted applications without entering your ID each time.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-center">
              <Link
                href="/login"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-all shadow-md text-center flex-1 sm:flex-none"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all text-center flex-1 sm:flex-none"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Candidate's Own Applications Quick Switcher */}
        {userApplications.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-6 border border-navy-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-navy-500 uppercase tracking-wider">
              Your Applications ({userApplications.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {userApplications.map((app) => (
                <button
                  key={app.applicationId}
                  onClick={() => {
                    setApplication(app);
                    setApplicationId(app.applicationId);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    application?.applicationId === app.applicationId
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-navy-50 text-navy-700 border-navy-200 hover:bg-navy-100'
                  }`}
                >
                  {app.domain} ({app.applicationId})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-navy-900/5 border border-navy-100 p-6 sm:p-10 mb-10">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="searchAppId" className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-2">
                Application ID <span className="text-accent-500">*</span>
              </label>
              <input
                id="searchAppId"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                placeholder="e.g. GB-2026-XXXXX"
                required
                className="w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl focus:border-primary-500 outline-none text-navy-900 text-base sm:text-sm font-mono font-bold uppercase tracking-wider transition-all"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="searchEmail" className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-2">
                Registered Email <span className="text-accent-500">*</span>
              </label>
              <input
                id="searchEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl focus:border-primary-500 outline-none text-navy-900 text-base sm:text-sm font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-navy-900 hover:bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-navy-900/10 active:scale-95 disabled:bg-navy-300"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <HiSearch className="w-5 h-5" />
                  <span>Check Status</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3 text-sm font-semibold">
              <HiExclamationCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Status Result Card */}
        {application && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-navy-900/10 border border-navy-100 overflow-hidden animate-in fade-in duration-500">
            {/* Real-time Status Alert Banner */}
            {statusToast && (
              <div className="bg-gradient-to-r from-accent-500 to-primary-600 text-white px-6 py-3 text-sm font-bold flex items-center justify-between shadow-md">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                  {statusToast}
                </span>
                <button
                  onClick={() => setStatusToast(null)}
                  className="text-white/80 hover:text-white font-bold text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Card Header */}
            <div className="bg-navy-900 p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-xs sm:text-sm font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/10 flex items-center space-x-2">
                      <span>{application.applicationId}</span>
                      <button
                        onClick={copyId}
                        className="text-navy-300 hover:text-white transition-colors"
                        title="Copy Application ID"
                        aria-label="Copy Application ID"
                      >
                        <HiClipboardCopy className="w-4 h-4" />
                      </button>
                    </span>
                    {copied && <span className="text-xs text-green-400 font-bold">Copied!</span>}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{application.fullName}</h2>
                  <p className="text-primary-300 text-sm font-medium mt-1">Domain: {application.domain}</p>
                </div>

                <div className="sm:text-right flex flex-col sm:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(
                        application.status
                      )}`}
                    >
                      ● {application.status}
                    </span>
                    <button
                      onClick={() => setLiveSync(!liveSync)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border transition-all ${
                        liveSync
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-white/10 text-navy-400 border-white/10'
                      }`}
                      title={liveSync ? 'Live updates active' : 'Live updates paused'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${liveSync ? 'bg-green-400 animate-pulse' : 'bg-navy-400'}`}></span>
                      {liveSync ? 'Live Sync' : 'Paused'}
                    </button>
                  </div>
                  <p className="text-navy-400 text-xs">
                    Submitted: {new Date(application.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/10 mt-1"
                  >
                    <HiDownload className="w-3.5 h-3.5 text-accent-400" />
                    <span>Download Official PDF Receipt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="p-6 sm:p-10 border-b border-navy-100 bg-navy-50/30">
              <h3 className="text-xs font-black uppercase tracking-widest text-navy-400 mb-6">
                Recruitment Pipeline Progress
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-navy-200 -translate-y-1/2 z-0"></div>
                <div
                  className="hidden sm:block absolute top-1/2 left-0 h-1 bg-primary-600 -translate-y-1/2 transition-all duration-700 z-0"
                  style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                ></div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
                  {stages.map((stage, idx) => {
                    const isCompleted = idx < activeIndex || (idx === activeIndex && application.status === 'Accepted');
                    const isCurrent = idx === activeIndex && application.status !== 'Accepted';
                    return (
                      <div key={idx} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center space-x-4 sm:space-x-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 sm:mb-3 shadow-md ${
                            isCompleted
                              ? 'bg-green-500 text-white shadow-green-500/20'
                              : isCurrent
                              ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-primary-600/30 animate-pulse'
                              : 'bg-white text-navy-400 border-2 border-navy-200'
                          }`}
                        >
                          {isCompleted ? <HiCheckCircle className="w-6 h-6" /> : isCurrent ? <HiClock className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isCurrent ? 'text-primary-700' : 'text-navy-900'}`}>
                            {stage.title}
                          </p>
                          <p className="text-[11px] text-navy-500 mt-1 leading-snug">{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviewer Notes Banner if Present */}
            {application.reviewerNotes && (
              <div className="mx-6 sm:mx-10 mt-6 p-4 rounded-2xl bg-primary-50 border border-primary-200 text-primary-900">
                <p className="text-xs font-black uppercase tracking-wider text-primary-700 mb-1">
                  Company Recruitment Team Notes & Next Steps
                </p>
                <p className="text-sm font-medium">{application.reviewerNotes}</p>
              </div>
            )}

            {/* Application Overview Details */}
            <div className="p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="bg-navy-50 p-5 rounded-2xl border border-navy-100">
                <div className="flex items-center space-x-2 text-primary-600 font-bold mb-2">
                  <HiAcademicCap className="w-5 h-5" />
                  <span>Education</span>
                </div>
                <p className="font-bold text-navy-900">{application.degree} {application.branch ? `• ${application.branch}` : ''}</p>
                <p className="text-xs text-navy-600 mt-0.5">{application.college}</p>
                <p className="text-xs text-navy-400 mt-1 font-semibold">Class of {application.graduationYear}</p>
              </div>

              <div className="bg-navy-50 p-5 rounded-2xl border border-navy-100">
                <div className="flex items-center space-x-2 text-primary-600 font-bold mb-2">
                  <HiMail className="w-5 h-5" />
                  <span>Contact Information</span>
                </div>
                <p className="font-bold text-navy-900 truncate">{application.email}</p>
                <p className="text-xs text-navy-500 mt-1">Status notifications sent to this email</p>
              </div>

              <div className="bg-navy-50 p-5 rounded-2xl border border-navy-100">
                <div className="flex items-center space-x-2 text-primary-600 font-bold mb-2">
                  <HiDocumentText className="w-5 h-5" />
                  <span>Submitted Resume</span>
                </div>
                <p className="font-bold text-navy-900 truncate">
                  {application.resumeFileName || 'Resume Document'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-green-600 font-bold">✓ Stored Securely</span>
                  {application.resumeUrl ? (
                    <button
                      type="button"
                      onClick={() => setShowResumeModal(true)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-800 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Document</span>
                      <HiExternalLink className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-navy-400">Attached</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Support Info */}
            <div className="bg-white px-6 sm:px-10 py-5 border-t border-navy-100 flex flex-col sm:flex-row justify-between items-center text-xs text-navy-500 gap-3">
              <span>Have an update or questions regarding your application?</span>
              <a
                href="mailto:internships@gentrobyte.com"
                className="font-bold text-primary-600 hover:text-primary-700 underline"
              >
                internships@gentrobyte.com
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Resume Document Preview Modal */}
      <ResumePreviewModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        fileName={application?.resumeFileName || 'Resume.pdf'}
        fileUrl={application?.resumeUrl}
      />
    </div>
  );
}
