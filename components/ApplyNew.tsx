'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  HiUser,
  HiCode,
  HiDocumentText,
  HiCheckCircle,
  HiArrowLeft,
  HiArrowRight,
  HiChevronDown,
  HiExclamationCircle,
} from 'react-icons/hi';
import { generateApplicationPdf } from '@/lib/pdfGenerator';

interface FormData {
  // Step 1: Basic Details
  email: string;
  confirmEmail: string;
  fullName: string; // Combined first and last name
  gender: string;
  whatsapp: string;
  country: string;
  college: string;
  branch: string;
  domain: string;
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

const ApplyNew: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Basic Details
    email: '',
    confirmEmail: '',
    fullName: '',
    gender: '',
    whatsapp: '',
    country: '',
    college: '',
    branch: '',
    domain: '',
    // Step 2: Academic & Professional Details
    collegeMail: '',
    degree: '',
    graduationYear: '',
    githubUrl: '',
    portfolioUrl: '',
    // Step 3: Skills & Motivation
    skills: '',
    whyApply: '',
    // Step 4: Consent
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');
  
  // Country Options
  const countryOptions = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'PH', name: 'Philippines' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'KR', name: 'South Korea' },
    { code: 'BR', name: 'Brazil' },
    { code: 'ZA', name: 'South Africa' },
  ];

  const branchOptionsMap: Record<string, string[]> = {
    'BE/BTech': ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE'],
    'BSc': ['Physics', 'Chemistry', 'Computer Science'],
    'BEd': ['English', 'Mathematics', 'Science'],
    'BCA': ['Computer Applications'],
    'BCom': ['General', 'Accounting', 'Finance'],
    'BBA': ['General', 'Marketing', 'Finance'],
    'MCA': ['Computer Applications'],
    'MBA': ['Finance', 'Marketing', 'HR'],
    'MSc': ['Physics', 'Chemistry', 'Computer Science'],
    'MA': ['English', 'History'],
    'Other': ['Other']
  };

  const generateAppId = () => `GEN-${Math.random().toString(36).substring(2,9).toUpperCase()}`;

  const downloadPdf = async () => {
    try {
      const doc = generateApplicationPdf({
        applicationId: applicationId || 'GB-2026-APPLICANT',
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
        domain: formData.domain || 'Engineering Track',
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        skills: formData.skills,
        whyApply: formData.whyApply,
        status: 'Under Review',
        submittedAt: new Date().toISOString(),
      });
      doc.save(`Gentrobyte-Application-${applicationId || 'receipt'}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF.');
    }
  };

  const totalSteps = 4;

  // Custom Components for New Fields
  const GenderRadioGroup = () => (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-navy-900 mb-3">
        ⚧ Gender <span className="text-accent-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {['Male', 'Female', 'Prefer not to say'].map((option) => (
          <label 
            key={option}
            className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.gender === option
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-navy-100 bg-navy-50 hover:border-primary-300 hover:bg-primary-50 text-navy-700'
            }`}
          >
            <input
              type="radio"
              name="gender"
              value={option}
              checked={formData.gender === option}
              onChange={handleInputChange}
              className="sr-only"
            />
            <span className="font-bold">{option}</span>
          </label>
        ))}
      </div>
      {errors.gender && <p className="mt-2 text-xs font-bold text-red-500">{errors.gender}</p>}
    </div>
  );

  const DegreeRadioGroup = () => (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-navy-900 mb-3">
        🏫 Degree Program <span className="text-accent-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[ 'BCA', 'BE/BTech', 'BCom', 'BBA', 'MCA', 'MBA', 'MCom', 'BSc', 'MSc', 'MA', 'Other' ].map((option) => (
          <label key={option} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.degree === option ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-navy-100 bg-navy-50 hover:border-primary-300 hover:bg-primary-50 text-navy-700'}`}>
            <input type="radio" name="degree" value={option} checked={formData.degree === option} onChange={handleInputChange} className="sr-only" />
            <span className="font-bold">{option}</span>
          </label>
        ))}
      </div>
      {errors.degree && <p className="mt-2 text-xs font-bold text-red-500">{errors.degree}</p>}
    </div>
  );

  const DomainRadioGroup = () => (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-navy-900 mb-3">
        💼 Preferred Domain of Internship <span className="text-accent-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { emoji: '🔐', value: 'Cyber Security' },
          { emoji: '📊', value: 'Data Science & Analytics' },
          { emoji: '🌐', value: 'Full Stack Web Development' },
          { emoji: '🤖', value: 'Machine Learning' },
          { emoji: '✍️', value: 'Prompt Engineering' },
          { emoji: '🎨', value: 'UI/UX Design' }
        ].map((option) => (
          <label 
            key={option.value}
            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.domain === option.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-navy-100 bg-navy-50 hover:border-primary-300 hover:bg-primary-50 text-navy-700'
            }`}
          >
            <input
              type="radio"
              name="domain"
              value={option.value}
              checked={formData.domain === option.value}
              onChange={handleInputChange}
              className="sr-only"
            />
            <span className="text-xl mr-3">{option.emoji}</span>
            <span className="font-bold">{option.value}</span>
          </label>
        ))}
      </div>
      {errors.domain && <p className="mt-2 text-xs font-bold text-red-500">{errors.domain}</p>}
    </div>
  );

  const CountryDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredCountries = countryOptions.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (country: { code: string; name: string }) => {
      setFormData(prev => ({ ...prev, country: country.name }));
      setIsOpen(false);
      setSearchTerm('');
      if (errors.country) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.country;
          return next;
        });
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <label htmlFor="country" className="block text-sm font-bold text-navy-900 mb-2">
          Country <span className="text-accent-500">*</span>
        </label>
        <button
          type="button"
          className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium text-left ${errors.country ? 'border-red-500' : 'border-transparent'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center">
            <span className={formData.country ? 'text-navy-900' : 'text-navy-300'}>
              {formData.country || 'Select your country'}
            </span>
            <HiChevronDown className={`h-5 w-5 text-navy-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-navy-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-b border-navy-100 focus:outline-none text-navy-900"
              autoFocus
            />
            <ul className="py-2">
              {filteredCountries.map((country) => (
                <li
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  className="px-4 py-3 hover:bg-navy-50 cursor-pointer text-navy-900 hover:text-primary-600 transition-colors"
                >
                  {country.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {errors.country && <p className="mt-2 text-xs font-bold text-red-500">{errors.country}</p>}
      </div>
    );
  };

  const validateUrl = (url: string) => {
    try {
      // Check if URL has protocol (http:// or https://)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
        return true;
      }
      
      // If no protocol, try adding https:// and validate
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
      if (formData.email !== formData.confirmEmail) newErrors.confirmEmail = 'Emails do not match';
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp number is required';
      else if (!/^\+\d{1,4}\d{7,14}$/.test(formData.whatsapp)) newErrors.whatsapp = 'Please enter a valid WhatsApp number with country code (e.g., +91XXXXXXXXXX)';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.college.trim()) newErrors.college = 'College name is required';
      if (!formData.degree.trim()) newErrors.degree = 'Degree program is required';
      if (!formData.domain) newErrors.domain = 'Preferred domain is required';
    }

    if (step === 2) {
      if (!formData.collegeMail.trim()) newErrors.collegeMail = 'College mail is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.collegeMail)) newErrors.collegeMail = 'Valid college email is required';
      if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
      const year = parseInt(formData.graduationYear);
      if (!/^\d{4}$/.test(formData.graduationYear)) {
        newErrors.graduationYear = 'Year must be 4 digits';
      } else if (year > 2029) {
        newErrors.graduationYear = 'Graduation year cannot be greater than 2029';
      }
      if (!formData.githubUrl.trim()) newErrors.githubUrl = 'GitHub URL is required';
      else if (!validateUrl(formData.githubUrl)) newErrors.githubUrl = 'Please enter a valid GitHub URL (must start with http:// or https://)';
      if (!formData.portfolioUrl.trim()) newErrors.portfolioUrl = 'Portfolio URL is required';
      else if (!validateUrl(formData.portfolioUrl)) newErrors.portfolioUrl = 'Please enter a valid Portfolio URL (e.g., https://portfolio.com or portfolio.com)';
    }

    if (step === 3) {
      if (!formData.skills.trim()) newErrors.skills = 'Technical skills field is required';
      if (!formData.whyApply.trim()) newErrors.whyApply = 'Why Gentrobyte field is required';
    }

    if (step === 4) {
      if (!formData.consent) newErrors.consent = 'You must consent to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'whatsapp') {
      // Handle WhatsApp number with country code
      let val = value;
      // Ensure it starts with + and contains digits
      if (!val.startsWith('+')) {
        val = '+' + val.replace(/^\+/, '');
      }
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else if (name === 'graduationYear') {
      const val = value.replace(/\D/g, '').slice(0, 4);
      // Prevent years greater than 2029
      const year = parseInt(val);
      if (year > 2029) {
        setErrors(prev => ({ ...prev, graduationYear: 'Graduation year cannot be greater than 2029' }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else if (name === 'fullName') {
      // Convert to uppercase
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
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
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      const appId = generateAppId();
      setApplicationId(appId);
      console.log('Form submitted:', formData, 'Application ID:', appId);
      setIsSubmitted(true);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Details', icon: <HiUser className="h-6 w-6" /> },
    { number: 2, title: 'Academic Details', icon: <HiDocumentText className="h-6 w-6" /> },
    { number: 3, title: 'Skills', icon: <HiCode className="h-6 w-6" /> },
    { number: 4, title: 'Review', icon: <HiCheckCircle className="h-6 w-6" /> },
  ];

  if (isSubmitted) {
    return (
      <section className="py-20 bg-white min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl relative z-10">
          <div className="bg-navy-50 rounded-[2.5rem] shadow-2xl p-12 text-center border border-navy-100 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-accent-500"></div>
            <div className="flex justify-center mb-10">
              <div className="bg-primary-500 text-white rounded-2xl p-6 shadow-xl shadow-primary-500/20 transform group-hover:scale-110 transition-transform duration-500">
                <HiCheckCircle className="h-20 w-20" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-900 mb-6 tracking-tight">
              Application <span className="text-primary-600">Successful!</span>
            </h2>
            <p className="text-base sm:text-lg text-navy-600 mb-10 font-medium leading-relaxed">
              Thank you for applying to Gentrobyte. We&apos;ve received your
              application and will review it shortly. You&apos;ll hear from us within
              5-7 business days.
            </p>
            <div className="bg-white border border-navy-100 rounded-2xl p-8 mb-10 text-left shadow-inner">
              <p className="text-sm text-navy-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-primary-500"></span>
                Submission Details
              </p>
              <div className="space-y-3">
                <p className="text-sm text-navy-700">
                  <strong className="text-navy-900">Application ID:</strong> <span className="font-mono bg-navy-50 px-2 py-1 rounded">{applicationId}</span>
                </p>
                <p className="text-sm text-navy-700">
                  <strong className="text-navy-900">Email:</strong> <span className="underline decoration-primary-200">{formData.email}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => downloadPdf()} className="w-full bg-white border-2 border-navy-100 hover:border-navy-900 text-navy-900 px-6 py-3 rounded-2xl font-bold transition-all duration-300">Download PDF</button>

              <button
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
                  setErrors({});
                  setApplicationId('');
                }}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white px-8 py-3 rounded-2xl font-black text-lg transition-all duration-300 shadow-2xl shadow-navy-900/20 active:scale-95"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-br from-navy-50 via-white to-primary-50 min-h-screen relative overflow-hidden">
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 mb-4 sm:mb-6 tracking-tight">
            Join <span className="text-primary-600">Gentrobyte</span>
          </h1>
          <p className="text-lg sm:text-xl text-navy-600 max-w-2xl mx-auto font-medium">
            Start your journey with us. Fill out the application form below to apply for our internship program.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                  currentStep >= step.number
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-navy-100 text-navy-400'
                }`}>
                  {currentStep > step.number ? <HiCheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : step.number}
                </div>
                <span className="text-xs sm:text-sm font-bold text-navy-700 mt-2 hidden sm:block">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className={`absolute top-5 sm:top-6 left-14 sm:left-16 w-12 sm:w-16 h-0.5 sm:h-1 transition-all duration-300 ${
                    currentStep > step.number ? 'bg-primary-500' : 'bg-navy-100'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-navy-100 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-primary-500 h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-navy-900/10 overflow-hidden border border-navy-50 mx-4 sm:mx-0">
          <div className="bg-navy-900 px-6 sm:px-10 py-4 sm:py-5 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent"></div>
            <span className="text-navy-400 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">Step {currentStep} of {totalSteps}</span>
            <span className="text-primary-400 text-sm font-bold relative z-10">{steps[currentStep-1].title}</span>
          </div>
          
          <div className="p-6 sm:p-12">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-navy-900 mb-2">
                        📧 Email Address <span className="text-accent-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 ${errors.email ? 'border-red-500' : 'border-transparent'}`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="confirmEmail" className="block text-sm font-bold text-navy-900 mb-2">
                        📧 Confirm Email Address <span className="text-accent-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="confirmEmail"
                        name="confirmEmail"
                        value={formData.confirmEmail}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 ${errors.confirmEmail ? 'border-red-500' : 'border-transparent'}`}
                        placeholder="john@example.com"
                      />
                      {errors.confirmEmail && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.confirmEmail}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-bold text-navy-900 mb-2">
                      🧑‍💼 Full Name <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-bold placeholder:text-navy-300 ${errors.fullName ? 'border-red-500' : 'border-transparent'}`}
                      placeholder="JOHN DOE"
                    />
                    {errors.fullName && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.fullName}</p>}
                  </div>

                  <GenderRadioGroup />

                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-bold text-navy-900 mb-2">
                      📱 WhatsApp Number <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-bold tracking-widest placeholder:text-navy-300 ${errors.whatsapp ? 'border-red-500' : 'border-transparent'}`}
                      placeholder="+91XXXXXXXXXX"
                    />
                    <p className="mt-2 text-[10px] text-navy-400 font-medium italic">Include country code (e.g., +91, +1, +971)</p>
                    {errors.whatsapp && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.whatsapp}</p>}
                  </div>

                  <CountryDropdown />

                  <div>
                    <label htmlFor="college" className="block text-sm font-bold text-navy-900 mb-2">
                      🏫 College Name <span className="text-accent-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 ${errors.college ? 'border-red-500' : 'border-transparent'}`}
                      placeholder="Enter your college name"
                    />
                    {errors.college && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.college}</p>}
                  </div>

                  <DegreeRadioGroup />

                  <DomainRadioGroup />
                </div>
              )}

              {/* Step 2: Academic & Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label htmlFor="collegeMail" className="block text-sm font-bold text-navy-900 mb-2">
                        📧 College Mail <span className="text-accent-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="collegeMail"
                        name="collegeMail"
                        value={formData.collegeMail}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 ${errors.collegeMail ? 'border-red-500' : 'border-transparent'}`}
                        placeholder="Enter your college email"
                      />
                      {errors.collegeMail && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.collegeMail}</p>}
                    </div>
                    <div>
                      <label htmlFor="branch" className="block text-sm font-bold text-navy-900 mb-2">
                        📷 Branch Name <span className="text-accent-500">*</span>
                      </label>
                      <select
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                        required
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium ${errors.branch ? 'border-red-500' : 'border-transparent'}`}
                      >
                        <option value="">Select branch (based on Degree program)</option>
                        {(branchOptionsMap[formData.degree] || []).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      {errors.branch && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.branch}</p>}
                      {(!formData.degree || (branchOptionsMap[formData.degree] || []).length === 0) && <p className="mt-2 text-xs text-navy-500">Select Degree on previous page to populate branches.</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label htmlFor="graduationYear" className="block text-sm font-bold text-navy-900 mb-2">
                        📅 Graduation Year <span className="text-accent-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="graduationYear"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        required
                        maxLength={4}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-bold placeholder:text-navy-300 ${errors.graduationYear ? 'border-red-500' : 'border-transparent'}`}
                        placeholder="e.g. 2026"
                      />
                      <p className="mt-2 text-[10px] text-navy-400 font-medium italic">Must be between current year and 2029</p>
                      {errors.graduationYear && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.graduationYear}</p>}
                    </div>
                    <div>
                      <label htmlFor="githubUrl" className="block text-sm font-bold text-navy-900 mb-2">
                        🐙 GitHub URL <span className="text-accent-500">*</span>
                      </label>
                      <input
                        type="url"
                        id="githubUrl"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 ${errors.githubUrl ? 'border-red-500' : 'border-transparent'}`}
                        placeholder="https://github.com/username"
                      />
                      {errors.githubUrl && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.githubUrl}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label htmlFor="portfolioUrl" className="block text-sm font-bold text-navy-900 mb-2">
                        🌐 Portfolio Website <span className="text-accent-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="portfolioUrl"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 ${errors.portfolioUrl ? 'border-red-500' : 'border-transparent'}`}
                        placeholder="https://portfolio.com or portfolio.com"
                      />
                      {errors.portfolioUrl && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><span>⚠</span> {errors.portfolioUrl}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Skills & Motivation */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <label htmlFor="skills" className="block text-sm font-bold text-navy-900 mb-2">
                      Technical Skills <span className="text-accent-500">*</span>
                    </label>
                    <textarea
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 resize-none ${errors.skills ? 'border-red-500' : 'border-transparent'}`}
                      placeholder="List your technical skills, programming languages, frameworks, tools, etc."
                    />
                    {errors.skills && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><HiExclamationCircle className="h-4 w-4" /> {errors.skills}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="whyApply" className="block text-sm font-bold text-navy-900 mb-2">
                      Why Gentrobyte? <span className="text-accent-500">*</span>
                    </label>
                    <textarea
                      id="whyApply"
                      name="whyApply"
                      value={formData.whyApply}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-navy-50 border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all outline-none text-navy-900 font-medium placeholder:text-navy-300 resize-none ${errors.whyApply ? 'border-red-500' : 'border-transparent'}`}
                      placeholder="Tell us why you want to join Gentrobyte and what you hope to achieve"
                    />
                    {errors.portfolioUrl && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><HiExclamationCircle className="h-4 w-4" /> {errors.portfolioUrl}</p>}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="bg-navy-50 p-6 rounded-2xl border border-navy-100">
                      <h4 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                        Personal Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">Name</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">Email</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">WhatsApp</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.whatsapp}</span>
                        </div>
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">Country</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.country}</span>
                        </div>
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">Gender</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.gender}</span>
                        </div>
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">College</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.college}</span>
                        </div>
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">Branch</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.branch}</span>
                        </div>
                        <div className="flex justify-between border-b border-navy-100 pb-2">
                          <span className="text-xs text-navy-400 font-bold uppercase">Domain</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.domain}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-navy-50 p-6 rounded-2xl border border-navy-100">
                      <h4 className="text-sm font-bold text-accent-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                        Academic & Professional
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-navy-400 font-bold uppercase block mb-1">College Mail</span>
                          <span className="text-sm text-navy-900 font-bold break-all">{formData.collegeMail}</span>
                        </div>
                        <div>
                          <span className="text-xs text-navy-400 font-bold uppercase block mb-1">Degree</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.degree}</span>
                        </div>
                        <div>
                          <span className="text-xs text-navy-400 font-bold uppercase block mb-1">Graduation Year</span>
                          <span className="text-sm text-navy-900 font-bold">{formData.graduationYear}</span>
                        </div>
                        <div>
                          <span className="text-xs text-navy-400 font-bold uppercase block mb-1">GitHub</span>
                          <span className="text-sm text-navy-900 font-bold break-all">{formData.githubUrl}</span>
                        </div>
                        <div>
                          <span className="text-xs text-navy-400 font-bold uppercase block mb-1">Portfolio</span>
                          <span className="text-sm text-navy-900 font-bold break-all">{formData.portfolioUrl}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-navy-50 p-6 rounded-2xl border border-navy-100">
                      <h4 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Skills & Motivation
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-navy-400 font-bold uppercase block mb-2">Technical Skills</span>
                          <p className="text-sm text-navy-900 font-medium whitespace-pre-line">{formData.skills}</p>
                        </div>
                        <div>
                          <span className="text-xs text-navy-400 font-bold uppercase block mb-2">Why Gentrobyte</span>
                          <p className="text-sm text-navy-900 font-medium whitespace-pre-line">{formData.whyApply}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border-2 transition-all ${errors.consent ? 'bg-red-50 border-red-200' : 'bg-primary-50/50 border-primary-100'}`}>
                    <label className="flex items-start space-x-4 cursor-pointer">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="consent"
                          checked={formData.consent}
                          onChange={handleInputChange}
                          required
                          className="peer h-6 w-6 opacity-0 absolute cursor-pointer"
                        />
                        <div className="h-6 w-6 border-2 border-navy-200 rounded-lg peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                          <HiCheckCircle className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-sm text-navy-700 font-medium leading-relaxed">
                        I hereby declare that the information provided is true and accurate. I consent to the storage and processing of my data by <span className="text-navy-900 font-bold">Gentrobyte</span> for the purpose of internship evaluation. <span className="text-accent-500 font-bold">*</span>
                      </span>
                    </label>
                    {errors.consent && <p className="mt-3 text-xs font-bold text-red-500 ml-10"> {errors.consent}</p>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons - Sticky on Mobile */}
              <div className="sticky bottom-0 sm:static bg-white/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none -mx-6 sm:mx-0 px-6 sm:px-0 py-4 sm:py-0 mt-8 sm:mt-12 border-t border-navy-50 sm:border-t-0 z-20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300 text-sm sm:text-base ${
                      currentStep === 1
                        ? 'bg-navy-50 text-navy-200 cursor-not-allowed border border-transparent'
                        : 'bg-white text-navy-600 border-2 border-navy-100 hover:border-navy-900 hover:text-navy-900'
                    }`}
                  >
                    <HiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Previous</span>
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-xl shadow-navy-900/10 text-sm sm:text-base"
                    >
                      <span>Continue</span>
                      <HiArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-xl shadow-primary-600/20 text-sm sm:text-base"
                    >
                      <span>Finalize Application</span>
                      <HiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplyNew;