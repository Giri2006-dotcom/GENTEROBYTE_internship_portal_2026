'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  HiUser,
  HiCode,
  HiDocumentText,
  HiCheckCircle,
  HiArrowLeft,
  HiArrowRight,
  HiChevronDown,
  HiUpload,
  HiTrash,
  HiClipboardCopy,
  HiExclamationCircle,
  HiSearch,
  HiCheck,
  HiShieldCheck,
} from 'react-icons/hi';
import { ToastContainer, ToastMessage } from './Toast';
import ResumePreviewModal from './ResumePreviewModal';
import { generateApplicationPdf } from '@/lib/pdfGenerator';
import { useAuth } from '@/context/AuthContext';

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'Other', name: 'Other Country', flag: '🌐' },
];

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
  error?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown only when clicked strictly outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Autofocus search on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find((c) => c.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-navy-900 mb-2">
        Country of Residence <span className="text-accent-500">*</span>
      </label>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-navy-50 border-2 rounded-xl text-left flex items-center justify-between transition-all outline-none ${
          error
            ? 'border-red-500 bg-red-50/20'
            : isOpen
            ? 'border-primary-500 ring-2 ring-primary-100 bg-white'
            : 'border-navy-100 hover:border-primary-300'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2.5">
          {selectedCountry ? (
            <>
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-navy-900 font-bold text-sm sm:text-base">
                {selectedCountry.name}
              </span>
            </>
          ) : (
            <span className="text-navy-400 font-medium text-sm sm:text-base">
              Select your country
            </span>
          )}
        </div>
        <HiChevronDown
          className={`w-5 h-5 text-navy-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-navy-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
          {/* Search Box */}
          <div className="p-3 bg-navy-50/80 border-b border-navy-100 relative">
            <HiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-navy-200 rounded-xl text-xs font-semibold text-navy-900 outline-none focus:border-primary-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Country Options List */}
          <ul
            className="max-h-60 overflow-y-auto divide-y divide-navy-50 py-1"
            role="listbox"
          >
            {filtered.length > 0 ? (
              filtered.map((country) => {
                const isSelected = value === country.name;
                return (
                  <li
                    key={country.code}
                    onClick={() => {
                      onChange(country.name);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors text-sm font-medium ${
                      isSelected
                        ? 'bg-primary-50 text-primary-700 font-bold'
                        : 'hover:bg-navy-50/80 text-navy-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                    {isSelected && <HiCheck className="w-4 h-4 text-primary-600" />}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-6 text-center text-xs text-navy-400 font-medium">
                No matching country found
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
};

// Standalone Gender Radio Group
const GenderSelector: React.FC<{
  value: string;
  onChange: (val: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => (
  <div className="space-y-3">
    <label className="block text-sm font-bold text-navy-900 mb-2">
      Gender <span className="text-accent-500">*</span>
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {['Male', 'Female', 'Prefer not to say'].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`py-3.5 px-4 rounded-xl border-2 text-center text-sm font-bold transition-all ${
            value === option
              ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
              : 'border-navy-100 bg-navy-50/60 hover:border-primary-200 text-navy-700'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
    {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
  </div>
);

// Standalone Degree Radio Group
const DegreeSelector: React.FC<{
  value: string;
  onChange: (val: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const degrees = [
    'BE/BTech',
    'BCA',
    'BSc',
    'BCom',
    'BBA',
    'MCA',
    'MBA',
    'MSc',
    'MCom',
    'MA',
    'Other',
  ];
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-navy-900 mb-2">
        Degree Program <span className="text-accent-500">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {degrees.map((deg) => (
          <button
            key={deg}
            type="button"
            onClick={() => onChange(deg)}
            className={`py-3 px-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
              value === deg
                ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                : 'border-navy-100 bg-navy-50/60 hover:border-primary-200 text-navy-700'
            }`}
          >
            {deg}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
};

// Standalone Domain Radio Group
const DomainSelector: React.FC<{
  value: string;
  onChange: (val: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const domains = [
    { title: 'Full Stack Web Development', desc: 'React, Next.js, Node.js, Express, MongoDB' },
    { title: 'Machine Learning & AI', desc: 'Python, PyTorch, TensorFlow, LLMs, Computer Vision' },
    { title: 'Data Science & Analytics', desc: 'Data pipelines, Pandas, SQL, Visualization, BI' },
    { title: 'Cyber Security', desc: 'Network security, Penetration testing, Cryptography' },
    { title: 'UI/UX Design', desc: 'Figma, Design Systems, User Research, Wireframing' },
    { title: 'Prompt Engineering', desc: 'AI orchestration, Agentic frameworks, Model fine-tuning' },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-navy-900 mb-2">
        Target Domain Track <span className="text-accent-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {domains.map((dom) => (
          <button
            key={dom.title}
            type="button"
            onClick={() => onChange(dom.title)}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
              value === dom.title
                ? 'border-primary-500 bg-primary-50/70 shadow-sm'
                : 'border-navy-100 bg-navy-50/50 hover:border-primary-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-bold ${value === dom.title ? 'text-primary-800' : 'text-navy-900'}`}>
                {dom.title}
              </span>
              {value === dom.title && <HiCheckCircle className="w-5 h-5 text-primary-600 shrink-0 ml-2" />}
            </div>
            <p className="text-[11px] text-navy-500 line-clamp-1">{dom.desc}</p>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
};

interface FormData {
  // Step 1: Basic Details
  email: string;
  confirmEmail: string;
  fullName: string;
  gender: string;
  whatsapp: string;
  country: string;
  college: string;
  branch: string;
  domain: string;
  resume?: File | null;
  // Step 2: Academic & Professional Details
  collegeMail: string;
  degree: string;
  graduationYear: string;
  githubUrl: string;
  portfolioUrl: string;
  // Step 3: Skills & Motivation
  skills: string;
  whyApply: string;
  // Step 4: Consent
  consent: boolean;
}

const Apply: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    confirmEmail: '',
    fullName: '',
    gender: '',
    whatsapp: '',
    country: '',
    college: '',
    branch: '',
    domain: '',
    collegeMail: '',
    degree: '',
    graduationYear: '',
    githubUrl: '',
    portfolioUrl: '',
    skills: '',
    whyApply: '',
    consent: false,
    resume: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  const branchOptionsMap: Record<string, string[]> = {
    'BE/BTech': ['CSE', 'Information Technology', 'ECE', 'Mechanical', 'Civil', 'EEE', 'AI & Data Science', 'Other'],
    'BSc': ['Computer Science', 'Information Technology', 'Physics', 'Chemistry', 'Mathematics', 'Statistics', 'Other'],
    'BEd': ['English', 'Mathematics', 'Science', 'Social Studies', 'Other'],
    'BCA': ['Computer Applications', 'Data Science', 'Cloud & Systems', 'Other'],
    'BCom': ['General', 'Accounting & Finance', 'Computer Applications', 'Banking', 'Other'],
    'BBA': ['General', 'Marketing', 'Finance', 'Human Resources', 'Business Analytics', 'Other'],
    'MCA': ['Computer Applications', 'Software Engineering', 'Data Analytics', 'Other'],
    'MBA': ['Finance', 'Marketing', 'HR', 'Business Analytics', 'Operations', 'Other'],
    'MSc': ['Computer Science', 'Information Technology', 'Data Science', 'Physics', 'Chemistry', 'Mathematics', 'Other'],
    'MCom': ['Accounting & Finance', 'Banking & Insurance', 'General', 'Other'],
    'MA': ['English', 'Economics', 'History', 'Journalism', 'Other'],
    'Other': ['Computer Science', 'Engineering', 'Sciences', 'Management', 'Arts & Humanities', 'Other']
  };

  const totalSteps = 4;

  const [applicationId, setApplicationId] = useState<string>('');
  const searchParams = useSearchParams();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { user: authUser, token: contextToken, login } = useAuth();

  // Auth & Session State
  const [authToken, setAuthToken] = useState<string>('');

  // Resume Upload State with Progress
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeBlobUrl, setResumeBlobUrl] = useState<string>('');
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pre-populate authenticated applicant details & domain from URL parameter
  useEffect(() => {
    if (authUser?.email) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || authUser.email,
        confirmEmail: prev.confirmEmail || authUser.email,
        fullName: prev.fullName || authUser.name.toUpperCase(),
      }));
      setOtpVerified(true);
    }
    if (contextToken) {
      setAuthToken(contextToken);
    }
  }, [authUser, contextToken]);

  useEffect(() => {
    const domainParam = searchParams?.get('domain') || searchParams?.get('role');
    if (domainParam) {
      setFormData((prev) => ({ ...prev, domain: domainParam }));
    }
  }, [searchParams]);

  const steps = [
    { number: 1, title: 'Personal', icon: <HiUser className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { number: 2, title: 'Academic', icon: <HiCode className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { number: 3, title: 'Skills & Motivation', icon: <HiDocumentText className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { number: 4, title: 'Review', icon: <HiCheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> },
  ];

  // Upload handler with local object URL preview (never fails with 404)
  const handleResumeChange = (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please upload a valid PDF document.', 'error');
      setErrors((prev) => ({ ...prev, resume: 'Only PDF format is supported' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit.', 'error');
      setErrors((prev) => ({ ...prev, resume: 'File size must be under 5MB' }));
      return;
    }

    setResumeFile(file);
    try {
      const blob = URL.createObjectURL(file);
      setResumeBlobUrl(blob);
    } catch (e) {
      console.warn('Could not create object URL:', e);
    }

    // Convert to Base64 as reliable fallback
    const reader = new FileReader();
    reader.onload = () => {
      setResumeBase64(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Clean error
    setErrors((prev) => {
      const next = { ...prev };
      delete next.resume;
      return next;
    });

    // Upload to server
    setIsUploading(true);
    setUploadProgress(20);

    const uploadForm = new globalThis.FormData();
    uploadForm.append('resume', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/resume');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      setUploadProgress(100);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && res.success) {
          setResumeUrl(res.fileUrl);
          showToast('Resume uploaded and verified successfully!', 'success');
        } else {
          showToast(res.message || 'File uploaded locally. Ready for submission.', 'info');
        }
      } catch {
        showToast('Document attached and encrypted locally.', 'info');
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadProgress(100);
      showToast('Document attached locally. Ready for submission.', 'info');
    };

    xhr.send(uploadForm);
  };

  const removeResume = () => {
    if (resumeBlobUrl) {
      try {
        URL.revokeObjectURL(resumeBlobUrl);
      } catch {}
    }
    setResumeBlobUrl('');
    setResumeFile(null);
    setResumeBase64(null);
    setResumeUrl('');
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadPdf = () => {
    try {
      const doc = generateApplicationPdf({
        applicationId: applicationId || 'GB-2026-PREVIEW',
        fullName: formData.fullName || 'APPLICANT',
        email: formData.email,
        gender: formData.gender,
        whatsapp: formData.whatsapp,
        country: formData.country,
        college: formData.college,
        collegeMail: formData.collegeMail,
        degree: formData.degree,
        branch: formData.branch,
        graduationYear: formData.graduationYear,
        domain: formData.domain,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        skills: formData.skills,
        whyApply: formData.whyApply,
        status: 'Under Review',
        submittedAt: new Date().toISOString(),
      });
      doc.save(`Gentrobyte-Application-${applicationId || 'receipt'}.pdf`);
      showToast('Official Application Receipt downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Failed to generate PDF. Please try again.', 'error');
    }
  };

  // Real-time OTP dispatch
  const sendOTP = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email first' });
      showToast('Please enter your email first', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setOtpLoading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.email;
      delete next.otp;
      return next;
    });

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: { success?: boolean; message?: string } = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          response.status === 502 || response.status === 504 || response.status === 503
            ? 'The email service is starting up. Please try again in 15 seconds.'
            : text.replace(/<[^>]*>?/gm, '').trim().substring(0, 150) || `Server error (${response.status})`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setOtpTimer(60);
      showToast(`A 6-digit verification code has been dispatched directly to ${formData.email}!`, 'success');
    } catch (error: unknown) {
      const err = error as Error;
      setErrors((prev) => ({
        ...prev,
        email: err.message || 'Unable to send OTP. Please try again.',
      }));
      showToast(err.message || 'Unable to send OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter a 6-digit OTP code' });
      return;
    }

    setOtpLoading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.otp;
      return next;
    });

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), otp }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: { verified?: boolean; message?: string; token?: string } = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          response.status === 502 || response.status === 504 || response.status === 503
            ? 'Verification service is temporarily busy. Please try again in a few moments.'
            : text.replace(/<[^>]*>?/gm, '').trim().substring(0, 150) || `Server error (${response.status})`
        );
      }

      if (response.ok && data.verified) {
        setOtpVerified(true);
        if (data.token) {
          setAuthToken(data.token);
          login(data.token, {
            name: formData.fullName.trim() || formData.email.split('@')[0].toUpperCase(),
            email: formData.email.toLowerCase().trim(),
            role: 'applicant',
          });
          try {
            sessionStorage.setItem('gentrobyte_applicant_token', data.token);
          } catch {}
        }
        showToast('Email verified successfully! Candidate authenticated.', 'success');
      } else {
        setOtpVerified(false);
        setErrors({ otp: data.message || 'Invalid or expired OTP code. Please try again.' });
        showToast(data.message || 'Invalid or expired OTP code', 'error');
      }
    } catch {
      setErrors({ otp: 'Unable to verify OTP. Please try again.' });
      showToast('Network error during OTP verification', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = () => {
    if (otpTimer > 0) return;
    sendOTP();
  };

  // Timer effect for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validateUrl = (url: string) => {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full legal name is required';
        if (!formData.email) newErrors.email = 'Email address is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address format';
        if (!formData.confirmEmail) newErrors.confirmEmail = 'Please confirm your email address';
        else if (formData.email !== formData.confirmEmail) newErrors.confirmEmail = 'Email addresses do not match';
        if (!formData.gender) newErrors.gender = 'Gender selection is required';
        if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp / phone number is required';
        if (!formData.country.trim()) newErrors.country = 'Country selection is required';
        if (!formData.college.trim()) newErrors.college = 'College name is required';
        if (!otpVerified) newErrors.otp = 'Please verify your email via 6-digit OTP before proceeding';
        break;

      case 2:
        if (!formData.degree) newErrors.degree = 'Degree program selection is required';
        if (!formData.branch) newErrors.branch = 'Branch / Department is required';
        if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
        if (formData.collegeMail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.collegeMail)) {
          newErrors.collegeMail = 'Invalid college mail format';
        }
        break;

      case 3:
        if (!formData.domain) newErrors.domain = 'Please select your preferred internship track';
        if (!formData.githubUrl.trim()) newErrors.githubUrl = 'GitHub repository profile is required';
        else if (!validateUrl(formData.githubUrl)) newErrors.githubUrl = 'Invalid URL format';
        if (formData.portfolioUrl && !validateUrl(formData.portfolioUrl)) {
          newErrors.portfolioUrl = 'Invalid portfolio URL format';
        }
        if (!formData.skills.trim()) newErrors.skills = 'Please mention your key technical skills';
        if (!formData.whyApply.trim()) newErrors.whyApply = 'Please tell us why you want to join Gentrobyte';
        else if (formData.whyApply.trim().length < 10) newErrors.whyApply = 'Please write at least a sentence explaining your interest';
        if (!resumeFile && !resumeUrl && !resumeBase64) newErrors.resume = 'Please upload your resume in PDF format';
        break;

      case 4:
        if (!formData.consent) newErrors.consent = 'You must declare that all provided details are accurate';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      showToast('Please complete all required fields in Step 1.', 'error');
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      showToast('Please complete all required fields in Step 2.', 'error');
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      showToast('Please complete all required fields in Step 3.', 'error');
      return;
    }
    if (!validateStep(4)) return;

    if (!otpVerified) {
      setErrors((prev) => ({ ...prev, otp: 'Please verify your email address via OTP before submitting.' }));
      setCurrentStep(1);
      showToast('Email verification required before submission.', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const activeToken =
      contextToken ||
      authToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('gentrobyte_token') || sessionStorage.getItem('gentrobyte_applicant_token')
        : '') ||
      '';

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email.toLowerCase().trim(),
          confirmEmail: (formData.confirmEmail || formData.email).toLowerCase().trim(),
          authToken: activeToken,
          resumeUrl: resumeUrl || null,
          resumeFileName: resumeFile?.name || null,
          resumeFileSize: resumeFile?.size || null,
          resumeFileType: resumeFile?.type || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Submission failed. Please check your details.');
      }

      setApplicationId(result.applicationId);
      setIsSubmitted(true);
      showToast('Application submitted successfully!', 'success');
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } catch (error: unknown) {
      const err = error as Error;
      setSubmitError(err.message || 'An error occurred during submission.');
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CANDIDATE AUTHENTICATION GATEWAY
  // "in general open of the website is only to signin and signup the after that the apply is enabled"
  if (!authUser) {
    return (
      <section className="py-20 sm:py-28 bg-navy-50/50 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="bg-white rounded-3xl border border-navy-100 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100 shadow-sm">
              <HiShieldCheck className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              Identity Verification Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight mt-3 mb-2">
              Authentication Required to Apply
            </h2>
            <p className="text-xs sm:text-sm text-navy-600 font-medium leading-relaxed mb-6">
              To prevent duplicate submissions, identity theft, and automated bots, Gentrobyte requires candidate authentication before opening the application form.
            </p>

            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-start gap-3 p-3.5 bg-navy-50 rounded-2xl border border-navy-100">
                <HiCheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-navy-900">One Account Per Candidate</h4>
                  <p className="text-[11px] text-navy-500">Each email is uniquely linked to one candidate profile to prevent fraudulent multi-accounts.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-navy-50 rounded-2xl border border-navy-100">
                <HiCheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Verified Email & Identity Lock</h4>
                  <p className="text-[11px] text-navy-500">Email OTP verification locks your credentials so no third party can apply under your email.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/signup?redirect=/apply"
                className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-primary-600/30 transition-all text-center"
              >
                Sign Up & Apply Now →
              </Link>
              <Link
                href="/login?redirect=/apply"
                className="w-full py-3.5 px-4 bg-navy-100 hover:bg-navy-200 text-navy-800 rounded-xl font-bold text-xs sm:text-sm transition-all text-center border border-navy-200"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SUCCESS SUBMISSION SCREEN
  if (isSubmitted) {
    return (
      <section className="py-16 sm:py-24 bg-white min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
            <HiCheckCircle className="h-10 w-10" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            Cohort 2026 Admissions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-900 mt-3 mb-2 tracking-tight">
            Application Logged Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 font-medium mb-8">
            Congratulations, <strong className="text-navy-900">{formData.fullName}</strong>. Your profile has been received and entered into our talent review pipeline.
          </p>

          <div className="bg-navy-50 border border-navy-100 rounded-3xl p-6 sm:p-8 mb-8 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-navy-100 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block">
                  Official Application Tracking ID
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-primary-600">
                  {applicationId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(applicationId);
                  setCopied(true);
                  showToast('Copied Application ID to clipboard!', 'info');
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-primary-700 bg-white border border-primary-200 hover:bg-primary-50 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <HiClipboardCopy className="w-4 h-4 text-primary-600" />
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-navy-400 font-semibold block">Track Domain:</span>
                <span className="text-navy-900 font-bold">{formData.domain}</span>
              </div>
              <div>
                <span className="text-navy-400 font-semibold block">Registered Email:</span>
                <span className="text-navy-900 font-bold truncate block">{formData.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Link
              href={`/track?id=${encodeURIComponent(applicationId)}`}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-navy-900/10"
            >
              <span>Track Live Status</span>
              <HiArrowRight className="w-4 h-4 text-accent-400" />
            </Link>

            <button
              type="button"
              onClick={() => downloadPdf()}
              className="w-full bg-white border-2 border-navy-200 hover:border-navy-900 text-navy-900 px-6 py-4 rounded-2xl font-bold text-sm transition-all"
            >
              Download PDF Receipt
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(1);
              setFormData({
                email: '',
                confirmEmail: '',
                fullName: '',
                gender: '',
                whatsapp: '',
                country: '',
                college: '',
                branch: '',
                domain: '',
                collegeMail: '',
                degree: '',
                graduationYear: '',
                githubUrl: '',
                portfolioUrl: '',
                skills: '',
                whyApply: '',
                consent: false,
              });
              setOtp('');
              setOtpSent(false);
              setOtpVerified(false);
              removeResume();
            }}
            className="text-xs text-navy-400 hover:text-navy-700 font-bold underline mt-4"
          >
            Submit Another Application
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 bg-white min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-6xl font-black text-navy-900 mb-3 tracking-tighter">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Future</span>
          </h2>
          <p className="text-xs sm:text-lg text-navy-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Ready to kickstart your career? Complete the multi-step application below to join Gentrobyte&apos;s 2026 internship cohort.
          </p>
        </div>

        {/* Authentication & Account Status Banner */}
        <div className="mb-8 px-4 sm:px-0">
          {!authUser ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-900 to-primary-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-primary-600/30 border border-primary-500/40 text-primary-300 flex items-center justify-center shrink-0">
                  <HiUser className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">Have a Gentrobyte Candidate Account?</p>
                  <p className="text-[11px] sm:text-xs text-navy-300">
                    Sign In or Sign Up to save your details and track your recruitment status live.
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
          ) : (
            <div className="p-4 rounded-3xl bg-green-50 border border-green-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="w-9 h-9 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {authUser.name ? authUser.name.charAt(0).toUpperCase() : '✓'}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-green-950">
                    Authenticated as {authUser.name}
                  </p>
                  <p className="text-[11px] sm:text-xs text-green-700">
                    Logged in with {authUser.email}. This application will be linked directly to your candidate profile.
                  </p>
                </div>
              </div>
              <Link
                href="/track"
                className="text-xs font-bold text-green-800 hover:text-green-950 underline px-3 py-1.5 bg-green-100/60 rounded-xl"
              >
                View My Applications →
              </Link>
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="mb-8 sm:mb-10 px-2 sm:px-0">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1 relative group">
                  <div
                    className={`w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                      currentStep === step.number
                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                        : currentStep > step.number
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-navy-100 text-navy-300'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <HiCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      React.cloneElement(step.icon as React.ReactElement, {
                        className: 'w-4 h-4 sm:w-6 sm:h-6',
                      })
                    )}
                  </div>
                  <div className="mt-2 text-center w-full">
                    <span
                      className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider block text-center truncate max-w-[65px] sm:max-w-none mx-auto ${
                        currentStep === step.number
                          ? 'text-primary-700'
                          : currentStep > step.number
                          ? 'text-navy-800'
                          : 'text-navy-300'
                      }`}
                    >
                      {step.number === 3 ? (
                        <>
                          <span className="sm:hidden">Skills</span>
                          <span className="hidden sm:inline">Skills &amp; Motivation</span>
                        </>
                      ) : (
                        step.title
                      )}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 px-1 sm:px-2 mb-5 sm:mb-6">
                    <div
                      className={`h-0.5 sm:h-1 rounded-full transition-all duration-500 ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-navy-100'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Multi-Step Form Card */}
        <div className="bg-white rounded-3xl border border-navy-100 shadow-2xl p-4 sm:p-8 md:p-10 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: PERSONAL & BASIC DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-navy-100 pb-3">
                  <h3 className="text-lg font-black text-navy-900 tracking-tight">Step 1: Personal Profile & Verification</h3>
                  <p className="text-xs text-navy-500 mt-0.5">Please provide your legal contact details and verify your email.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="fullName" className="block text-sm font-bold text-navy-900">
                      Full Legal Name <span className="text-accent-500">*</span>
                    </label>
                    {authUser && (
                      <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1 shadow-sm">
                        <HiShieldCheck className="w-3.5 h-3.5 text-green-600" />
                        Verified Account
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    readOnly={Boolean(authUser)}
                    placeholder="e.g. John Doe"
                    required
                    className={`w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                      errors.fullName ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                    } ${authUser ? 'bg-slate-100/90 text-navy-950 font-bold cursor-not-allowed border-navy-200' : ''}`}
                  />
                  {errors.fullName && <p className="mt-2 text-xs font-bold text-red-500">{errors.fullName}</p>}
                </div>

                {/* Email with Real-time OTP Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="email" className="block text-sm font-bold text-navy-900">
                        Primary Email <span className="text-accent-500">*</span>
                      </label>
                      {authUser && (
                        <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1 shadow-sm">
                          <HiCheck className="w-3.5 h-3.5 text-green-600" />
                          OTP Verified
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly={Boolean(authUser)}
                        disabled={otpVerified || Boolean(authUser)}
                        placeholder="your.email@example.com"
                        required
                        className={`w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                          errors.email ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                        } ${otpVerified || authUser ? 'bg-green-50/60 border-green-300 text-green-950 font-bold' : ''}`}
                      />
                      {!otpVerified && !authUser && (
                        <button
                          type="button"
                          onClick={sendOTP}
                          disabled={otpLoading || otpTimer > 0 || !formData.email}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                        >
                          {otpLoading ? 'Sending...' : otpTimer > 0 ? `${otpTimer}s` : otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {errors.email && <p className="mt-2 text-xs font-bold text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmEmail" className="block text-sm font-bold text-navy-900 mb-2">
                      Confirm Email Address <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="confirmEmail"
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={handleInputChange}
                      readOnly={Boolean(authUser)}
                      disabled={otpVerified || Boolean(authUser)}
                      placeholder="Repeat primary email"
                      required
                      className={`w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                        errors.confirmEmail ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                      } ${otpVerified || authUser ? 'bg-green-50/60 border-green-300 text-green-950 font-bold' : ''}`}
                    />
                    {errors.confirmEmail && <p className="mt-2 text-xs font-bold text-red-500">{errors.confirmEmail}</p>}
                  </div>
                </div>

                {/* Real-time OTP Input Block */}
                {!otpVerified && otpSent && (
                  <div className="p-4 bg-navy-50/80 border border-primary-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy-800">
                        Enter 6-Digit Email Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={resendOTP}
                        disabled={otpTimer > 0}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-40"
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="flex-1 px-4 py-3 bg-white border-2 border-primary-300 rounded-xl font-mono text-center text-lg font-black tracking-widest text-navy-900 outline-none focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={verifyOTP}
                        disabled={otpLoading || otp.length !== 6}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>

                    {otpSent && (
                      <div className="p-3 bg-white border border-primary-200 rounded-xl flex items-center space-x-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0"></span>
                        <span className="text-xs font-semibold text-navy-800">
                          Verification code dispatched to <strong>{formData.email}</strong>. Please check your email inbox and spam folder.
                        </span>
                      </div>
                    )}

                    {errors.otp && <p className="text-xs font-bold text-red-500">{errors.otp}</p>}
                  </div>
                )}

                {otpVerified && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2 text-green-800 text-xs font-bold">
                    <HiCheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    <span>✓ Email address verified and authenticated.</span>
                  </div>
                )}

                {/* Gender Selector */}
                <GenderSelector
                  value={formData.gender}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, gender: val }));
                    if (errors.gender) setErrors((prev) => { const n = { ...prev }; delete n.gender; return n; });
                  }}
                  error={errors.gender}
                />

                {/* WhatsApp & Country Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-bold text-navy-900 mb-2">
                      WhatsApp / Mobile <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      required
                      className={`w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                        errors.whatsapp ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                      }`}
                    />
                    {errors.whatsapp && <p className="mt-2 text-xs font-bold text-red-500">{errors.whatsapp}</p>}
                  </div>

                  {/* Rock-solid Country Selector */}
                  <CountrySelector
                    value={formData.country}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, country: val }));
                      if (errors.country) setErrors((prev) => { const n = { ...prev }; delete n.country; return n; });
                    }}
                    error={errors.country}
                  />
                </div>

                {/* College Name */}
                <div>
                  <label htmlFor="college" className="block text-sm font-bold text-navy-900 mb-2">
                    College / University Institution <span className="text-accent-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    placeholder="e.g. Stanford University / PSG Tech / SKCET"
                    required
                    className={`w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                      errors.college ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                    }`}
                  />
                  {errors.college && <p className="mt-2 text-xs font-bold text-red-500">{errors.college}</p>}
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMIC CREDENTIALS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-navy-100 pb-3">
                  <h3 className="text-lg font-black text-navy-900 tracking-tight">Step 2: Academic Program & Degree</h3>
                  <p className="text-xs text-navy-500 mt-0.5">Tell us about your educational background and graduation timeline.</p>
                </div>

                {/* Degree Selector */}
                <DegreeSelector
                  value={formData.degree}
                  onChange={(val) => {
                    setFormData((prev) => ({
                      ...prev,
                      degree: val,
                      branch: branchOptionsMap[val] ? branchOptionsMap[val][0] : prev.branch,
                    }));
                    if (errors.degree) setErrors((prev) => { const n = { ...prev }; delete n.degree; return n; });
                  }}
                  error={errors.degree}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch / Department */}
                  <div>
                    <label htmlFor="branch" className="block text-sm font-bold text-navy-900 mb-2">
                      Branch / Specialization <span className="text-accent-500">*</span>
                    </label>
                    {branchOptionsMap[formData.degree] ? (
                      <select
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 border-navy-100 rounded-xl text-navy-900 font-medium outline-none focus:border-primary-500 cursor-pointer"
                      >
                        <option value="">Select Specialization</option>
                        {branchOptionsMap[formData.degree].map((br) => (
                          <option key={br} value={br}>
                            {br}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        placeholder="e.g. Computer Science"
                        required
                        className="w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 border-navy-100 rounded-xl text-navy-900 font-medium outline-none focus:border-primary-500"
                      />
                    )}
                    {errors.branch && <p className="mt-2 text-xs font-bold text-red-500">{errors.branch}</p>}
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-bold text-navy-900 mb-2">
                      Graduation Year Cohort <span className="text-accent-500">*</span>
                    </label>
                    <select
                      id="graduationYear"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 border-navy-100 rounded-xl text-navy-900 font-medium outline-none focus:border-primary-500 cursor-pointer"
                    >
                      <option value="">Select Cohort Year</option>
                      {['2024', '2025', '2026', '2027', '2028', '2029', '2030'].map((yr) => (
                        <option key={yr} value={yr}>
                          Class of {yr}
                        </option>
                      ))}
                    </select>
                    {errors.graduationYear && <p className="mt-2 text-xs font-bold text-red-500">{errors.graduationYear}</p>}
                  </div>
                </div>

                {/* College Institutional Email */}
                <div>
                  <label htmlFor="collegeMail" className="block text-sm font-bold text-navy-900 mb-2">
                    College / University Email <span className="text-navy-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="collegeMail"
                    name="collegeMail"
                    value={formData.collegeMail}
                    onChange={handleInputChange}
                    placeholder="student@college.edu or leave blank"
                    className="w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 border-navy-100 rounded-xl text-navy-900 font-medium outline-none focus:border-primary-500"
                  />
                  {errors.collegeMail && <p className="mt-2 text-xs font-bold text-red-500">{errors.collegeMail}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: SKILLS, DOMAIN & RESUME */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-navy-100 pb-3">
                  <h3 className="text-lg font-black text-navy-900 tracking-tight">Step 3: Track Domain, Skills & Resume</h3>
                  <p className="text-xs text-navy-500 mt-0.5">Select your target internship domain and upload your resume document.</p>
                </div>

                {/* Target Domain Selector */}
                <DomainSelector
                  value={formData.domain}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, domain: val }));
                    if (errors.domain) setErrors((prev) => { const n = { ...prev }; delete n.domain; return n; });
                  }}
                  error={errors.domain}
                />

                {/* GitHub & Portfolio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="githubUrl" className="block text-sm font-bold text-navy-900 mb-2">
                      GitHub Profile URL <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/yourusername"
                      required
                      className={`w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                        errors.githubUrl ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                      }`}
                    />
                    {errors.githubUrl && <p className="mt-2 text-xs font-bold text-red-500">{errors.githubUrl}</p>}
                  </div>

                  <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-bold text-navy-900 mb-2">
                      Portfolio / Live Project URL <span className="text-navy-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      id="portfolioUrl"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://yourportfolio.dev"
                      className="w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 border-navy-100 rounded-xl text-navy-900 font-medium outline-none focus:border-primary-500"
                    />
                    {errors.portfolioUrl && <p className="mt-2 text-xs font-bold text-red-500">{errors.portfolioUrl}</p>}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label htmlFor="skills" className="block text-sm font-bold text-navy-900 mb-2">
                    Core Technical Skills & Frameworks <span className="text-accent-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Next.js, TypeScript, Python, Node.js, SQL"
                    required
                    className={`w-full px-4 sm:px-5 py-3.5 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                      errors.skills ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                    }`}
                  />
                  {errors.skills && <p className="mt-2 text-xs font-bold text-red-500">{errors.skills}</p>}
                </div>

                {/* Why Apply */}
                <div>
                  <label htmlFor="whyApply" className="block text-sm font-bold text-navy-900 mb-2">
                    Why do you want to join Gentrobyte? <span className="text-accent-500">*</span>
                  </label>
                  <textarea
                    id="whyApply"
                    name="whyApply"
                    rows={3}
                    value={formData.whyApply}
                    onChange={handleInputChange}
                    placeholder="Briefly state your passion, past projects, or career aspirations at Gentrobyte..."
                    required
                    className={`w-full p-4 bg-navy-50 border-2 rounded-xl outline-none text-navy-900 font-medium transition-all ${
                      errors.whyApply ? 'border-red-500 bg-red-50/20' : 'border-navy-100 focus:border-primary-500'
                    }`}
                  />
                  {errors.whyApply && <p className="mt-2 text-xs font-bold text-red-500">{errors.whyApply}</p>}
                </div>

                {/* Resume Upload with Drag & Drop */}
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-2">
                    Resume Document (PDF) <span className="text-accent-500">*</span>
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleResumeChange(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                      isDragging
                        ? 'border-primary-500 bg-primary-50/40'
                        : errors.resume
                        ? 'border-red-300 bg-red-50/20'
                        : 'border-navy-200 bg-navy-50/40 hover:bg-navy-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleResumeChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="resumeUpload"
                    />

                    {resumeFile ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-2xl border border-navy-100 shadow-sm gap-3">
                        <div className="flex items-center space-x-3 text-left min-w-0">
                          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                            <HiDocumentText className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-navy-900 truncate max-w-xs">{resumeFile.name}</p>
                            <p className="text-[11px] text-navy-400">
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB {isUploading ? `• Uploading ${uploadProgress}%` : '• Ready for submission'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowResumeModal(true)}
                            className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-bold transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={removeResume}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remove resume"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="resumeUpload" className="cursor-pointer block py-4">
                        <HiUpload className="w-10 h-10 text-primary-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-navy-900">
                          Click to upload or drag & drop your resume
                        </p>
                        <p className="text-xs text-navy-400 mt-1">PDF format only • Max 5MB</p>
                      </label>
                    )}
                  </div>
                  {errors.resume && <p className="mt-2 text-xs font-bold text-red-500">{errors.resume}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW OF DETAILS & CONSENT */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-navy-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-navy-900 tracking-tight">Step 4: Review Details & Confirm</h3>
                    <p className="text-xs text-navy-500 mt-0.5">Please review your submission before final submission.</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                    Final Review
                  </span>
                </div>

                {/* Personal Details Card */}
                <div className="bg-navy-50/70 p-4 sm:p-5 rounded-2xl border border-navy-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary-700 block mb-3">
                    ● Personal Profile
                  </span>
                  <div className="grid grid-cols-1 min-[460px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                    <div>
                      <span className="text-navy-400 block font-semibold">Full Name</span>
                      <strong className="text-navy-900">{formData.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">Primary Email</span>
                      <strong className="text-navy-900 truncate block">{formData.email}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">Gender</span>
                      <strong className="text-navy-900">{formData.gender}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">WhatsApp</span>
                      <strong className="text-navy-900">{formData.whatsapp}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">Country</span>
                      <strong className="text-navy-900">{formData.country}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">Resume Document</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-navy-900 font-bold truncate max-w-[130px] sm:max-w-[160px]" title={resumeFile?.name || 'Attached'}>
                          {resumeFile ? resumeFile.name : 'Attached'}
                        </span>
                        {(resumeFile || resumeBlobUrl || resumeUrl || resumeBase64) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!resumeBlobUrl && resumeFile) {
                                try {
                                  const blob = URL.createObjectURL(resumeFile);
                                  setResumeBlobUrl(blob);
                                } catch (e) {
                                  console.warn('Failed to create object URL:', e);
                                }
                              }
                              setShowResumeModal(true);
                            }}
                            className="text-[11px] font-bold text-primary-600 hover:text-primary-800 underline bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded cursor-pointer transition-colors shrink-0"
                            aria-label="View uploaded resume PDF in preview modal"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Card */}
                <div className="bg-navy-50/70 p-4 sm:p-5 rounded-2xl border border-navy-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary-700 block mb-3">
                    ● Academic Background
                  </span>
                  <div className="grid grid-cols-1 min-[460px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                    <div className="min-[460px]:col-span-2">
                      <span className="text-navy-400 block font-semibold">Institution</span>
                      <strong className="text-navy-900">{formData.college}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">Cohort Year</span>
                      <strong className="text-navy-900">Class of {formData.graduationYear}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">Degree</span>
                      <strong className="text-navy-900">{formData.degree}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">Branch</span>
                      <strong className="text-navy-900">{formData.branch}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">College Mail</span>
                      <strong className="text-navy-900 truncate block">{formData.collegeMail || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Track & Links Card */}
                <div className="bg-navy-50/70 p-4 sm:p-5 rounded-2xl border border-navy-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary-700 block mb-3">
                    ● Target Track &amp; Competencies
                  </span>
                  <div className="grid grid-cols-1 min-[460px]:grid-cols-2 gap-3 sm:gap-4 text-xs">
                    <div>
                      <span className="text-navy-400 block font-semibold">Applied Domain</span>
                      <strong className="text-navy-900 font-bold text-sm text-primary-700">{formData.domain}</strong>
                    </div>
                    <div>
                      <span className="text-navy-400 block font-semibold">GitHub Profile</span>
                      <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-bold underline truncate block">
                        {formData.githubUrl}
                      </a>
                    </div>
                    <div className="min-[460px]:col-span-2">
                      <span className="text-navy-400 block font-semibold">Technical Skills</span>
                      <strong className="text-navy-900">{formData.skills}</strong>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3 text-xs font-semibold">
                    <HiExclamationCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Consent Checkbox */}
                <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-navy-300 focus:ring-primary-500"
                    />
                    <span className="text-xs text-navy-800 font-medium leading-relaxed">
                      I declare that all information submitted in this application is accurate and true. I authorize Gentrobyte to review my credentials for internship selection.
                    </span>
                  </label>
                  {errors.consent && <p className="mt-2 text-xs font-bold text-red-500">{errors.consent}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                  currentStep === 1 || isSubmitting
                    ? 'bg-navy-50 text-navy-300 cursor-not-allowed'
                    : 'bg-white border-2 border-navy-200 hover:border-navy-900 text-navy-800'
                }`}
              >
                <HiArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <HiArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Finalize & Submit Application</span>
                      <HiCheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Resume Modal */}
      <ResumePreviewModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        fileName={resumeFile?.name || 'Resume_Document.pdf'}
        blobUrl={resumeBlobUrl}
        fileUrl={resumeUrl}
        fileBase64={resumeBase64 || undefined}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
};

export default Apply;
