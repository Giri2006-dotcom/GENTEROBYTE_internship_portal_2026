'use client';

import React, { useState, useMemo } from 'react';
import { HiSparkles, HiUsers, HiPaperAirplane, HiTrendingUp, HiSearch, HiX } from 'react-icons/hi';
import InternshipCard from './InternshipCard';

const internships = [
  {
    title: 'Full Stack Engineering Intern',
    domain: 'Full Stack Web Development',
    description:
      'Work on production-grade applications, build responsive Next.js frontend interfaces and Node.js microservices, and launch your software engineering career.',
    duration: '12 weeks',
    location: 'Remote / Global',
    stipend: '$600 - $900 / month',
    startDate: 'June 2026',
    mode: 'Remote / Hybrid',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git'],
    benefits: [
      'Certificate of Completion & Letter of Recommendation',
      'Direct 1-on-1 mentorship from principal architects',
      'Ship production code used by real-world users',
      'Fast-track to full-time Associate SWE offer',
    ],
    type: 'frontend' as const,
  },
  {
    title: 'Backend Systems & API Intern',
    domain: 'Full Stack Web Development',
    description:
      'Focus on scalable distributed architecture, RESTful & GraphQL API design, database caching, and high-throughput server systems.',
    duration: '16 weeks',
    location: 'Remote',
    stipend: '$650 - $950 / month',
    startDate: 'July 2026',
    mode: 'Remote',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'MongoDB'],
    benefits: [
      'System architecture workshops & design reviews',
      'Hands-on cloud orchestration with AWS & Docker',
      'Monthly learning and certification stipend',
      'Flexible working hours & remote autonomy',
    ],
    type: 'backend' as const,
  },
  {
    title: 'UI/UX Product Design Intern',
    domain: 'UI/UX Design',
    description:
      'Craft delightful user experiences, high-fidelity prototypes, and comprehensive design systems. Partner closely with product management and engineering.',
    duration: '12 weeks',
    location: 'Hybrid / Remote',
    stipend: '$500 - $800 / month',
    startDate: 'June 2026',
    mode: 'Hybrid',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Wireframing'],
    benefits: [
      'Build a professional case-study portfolio for Big Tech',
      'Human-centered design thinking training',
      'Collaborative workspace & Figma workspace access',
      'Regular product critique & portfolio reviews',
    ],
    type: 'design' as const,
  },
  {
    title: 'Data Science & Analytics Intern',
    domain: 'Data Science & Analytics',
    description:
      'Extract actionable intelligence from large datasets, build analytical data pipelines, and develop predictive business intelligence models.',
    duration: '12 weeks',
    location: 'Remote',
    stipend: '$600 - $850 / month',
    startDate: 'June 2026',
    mode: 'Remote',
    skills: ['Python', 'SQL', 'Pandas', 'Tableau', 'Scikit-Learn', 'Statistics'],
    benefits: [
      'Real-world business intelligence case studies',
      'Data storytelling and executive presentation coaching',
      'Access to proprietary data analytics tools',
      'Alumni networking with industry data scientists',
    ],
    type: 'other' as const,
  },
  {
    title: 'Machine Learning & AI Intern',
    domain: 'Machine Learning',
    description:
      'Develop, fine-tune, and deploy modern machine learning models and generative AI systems to solve complex automation problems.',
    duration: '16 weeks',
    location: 'Remote',
    stipend: '$700 - $1,000 / month',
    startDate: 'July 2026',
    mode: 'Remote',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'NLP', 'Computer Vision'],
    benefits: [
      'GPU compute credits for model training & experimentation',
      'Research publication opportunities & mentorship',
      'Production ML deployment pipelines experience',
      'Direct guidance from AI researchers',
    ],
    type: 'backend' as const,
  },
  {
    title: 'Cyber Security Analyst Intern',
    domain: 'Cyber Security',
    description:
      'Audit web application security, analyze vulnerabilities, enforce zero-trust policies, and protect enterprise cloud infrastructure from emerging threats.',
    duration: '12 weeks',
    location: 'Remote',
    stipend: '$600 - $900 / month',
    startDate: 'June 2026',
    mode: 'Remote',
    skills: ['Network Security', 'OWASP Top 10', 'Penetration Testing', 'Linux', 'SIEM'],
    benefits: [
      'Hands-on ethical hacking & CTF challenge labs',
      'Security compliance (SOC2/ISO) exposure',
      'Industry recognized cybersecurity certification stipend',
      'Career mentorship from security engineers',
    ],
    type: 'other' as const,
  },
];

const Internships: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filterTabs = [
    { id: 'all', label: 'All Roles' },
    { id: 'frontend', label: 'Frontend / Full Stack' },
    { id: 'backend', label: 'Backend & Systems' },
    { id: 'design', label: 'UI/UX Design' },
    { id: 'other', label: 'AI, Data & Security' },
  ];

  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesLocation =
        selectedLocation === 'all' ||
        item.location.toLowerCase().includes(selectedLocation.toLowerCase());
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.skills.some((s) => s.toLowerCase().includes(q));

      return matchesType && matchesLocation && matchesSearch;
    });
  }, [selectedType, selectedLocation, searchTerm]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedLocation]);

  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage) || 1;
  const paginatedInternships = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInternships.slice(start, start + itemsPerPage);
  }, [filteredInternships, currentPage]);

  return (
    <section className="py-16 sm:py-24 bg-navy-50/60 relative overflow-hidden" id="internships">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-4 sm:px-0">
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-100 text-primary-700 px-4 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-wider">
            <HiSparkles className="w-4 h-4 text-accent-500" />
            <span>Cohorts 2026 Open</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-navy-900 mb-4 sm:mb-6 tracking-tight">
            Internship <span className="text-primary-600">Opportunities</span>
          </h2>
          <p className="text-base sm:text-lg text-navy-600 leading-relaxed font-medium">
            Explore industry-recognized internship tracks. Select a track to pre-fill your application form directly.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-12 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by role title, skill (e.g. React, Python, Figma) or domain..."
                className="w-full pl-12 pr-12 py-4 bg-white border border-navy-100 rounded-2xl shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-navy-900 text-sm font-medium transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 p-1"
                  aria-label="Clear search"
                >
                  <HiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Location Filter Dropdown */}
            <div className="sm:w-48">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-navy-100 rounded-2xl shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-navy-900 text-sm font-bold transition-all cursor-pointer"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-center pt-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  selectedType === tab.id
                    ? 'bg-navy-900 text-white shadow-md shadow-navy-900/20 scale-105'
                    : 'bg-white text-navy-600 border border-navy-100 hover:border-navy-300 hover:bg-navy-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-navy-500 px-2">
            <span>
              Showing <span className="text-primary-600 font-bold">{filteredInternships.length}</span> positions
            </span>
            {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedLocation('all');
                }}
                className="text-primary-600 hover:text-primary-800 font-bold underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Internship Cards Grid */}
        {paginatedInternships.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedInternships.map((internship, index) => (
                <div key={index} className="transform hover:-translate-y-2 transition-all duration-300">
                  <InternshipCard {...internship} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    currentPage === 1
                      ? 'bg-navy-100 text-navy-400 cursor-not-allowed'
                      : 'bg-white text-navy-800 border border-navy-200 hover:bg-navy-50 shadow-sm'
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                          : 'bg-white text-navy-700 border border-navy-100 hover:bg-navy-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    currentPage === totalPages
                      ? 'bg-navy-100 text-navy-400 cursor-not-allowed'
                      : 'bg-white text-navy-800 border border-navy-200 hover:bg-navy-50 shadow-sm'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-navy-100 shadow-sm">
            <p className="text-lg font-bold text-navy-900 mb-2">No internships found</p>
            <p className="text-xs text-navy-500 mb-6">
              We couldn&apos;t find any roles matching your current search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedLocation('all');
              }}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-16 sm:mt-24 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl shadow-navy-900/5 border border-navy-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary-500/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 transition-transform duration-700 group-hover:scale-150 pointer-events-none"></div>

          <h3 className="text-xl sm:text-3xl font-black text-navy-900 mb-8 flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-1 sm:w-8 sm:h-1 bg-accent-500 rounded-full"></span>
            What to Expect During Your Internship
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="group/item">
              <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2 text-base">
                <HiSparkles className="text-xl text-primary-600 group-hover/item:scale-125 transition-transform" />
                Hands-on Mentorship
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 leading-relaxed font-medium">
                Paired with senior engineers for sprint reviews, architectural critique, and weekly 1:1 career guidance.
              </p>
            </div>
            <div className="group/item">
              <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2 text-base">
                <HiUsers className="text-xl text-primary-600 group-hover/item:scale-125 transition-transform" />
                Agile Teamwork
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 leading-relaxed font-medium">
                Participate in real standups, sprint retrospectives, and cross-functional design-to-engineering handoffs.
              </p>
            </div>
            <div className="group/item">
              <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2 text-base">
                <HiPaperAirplane className="text-xl text-primary-600 group-hover/item:scale-125 transition-transform" />
                Live Production Code
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 leading-relaxed font-medium">
                Deploy tested features directly to staging and production platforms with automated CI/CD workflows.
              </p>
            </div>
            <div className="group/item">
              <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2 text-base">
                <HiTrendingUp className="text-xl text-primary-600 group-hover/item:scale-125 transition-transform" />
                PPO & Placement
              </h4>
              <p className="text-xs sm:text-sm text-navy-600 leading-relaxed font-medium">
                Over 78% of top-performing interns receive pre-placement offers (PPOs) or recommendation letters for Big Tech.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Internships;
