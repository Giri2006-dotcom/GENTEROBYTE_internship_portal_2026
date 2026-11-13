'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiMenu, HiX, HiShieldCheck, HiLogout } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Internships', href: '/internships' },
    { name: 'Achievements', href: '/achievements' },
    { name: 'Track Status', href: '/track' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-navy-900/95 backdrop-blur-md shadow-xl py-2 sm:py-3 border-b border-white/10'
          : 'bg-white/70 backdrop-blur-md py-4 sm:py-5 border-b border-navy-100/20'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
            <motion.div
              whileHover={{ scale: 1.05, rotateZ: 2 }}
              className="profile-image border-2 border-primary-500/20 group-hover:border-primary-500 transition-all duration-300 shadow-lg shrink-0"
            >
              <Image
                src="/logo.svg"
                alt="Gentrobyte Logo"
                width={60}
                height={60}
                className="object-cover"
                priority
              />
            </motion.div>
            
            <span className={`text-sm sm:text-xl font-bold transition-colors duration-300 truncate ${isScrolled ? 'text-white' : 'text-navy-900'}`}>
              Gentrobyte
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-semibold text-sm transition-all duration-200 hover:scale-105 ${
                  isScrolled 
                    ? 'text-navy-100 hover:text-accent-400' 
                    : 'text-navy-700 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action Section (Auth + Apply) - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              user.role === 'recruiter' || user.role === 'admin' ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/recruiter"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-600/20 hover:bg-primary-600/30 text-primary-600 dark:text-primary-300 border border-primary-500/40 text-xs font-bold transition-all shadow-sm"
                  >
                    <HiShieldCheck className="w-4 h-4 text-primary-500" />
                    <span>Recruiter Portal</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-navy-400 hover:text-red-500 transition-colors rounded-full"
                    title="Sign Out"
                  >
                    <HiLogout className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/track"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-800 text-xs font-bold transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-navy-400 hover:text-red-500 transition-colors rounded-full"
                    title="Sign Out"
                  >
                    <HiLogout className="w-4 h-4" />
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${
                    isScrolled
                      ? 'text-navy-200 border-navy-700 hover:border-white hover:text-white'
                      : 'text-navy-700 border-navy-200 hover:border-navy-400 hover:text-navy-950'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={`text-xs font-bold px-3.5 py-2 rounded-full transition-all ${
                    isScrolled
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-navy-100 text-navy-800 hover:bg-navy-200'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              href="/apply"
              className="bg-accent-600 hover:bg-accent-700 text-white px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-accent-600/20 hover:shadow-accent-600/40 hover:-translate-y-0.5 active:scale-95 flex items-center group"
            >
              <span>Apply Now</span>
              <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Mobile Right Bar: Sign In shortcut + Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {!user ? (
              <Link
                href="/login"
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  isScrolled
                    ? 'text-white border-white/20 bg-white/10'
                    : 'text-navy-900 border-navy-200 bg-white'
                }`}
              >
                Sign In
              </Link>
            ) : (
              <Link
                href="/track"
                className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-colors ${
                isScrolled ? 'text-white hover:bg-white/10' : 'text-navy-900 hover:bg-navy-50'
              }`}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation"
            role="region"
            aria-label="Mobile Navigation"
            className="md:hidden mt-2 pb-4 animate-fade-in px-2 sm:px-0"
          >
            <div className={`flex flex-col space-y-3 p-5 rounded-2xl shadow-2xl border ${isScrolled ? 'bg-navy-800 border-navy-700' : 'bg-white border-navy-100'}`}>
              {/* User info if logged in */}
              {user && (
                <div className="flex items-center justify-between pb-3 border-b border-navy-100/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isScrolled ? 'text-white' : 'text-navy-900'}`}>{user.name}</p>
                      <p className="text-[10px] text-navy-400 truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-400 font-bold px-2 py-1 bg-red-950/20 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-bold transition-colors duration-200 text-base py-2 border-b border-navy-50/10 last:border-0 ${
                    isScrolled ? 'text-white hover:text-accent-400' : 'text-navy-900 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Recruiter or Sign In link */}
              {user?.role === 'recruiter' ? (
                <Link
                  href="/recruiter"
                  className="bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HiShieldCheck className="w-5 h-5" />
                  <span>Recruiter Portal</span>
                </Link>
              ) : !user ? (
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs text-center border ${
                        isScrolled ? 'text-white border-navy-700 bg-navy-700/50' : 'text-navy-900 border-navy-200 bg-navy-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2.5 rounded-xl font-bold text-xs text-center bg-primary-600 text-white shadow-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                  <Link
                    href="/recruiter/login"
                    className="w-full px-4 py-2 rounded-xl font-bold text-xs text-center bg-navy-950 text-navy-300 border border-navy-800 flex items-center justify-center gap-1.5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiShieldCheck className="w-3.5 h-3.5 text-accent-400" />
                    <span>Company Recruiter Access →</span>
                  </Link>
                </div>
              ) : null}

              <Link
                href="/apply"
                className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 text-center shadow-lg shadow-accent-600/20 mt-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Apply Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
