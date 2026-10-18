import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { APP_NAME_BN } from '../../constants';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Sparkles,
  LogOut,
  User,
  Shield,
  Layers,
  Wrench,
  GitMerge,
  Code,
  Sun,
  Moon
} from 'lucide-react';

export const AuthenticatedHeader: React.FC = () => {
  const { currentUser, activeRole, logout, setDevDemoDrawerOpen } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'ward_desk':
        return { label: 'ওয়ার্ড ডেস্ক', bg: 'bg-[#ecfeff] text-[#0e7490] border-[#a5f3fc]', icon: <Shield className="w-4 h-4" /> };
      case 'field_officer':
        return { label: 'দপ্তর কর্মকর্তা', bg: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]', icon: <Wrench className="w-4 h-4" /> };
      case 'coordinator':
        return { label: 'কেস সমন্বয়ক', bg: 'bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]', icon: <GitMerge className="w-4 h-4" /> };
      case 'admin':
        return { label: 'সিস্টেম অ্যাডমিন', bg: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]', icon: <Shield className="w-4 h-4" /> };
      default:
        return { label: 'নাগরিক', bg: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]', icon: <User className="w-4 h-4" /> };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className="lux-topbar sticky top-0 z-40 py-3 px-4 sm:px-6 shadow-xs border-b border-[var(--line)]">
      <div className="max-w-[1540px] mx-auto flex items-center justify-between gap-4">
        {/* Brand & Active Workspace */}
        <div className="flex items-center gap-3.5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center shadow-xs group-hover:border-[#166534] transition">
              <Sparkles className="w-4 h-4 text-[#166534]" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-sm text-[var(--ink)] tracking-wider uppercase leading-none">
                NAGORIK SATHI <span className="text-[#166534]">AI</span>
              </span>
              <span className="text-[11px] font-medium text-[var(--muted)] mt-0.5">
                {APP_NAME_BN}
              </span>
            </div>
          </Link>

          <span className="text-[var(--line)] hidden sm:inline">|</span>

          {/* Active Role Indicator */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border ${badge.bg} shadow-xs`}>
            {badge.icon}
            <span>{badge.label} ওয়ার্কস্পেস</span>
          </div>
        </div>

        {/* Right User Meta & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[#166534] transition cursor-pointer"
            title="Dark / Ivory Light Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#8c6820]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Developer Demo Tooling Trigger */}
          <button
            type="button"
            onClick={() => setDevDemoDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#166534] hover:bg-[#eaf5ed] transition cursor-pointer shadow-xs"
            title="রোল পরিবর্তন মেনু"
          >
            <Code className="h-4 w-4" />
            <span className="hidden md:inline">রোল পরিবর্তন</span>
          </button>

          {/* Interactive Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile Info */}
          {currentUser && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[var(--line)]">
              <div className="w-8 h-8 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {currentUser.name ? currentUser.name.slice(0, 2) : 'NS'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-sm text-[var(--ink)] leading-none">{currentUser.name}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{currentUser.designation || currentUser.role}</p>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[#991b1b] hover:bg-[#fef2f2] transition cursor-pointer"
                title="লগআউট"
                aria-label="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
