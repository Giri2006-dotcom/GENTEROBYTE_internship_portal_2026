'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HiShieldCheck,
  HiSearch,
  HiFilter,
  HiRefresh,
  HiDocumentText,
  HiDownload,
  HiExternalLink,
  HiEye,
  HiX,
  HiLogout,
  HiCheck,
  HiUserGroup,
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import ResumePreviewModal from './ResumePreviewModal';
import { generateApplicationPdf } from '@/lib/pdfGenerator';

interface ApplicationItem {
  applicationId: string;
  fullName: string;
  email: string;
  gender?: string;
  whatsapp?: string;
  country?: string;
  college: string;
  collegeMail?: string;
  degree: string;
  branch: string;
  graduationYear: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string;
  whyApply?: string;
  domain: string;
  resumeUrl?: string;
  resumeFileName?: string;
  status: 'Under Review' | 'Shortlisted' | 'Technical Interview' | 'Interview Scheduled' | 'Offer Extended' | 'Accepted' | 'Rejected';
  submittedAt: string;
  updatedAt: string;
  reviewerNotes?: string;
}

const ALL_STATUSES = [
  'Under Review',
  'Shortlisted',
  'Technical Interview',
  'Interview Scheduled',
  'Offer Extended',
  'Accepted',
  'Rejected',
] as const;

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, token, logout, isLoading } = useAuth();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Selected candidate for drawer inspection
  const [inspectedApp, setInspectedApp] = useState<ApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Resume Modal
  const [resumeModalData, setResumeModalData] = useState<{
    isOpen: boolean;
    fileName?: string;
    fileUrl?: string;
  }>({ isOpen: false });

  // Fetch applications callback
  const fetchApplications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve recruitment pipeline data');
      }
      setApplications(data.applications || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error loading applications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
        // Not authorized, redirect
        router.push('/recruiter/login');
      } else {
        fetchApplications();
      }
    }
  }, [isLoading, user, router, fetchApplications]);

  // Sync inspected app state
  useEffect(() => {
    if (inspectedApp) {
      setNewStatus(inspectedApp.status);
      setReviewerNotes(inspectedApp.reviewerNotes || '');
      setActionSuccess(null);
    }
  }, [inspectedApp]);

  // Handle escape key to dismiss inspected candidate drawer
  useEffect(() => {
    if (!inspectedApp) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedApp(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedApp]);

  // Derived Domains for filter
  const domains = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.domain) set.add(a.domain);
    });
    return Array.from(set);
  }, [applications]);

  // Filtered List
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchTerm === '' ||
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.domain.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDomain = selectedDomain === 'ALL' || app.domain === selectedDomain;
      const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [applications, searchTerm, selectedDomain, selectedStatus]);

  // Metrics
  const metrics = useMemo(() => {
    const total = applications.length;
    const underReview = applications.filter((a) => a.status === 'Under Review').length;
    const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
    const technical = applications.filter((a) => a.status === 'Technical Interview' || a.status === 'Interview Scheduled').length;
    const offers = applications.filter((a) => a.status === 'Offer Extended' || a.status === 'Accepted').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    return { total, underReview, shortlisted, technical, offers, rejected };
  }, [applications]);

  // Handle status update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedApp || !newStatus) return;

    setUpdating(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/applications/${inspectedApp.applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          reviewerNotes: reviewerNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      // Update in local state
      setApplications((prev) =>
        prev.map((item) =>
          item.applicationId === inspectedApp.applicationId
            ? { ...item, status: newStatus as ApplicationItem['status'], reviewerNotes, updatedAt: new Date().toISOString() }
            : item
        )
      );

      setInspectedApp((prev) =>
        prev
          ? { ...prev, status: newStatus as ApplicationItem['status'], reviewerNotes, updatedAt: new Date().toISOString() }
          : null
      );

      setActionSuccess(`Application status successfully transitioned to "${newStatus}"!`);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Error updating status: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPdf = (app: ApplicationItem) => {
    try {
      const doc = generateApplicationPdf({
        applicationId: app.applicationId,
        fullName: app.fullName,
        email: app.email,
        gender: app.gender || 'Not specified',
        whatsapp: app.whatsapp || 'Not specified',
        country: app.country || 'India',
        college: app.college,
        collegeMail: app.collegeMail || '',
        degree: app.degree,
        branch: app.branch,
        graduationYear: app.graduationYear,
        domain: app.domain,
        githubUrl: app.githubUrl || 'https://github.com',
        portfolioUrl: app.portfolioUrl || 'https://gentrobyte.com',
        skills: app.skills || 'Technical competencies verified',
        whyApply: app.whyApply || 'Applied for Gentrobyte 2026 Internship Cohort',
        status: app.status,
        submittedAt: app.submittedAt,
      });
      doc.save(`Gentrobyte-Application-${app.applicationId}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error downloading PDF receipt');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
      case 'Offer Extended':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shortlisted':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Technical Interview':
      case 'Interview Scheduled':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Verifying Recruiter Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-900 shadow-xl">
          <HiShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Company Recruiter Access Restricted</h2>
          <p className="text-xs text-slate-500 mb-6">
            Recruitment candidate pipelines are strictly managed by authorized Gentrobyte talent acquisition officers.
          </p>
          <Link
            href="/recruiter/login"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            Authenticate as Recruiter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-20 sm:pt-24">
      {/* Top Recruiter Control Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30">
              <HiShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">Gentrobyte Talent Command Center</h1>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Company Internal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Authorized Recruiter: <span className="text-indigo-600 font-bold">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 shadow-sm"
              title="Refresh Pipeline"
            >
              <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/recruiter/login');
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 flex items-center gap-1.5 shadow-sm"
            >
              <HiLogout className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Overview Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Pipeline</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.total}</span>
              <span className="text-[11px] font-semibold text-slate-400">Applications</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-amber-400 hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Under Review</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.underReview}</span>
              <span className="text-[11px] font-semibold text-slate-400">Screening</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-sky-400 hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Shortlisted</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-sky-600">{metrics.shortlisted}</span>
              <span className="text-[11px] font-semibold text-slate-400">Selected</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-purple-400 hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Technical Round</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-600">{metrics.technical}</span>
              <span className="text-[11px] font-semibold text-slate-400">Interviews</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-emerald-400 hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Offer / Accepted</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.offers}</span>
              <span className="text-[11px] font-semibold text-slate-400">Hired</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-rose-400 hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rejected</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">{metrics.rejected}</span>
              <span className="text-[11px] font-semibold text-slate-400">Closed</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Candidate Name, Application ID, Email, College..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Domain Filter */}
            <div className="relative w-1/2 md:w-52">
              <HiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-indigo-600 transition-colors"
              >
                <option value="ALL">All Domains ({applications.length})</option>
                {domains.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative w-1/2 md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-indigo-600 transition-colors"
              >
                <option value="ALL">All Statuses</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table of Candidates */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <HiUserGroup className="w-4 h-4 text-indigo-600" />
              Candidate Applications ({filteredApps.length})
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Click candidate row or Inspect icon to manage status
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing candidate pipeline...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 font-semibold text-sm">
              <p>{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <HiDocumentText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No applications match your criteria</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting search filters or keywords</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">ID & Date</th>
                    <th className="py-3.5 px-6">Candidate</th>
                    <th className="py-3.5 px-6">Domain Track</th>
                    <th className="py-3.5 px-6">Education</th>
                    <th className="py-3.5 px-6">Recruitment Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredApps.map((app) => (
                    <tr
                      key={app.applicationId}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setInspectedApp(app)}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                          {app.applicationId}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {new Date(app.submittedAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {app.fullName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium truncate max-w-xs">{app.email}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                          {app.domain}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-slate-800">
                          {app.degree} {app.branch ? `• ${app.branch}` : ''}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {app.college} ({app.graduationYear})
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          ● {app.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setInspectedApp(app)}
                            className="p-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl transition-all border border-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center shadow-sm"
                            title="Inspect Candidate & Update Status"
                            aria-label={`Inspect candidate ${app.fullName} and update pipeline status`}
                          >
                            <HiEye className="w-4 h-4" />
                          </button>
                          {app.resumeUrl && (
                            <button
                              onClick={() =>
                                setResumeModalData({
                                  isOpen: true,
                                  fileName: app.resumeFileName || 'Resume.pdf',
                                  fileUrl: app.resumeUrl,
                                })
                              }
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center shadow-sm"
                              title="View Uploaded Resume"
                              aria-label={`View uploaded resume for ${app.fullName}`}
                            >
                              <HiDocumentText className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPdf(app)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center shadow-sm"
                            title="Download PDF Receipt"
                            aria-label={`Download official application PDF receipt for ${app.fullName}`}
                          >
                            <HiDownload className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Inspection & Status Updater Modal Drawer */}
      {inspectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="recruiter-drawer-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-slate-950 px-5 sm:px-8 py-4 sm:py-5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                <span className="font-mono text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-2.5 sm:px-3 py-1 rounded-lg shrink-0">
                  {inspectedApp.applicationId}
                </span>
                <div className="min-w-0">
                  <h3 id="recruiter-drawer-title" className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                    {inspectedApp.fullName}
                  </h3>
                  <p className="text-xs text-indigo-400 font-medium truncate">Domain: {inspectedApp.domain}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectedApp(null)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                aria-label="Close candidate review panel"
              >
                <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Recruiter Decision Panel */}
              <div className="bg-indigo-950/30 border border-indigo-900/60 rounded-2xl p-5 shadow-lg">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
                  <HiShieldCheck className="w-4 h-4 text-indigo-400" />
                  Recruitment Pipeline Transition & Decision
                </h4>

                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Pipeline Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Quick Actions
                      </label>
                      <div className="flex items-center gap-2">
                        {inspectedApp.resumeUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setResumeModalData({
                                isOpen: true,
                                fileName: inspectedApp.resumeFileName || 'Resume.pdf',
                                fileUrl: inspectedApp.resumeUrl,
                              })
                            }
                            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <HiDocumentText className="w-4 h-4 text-indigo-400" />
                            <span>View Resume</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(inspectedApp)}
                          className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <HiDownload className="w-4 h-4 text-indigo-400" />
                          <span>PDF Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Recruiter Feedback / Evaluation Notes (Broadcasted to candidate on track page)
                    </label>
                    <textarea
                      rows={2}
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="e.g. Cleared Stage 1 coding review with distinction. Technical round scheduled for Monday."
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                    />
                  </div>

                  {actionSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                      <HiCheck className="w-4 h-4 text-emerald-400" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
                    >
                      {updating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating Pipeline...</span>
                        </>
                      ) : (
                        <span>Save Status & Broadcast</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">1. Personal Profile</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Full Name</span>
                    <span className="font-bold text-white">{inspectedApp.fullName}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Primary Email</span>
                    <span className="font-bold text-white truncate block">{inspectedApp.email}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">WhatsApp / Phone</span>
                    <span className="font-bold text-white">{inspectedApp.whatsapp || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Gender</span>
                    <span className="font-bold text-white">{inspectedApp.gender || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Country</span>
                    <span className="font-bold text-white">{inspectedApp.country || 'India'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Submission Timestamp</span>
                    <span className="font-bold text-white">
                      {new Date(inspectedApp.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">2. Academic Credentials</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 col-span-2">
                    <span className="text-slate-400 font-semibold block">Institution</span>
                    <span className="font-bold text-white">{inspectedApp.college}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">College Mail</span>
                    <span className="font-bold text-white truncate block">{inspectedApp.collegeMail || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Degree</span>
                    <span className="font-bold text-white">{inspectedApp.degree}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Branch</span>
                    <span className="font-bold text-white">{inspectedApp.branch || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block">Graduation Year</span>
                    <span className="font-bold text-white">Class of {inspectedApp.graduationYear}</span>
                  </div>
                </div>
              </div>

              {/* Professional Links */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">3. Candidate Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 font-semibold block">GitHub</span>
                      <span className="font-bold text-white truncate block max-w-xs">{inspectedApp.githubUrl || 'N/A'}</span>
                    </div>
                    {inspectedApp.githubUrl && (
                      <a
                        href={inspectedApp.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 p-1"
                      >
                        <HiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 font-semibold block">Portfolio / Demos</span>
                      <span className="font-bold text-white truncate block max-w-xs">{inspectedApp.portfolioUrl || 'N/A'}</span>
                    </div>
                    {inspectedApp.portfolioUrl && (
                      <a
                        href={inspectedApp.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 p-1"
                      >
                        <HiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills & Motivation */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">4. Skills & Motivation</h4>
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold block uppercase text-[10px] mb-1">Stated Skills</span>
                    <p className="font-medium text-slate-200">{inspectedApp.skills || 'None provided'}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold block uppercase text-[10px] mb-1">Why Gentrobyte</span>
                    <p className="font-medium text-slate-200">{inspectedApp.whyApply || 'None provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-6 sm:px-8 py-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectedApp(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Modal */}
      <ResumePreviewModal
        isOpen={resumeModalData.isOpen}
        onClose={() => setResumeModalData({ isOpen: false })}
        fileName={resumeModalData.fileName}
        fileUrl={resumeModalData.fileUrl}
      />
    </div>
  );
}
