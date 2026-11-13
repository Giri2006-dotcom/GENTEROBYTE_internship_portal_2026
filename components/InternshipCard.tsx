'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiClock, HiLocationMarker, HiArrowRight, HiCode, HiServer, HiSpeakerphone, HiPencil, HiCurrencyDollar, HiCalendar, HiCheckCircle } from 'react-icons/hi';

interface InternshipCardProps {
  title: string;
  description: string;
  duration: string;
  location: string;
  stipend: string;
  startDate: string;
  mode: string;
  skills: string[];
  benefits: string[];
  type: 'frontend' | 'backend' | 'marketing' | 'design' | 'other';
  domain?: string;
}

const InternshipCard: React.FC<InternshipCardProps> = ({
  title,
  description,
  duration,
  location,
  stipend,
  startDate,
  mode,
  skills,
  benefits,
  type,
  domain,
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'frontend':
        return 'bg-primary-50 text-primary-700 border-primary-100';
      case 'backend':
        return 'bg-navy-100 text-navy-700 border-navy-200';
      case 'marketing':
        return 'bg-accent-50 text-accent-700 border-accent-100';
      case 'design':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      default:
        return 'bg-navy-50 text-navy-600 border-navy-100';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'frontend':
        return <HiCode className="h-6 w-6" />;
      case 'backend':
        return <HiServer className="h-6 w-6" />;
      case 'marketing':
        return <HiSpeakerphone className="h-6 w-6" />;
      case 'design':
        return <HiPencil className="h-6 w-6" />;
      default:
        return <HiCode className="h-6 w-6" />;
    }
  };

  return (
    <motion.div
      whileHover={{ rotateY: 8, rotateX: 4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group bg-white rounded-3xl shadow-sm transition-all duration-500 overflow-hidden border border-navy-100 hover:border-primary-300 flex flex-col h-full mx-auto max-w-[340px] sm:max-w-none"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Card Header */}
      <div className="p-6 sm:p-8 border-b border-navy-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex items-start justify-between mb-3 sm:mb-6 relative z-10">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-2xl sm:text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{getTypeIcon()}</div>
            <div>
              <h3 className="text-base sm:text-2xl font-bold text-navy-900 group-hover:text-primary-600 transition-colors tracking-tight">
                {title}
              </h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold mt-1.5 border ${getTypeColor()}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-navy-600 leading-relaxed font-medium text-[11px] sm:text-sm">{description}</p>
      </div>

      {/* Card Body */}
      <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 flex-grow">
        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 text-[9px] sm:text-xs uppercase tracking-wider font-bold">
          <div className="flex items-center space-x-1.5 sm:space-x-3 text-navy-500 group-hover:text-navy-700 transition-colors">
            <HiClock className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary-500" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-3 text-navy-500 group-hover:text-navy-700 transition-colors">
            <HiLocationMarker className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary-500" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-3 text-navy-500 group-hover:text-navy-700 transition-colors">
            <HiCurrencyDollar className="h-5 w-5 text-primary-500" />
            <span>{stipend}</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-3 text-navy-500 group-hover:text-navy-700 transition-colors">
            <HiCalendar className="h-5 w-5 text-primary-500" />
            <span>Starts: {startDate} • {mode}</span>
          </div>
        </div>

        {/* Skills Required */}
        <div>
          <h4 className="text-[9px] uppercase tracking-wider font-black text-navy-400 mb-3 flex items-center">
            <span className="w-6 h-px bg-navy-200 mr-1.5"></span>
            Technical Stack
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-navy-50 text-navy-700 rounded-lg text-[9px] font-bold uppercase border border-navy-100 group-hover:border-primary-200 group-hover:bg-primary-50 transition-all duration-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div>
          <h4 className="text-[9px] uppercase tracking-wider font-black text-navy-400 mb-3 flex items-center">
            <span className="w-6 h-px bg-navy-200 mr-1.5"></span>
            Perks & Benefits
          </h4>
          <ul className="space-y-2.5">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-[11px] sm:text-sm text-navy-600 font-medium group/item hover:text-navy-900 transition-colors duration-300"
              >
                <HiCheckCircle className="text-accent-500 font-bold group-hover/item:scale-125 transition-transform mt-0.5 h-4 w-4" />
                <span className="group-hover/item:translate-x-1 transition-transform duration-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8 mt-auto">
        <Link
          href={`/apply?domain=${encodeURIComponent(domain || title)}`}
          className="group/btn w-full bg-navy-900 hover:bg-primary-600 text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl shadow-navy-900/10 hover:shadow-primary-600/30 active:scale-95"
        >
          <span className="uppercase tracking-widest text-xs">Apply for this Role</span>
          <HiArrowRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform text-accent-400" />
        </Link>
      </div>
    </motion.div>
  );
};

export default InternshipCard;
