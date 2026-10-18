import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Shield,
  FileText,
  MapPin,
  Users,
  Sparkles,
  Sliders,
  Settings,
  AlertTriangle,
  GitBranch,
  BookOpen,
  Inbox,
  Clock,
  UserCheck,
  BarChart2,
  ListTodo,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole, currentUser } = useAuth();
  const location = useLocation();

  if (activeRole === 'citizen') {
    return null;
  }

  const wardItems = [
    { label: 'ওয়ার্ড ওভারভিউ', path: '/ward', icon: <Layers className="w-4 h-4" /> },
    { label: 'যাচাই কিউ (<৮০% AI)', path: '/ward/verification', icon: <Shield className="w-4 h-4" /> },
    { label: 'ডুপ্লিকেট ক্লাস্টার', path: '/ward/duplicates', icon: <FileText className="w-4 h-4" /> },
    { label: 'ওয়ার্ড হটস্পট মানচিত্র', path: '/map', icon: <MapPin className="w-4 h-4" /> }
  ];

  const officerItems = [
    { label: 'আমার নির্ধারিত কাজ', path: '/officer', icon: <Layers className="w-4 h-4" /> },
    { label: 'দাপ্তরিক অনুরোধ গ্রহণ/প্রত্যাখ্যান', path: '/officer/requests', icon: <Inbox className="w-4 h-4" /> },
    { label: 'অ্যাসাইনমেন্ট কিউ ও রিকমেন্ডার', path: '/officer/assignment-queue', icon: <ListTodo className="w-4 h-4" /> },
    { label: 'উপস্থিতি ও ক্যাপাসিটি', path: '/officer/availability', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'বিভাগীয় ওয়ার্কলোড', path: '/officer/workload', icon: <BarChart2 className="w-4 h-4" /> },
    { label: 'ঘটনাস্থল মানচিত্র', path: '/map', icon: <MapPin className="w-4 h-4" /> }
  ];

  const coordinatorItems = [
    { label: 'কমান্ড সেন্টার ওভারভিউ', path: '/coordinator', icon: <Layers className="w-4 h-4" /> },
    { label: 'এসএলএ ও এস্কেলেশন মনিটর', path: '/coordinator/escalations', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'নগর হটস্পট অ্যানালিটিক্স', path: '/coordinator/hotspots', icon: <MapPin className="w-4 h-4" /> },
    { label: 'নগর মানচিত্র', path: '/map', icon: <MapPin className="w-4 h-4" /> }
  ];

  const adminItems = [
    { label: 'গভর্ন্যান্স ওভারভিউ', path: '/admin', icon: <Layers className="w-4 h-4" /> },
    { label: 'ব্যবহারকারী ও রোল (RBAC)', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'এআই গেট থ্রেশহোল্ড (৮০%)', path: '/admin/ai-gate', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'দায়িত্ব নীতিমালা (Rules)', path: '/admin/rules', icon: <Sliders className="w-4 h-4" /> },
    { label: 'সেবা নলেজবেস (RAG)', path: '/admin/services', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'অপরিবর্তনীয় অডিট লগ', path: '/admin/audit', icon: <FileText className="w-4 h-4" /> },
    { label: 'এসএলএ ও সিস্টেম সেটিংস', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const getItems = () => {
    switch (activeRole) {
      case 'ward_desk': return wardItems;
      case 'field_officer': return officerItems;
      case 'coordinator': return coordinatorItems;
      case 'admin': return adminItems;
      default: return [];
    }
  };

  const items = getItems();

  return (
    <aside className="hidden md:flex flex-col w-72 bg-[var(--paper)] text-[var(--muted)] border-r border-[var(--line)] shrink-0 min-h-[calc(100vh-70px)] select-none">
      {/* Workspace Header Strip */}
      <div className="p-5 border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs uppercase font-bold tracking-widest text-[#166534]">
            {activeRole === 'ward_desk' && 'ওয়ার্ড ডেস্ক কমান্ড'}
            {activeRole === 'field_officer' && 'দপ্তর কর্মকর্তা ওয়ার্কস্পেস'}
            {activeRole === 'coordinator' && 'সেন্ট্রাল কেস কোঅর্ডিনেশন'}
            {activeRole === 'admin' && 'সিস্টেম অ্যাডমিন ও গভর্ন্যান্স'}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
        </div>
        <p className="text-xs text-[var(--muted)]">অপারেশনাল কন্ট্রোল মেন্যু</p>
      </div>

      {/* Nav List */}
      <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer group ${
                isActive
                  ? 'bg-[#eaf5ed] text-[#166534] border border-[#bbf7d0] shadow-xs font-bold'
                  : 'text-[var(--ink)] hover:bg-[var(--bg)] hover:text-[#166534]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`p-1.5 rounded-lg border transition ${
                  isActive
                    ? 'bg-[var(--paper)] text-[#166534] border-[#bbf7d0]'
                    : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] group-hover:text-[#166534]'
                }`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                isActive ? 'text-[#166534] translate-x-0.5' : 'text-transparent group-hover:text-[var(--muted)]'
              }`} />
            </Link>
          );
        })}
      </nav>

      {/* Official Identity & Audit Stamp Card */}
      <div className="p-4 m-3.5 bg-[var(--bg)] rounded-2xl border border-[var(--line)] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            {currentUser?.name ? currentUser.name.slice(0, 2) : 'NS'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-[var(--ink)] truncate">{currentUser?.name || 'অফিসিয়াল ইউজার'}</h4>
            <p className="text-[11px] text-[var(--muted)] truncate">{currentUser?.designation || currentUser?.departmentName || 'দায়িত্বপ্রাপ্ত কর্মকর্তা'}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span className="flex items-center gap-1 text-[#166534] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অডিট সিকিউরড</span>
          </span>
          <span className="font-mono text-[var(--muted)] text-[10px]">SHA-256</span>
        </div>
      </div>
    </aside>
  );
};
