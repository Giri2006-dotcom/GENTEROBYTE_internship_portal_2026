'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart,
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-navy-300 border-t border-navy-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 px-2 sm:px-0">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2 group cursor-pointer justify-center sm:justify-start">
              <motion.div
                whileHover={{ scale: 1.05, rotateZ: -2 }}
                className="profile-image border-2 border-white/10 group-hover:border-primary-500 transition-all duration-300 shadow-lg shrink-0"
              >
                <Image
                  src="/logo.svg"
                  alt="Gentrobyte Logo"
                  width={60}
                  height={60}
                  className="object-cover"
                />
              </motion.div>
              <span className="text-lg sm:text-2xl font-black text-white tracking-tight">Gentrobyte</span>
            </div>
            <p className="text-navy-300 leading-relaxed text-[11px] sm:text-sm text-center sm:text-left px-4 sm:px-0">
              Empowering the next generation of tech innovators through
              world-class internship programs and real-world experience. Join our ecosystem of creators.
            </p>
            <div className="flex space-x-4 justify-center sm:justify-start">
              {[
                { icon: <FaLinkedin />, href: "https://linkedin.com/company/gentrobyte", label: "LinkedIn" },
                { icon: <FaTwitter />, href: "https://twitter.com/gentrobyte", label: "Twitter" },
                { icon: <FaGithub />, href: "https://github.com/gentrobyte", label: "GitHub" },
                { icon: <FaInstagram />, href: "https://instagram.com/gentrobyte", label: "Instagram" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-navy-800 p-2.5 rounded-lg text-navy-300 hover:text-accent-500 hover:bg-navy-700 transition-all duration-300 border border-navy-700 hover:border-accent-500/50"
                  aria-label={social.label}
                >
                  {React.cloneElement(social.icon as React.ReactElement, { className: "h-4 w-4 sm:h-5 sm:w-5" })}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'About Gentrobyte', href: '/about' },
                { name: 'Internships', href: '/internships' },
                { name: 'Achievements', href: '/achievements' },
                { name: 'Apply Now', href: '/apply' },
                { name: 'Track Application', href: '/track' },
                { name: 'Recruiter Portal', href: '/recruiter/login' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-navy-300 hover:text-primary-500 transition-all duration-200 flex items-center group text-[13px] sm:text-sm"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Careers', href: '/careers' },
                { name: 'Contact Us', href: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-navy-300 hover:text-accent-500 transition-all duration-200 flex items-center group text-[13px] sm:text-sm"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-accent-500 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <div className="bg-navy-800 p-2 rounded-lg border border-navy-700 group-hover:border-primary-500 transition-colors">
                  <FaEnvelope className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
                </div>
                <a
                  href="mailto:internships@gentrobyte.com"
                  className="text-navy-300 hover:text-white transition-colors text-[13px] sm:text-sm pt-0.5"
                >
                  internships@gentrobyte.com
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="bg-navy-800 p-2 rounded-lg border border-navy-700 group-hover:border-primary-500 transition-colors">
                  <FaPhone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
                </div>
                <a
                  href="tel:+1234567890"
                  className="text-navy-300 hover:text-white transition-colors text-[13px] sm:text-sm pt-0.5"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="bg-navy-800 p-2 rounded-lg border border-navy-700 group-hover:border-primary-500 transition-colors">
                  <FaMapMarkerAlt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
                </div>
                <span className="text-navy-300 text-[13px] sm:text-sm pt-0.5 leading-relaxed">
                  123 Innovation Drive, Tech City
                  <br />
                  Silicon Valley, CA 94025
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-navy-950 border-t border-navy-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <span className="text-navy-500 text-xs font-bold uppercase tracking-widest">Powered by</span>
              <span className="text-white font-bold text-sm">Gentrobyte OS</span>
            </div>
            <p className="text-navy-500 text-xs font-medium">
              © {currentYear} Gentrobyte. All rights reserved. Designed for Excellence.
            </p>
            <div className="flex items-center space-x-1 text-xs font-bold text-navy-500">
              <span>Made with</span>
              <FaHeart className="text-accent-500 h-4 w-4" />
              <span>for innovators</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
