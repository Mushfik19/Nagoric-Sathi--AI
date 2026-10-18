import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  BarChart3,
  BookOpen,
  PlusCircle,
  Menu,
  X,
  LogIn,
  Sun,
  Moon,
  Shield,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setDevDemoDrawerOpen, isDevDemoDrawerOpen } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [isEasyMode, setIsEasyMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleEasyMode = () => {
    setIsEasyMode(!isEasyMode);
    document.body.classList.toggle('easy-mode');
  };

  const navLinks = [
    { label: language === 'bn' ? 'মূল পাতা' : 'Overview', path: '/', num: '01' },
    { label: language === 'bn' ? 'সমস্যা জানান' : 'Report', path: '/report', num: '02' },
    { label: language === 'bn' ? 'নগর মানচিত্র' : 'City Map', path: '/map', num: '03' },
    { label: language === 'bn' ? 'সেবা নির্দেশিকা' : 'Services', path: '/services', num: '04' },
    { label: language === 'bn' ? 'নাগরিক স্বচ্ছতা' : 'Transparency', path: '/transparency', num: '05' }
  ];

  return (
    <>
      <header
        className={`lux-topbar sticky top-0 z-40 w-full transition-all duration-300 border-b border-[var(--line)] ${
          isScrolled ? 'py-2.5 shadow-sm' : 'py-3.5'
        }`}
      >
        <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo & Editorial Title */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] flex items-center justify-center text-[#166534] group-hover:border-[#166534] transition shadow-xs">
              <Sparkles className="w-5 h-5 text-[#166534]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-widest text-[var(--ink)] uppercase flex items-center gap-1.5 leading-none">
                NAGORIK SATHI <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#eaf5ed] text-[#166534] font-bold border border-[#bbf7d0]">AI</span>
              </span>
              <span className="text-[9px] font-mono tracking-wider text-[var(--muted)] mt-1">
                THE CONNECTED CITY · নাগরিক সাথী
              </span>
            </div>
          </Link>

          {/* Center Editorial Nav (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-bold tracking-wider uppercase transition-colors relative py-1.5 ${
                    isActive
                      ? 'text-[#166534]'
                      : 'text-[var(--ink)] hover:text-[#166534]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#166534] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Easy UI Mode Toggle */}
            <button
              type="button"
              onClick={toggleEasyMode}
              className={`hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                isEasyMode
                  ? 'bg-[#166534] text-white border-[#166534]'
                  : 'bg-white text-[var(--ink)] border-[var(--line)] hover:border-[#166534]'
              }`}
            >
              {isEasyMode ? 'সহজ মোড অন' : 'সহজ ব্যবহার'}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-[var(--line)] bg-white p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 rounded font-bold transition cursor-pointer ${
                  language === 'bn' ? 'bg-[#166534] text-white' : 'text-[var(--ink)] hover:text-[#166534]'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded font-bold transition cursor-pointer ${
                  language === 'en' ? 'bg-[#166534] text-white' : 'text-[var(--ink)] hover:text-[#166534]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle (Dark / Ivory) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--ink)] hover:border-[#166534] transition cursor-pointer"
              aria-label="থিম পরিবর্তন করুন"
              title="Dark / Ivory Light Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#8c6820]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Demo Role Switcher Trigger */}
            <button
              type="button"
              onClick={() => setDevDemoDrawerOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0fdf4] hover:bg-[#eaf5ed] text-[#166534] border border-[#bbf7d0] text-xs font-bold transition cursor-pointer shadow-xs"
              title="৫টি রোল ওয়ার্কস্পেস ডেমো"
            >
              <Code className="w-3.5 h-3.5" />
              <span>রোল ডেমো</span>
            </button>

            {/* Login / Portal Entry Button */}
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগইন ও পোর্টাল</span>
            </Link>

            {/* Mobile Hamburger Menu */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--bg)] transition cursor-pointer"
              aria-label="মেনু খুলুন"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Editorial Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d100e]/98 flex flex-col p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-6 border-b border-[#343d34]">
            <span className="text-sm font-extrabold tracking-widest text-[#d4c19a]">
              NAGORIK SATHI AI
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--green-light)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="my-8 space-y-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 border-b border-[#343d34]/60 text-lg font-light text-[#eeeee6] hover:text-[#d4c19a] transition"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#d4c19a]">{link.num}</span>
                  <span>{link.label}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#a7b0a8]" />
              </Link>
            ))}
          </nav>

          {/* Inspirational Editorial Quote */}
          <div className="mt-auto p-4 rounded-xl bg-[#151a16] border border-[#343d34] text-xs text-[#a7b0a8] space-y-2">
            <strong className="text-[#eeeee6] block text-sm">A voice for every citizen.</strong>
            <p>One report. Connected teams. A solution you can verify.</p>
            <span className="text-[#d4c19a] font-semibold block text-[11px]">“AI proposes, People decide.”</span>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setDevDemoDrawerOpen(true);
              }}
              className="flex-1 py-3 rounded-xl bg-[#295e42] text-[#d4c19a] font-bold text-xs text-center"
            >
              ৫টি রোল ওয়ার্কস্পেস ডেমো
            </button>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 py-3 rounded-xl bg-[#d4c19a] text-[#0d100e] font-bold text-xs text-center"
            >
              লগইন পোর্টাল
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
