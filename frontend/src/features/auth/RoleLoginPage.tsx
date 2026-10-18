import React, { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  UserRound,
  Sparkles,
  CheckCircle2,
  Phone,
  ShieldCheck,
  AlertCircle,
  Clock,
  MapPin,
  Lock,
  Landmark
} from 'lucide-react';
import { DEMO_ROLES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const destinations: Record<UserRole, string> = {
  citizen: '/',
  ward_desk: '/ward',
  field_officer: '/officer',
  coordinator: '/coordinator',
  admin: '/admin'
};

const roleTitles: Record<UserRole, string> = {
  citizen: 'নাগরিক (Citizen)',
  ward_desk: 'ওয়ার্ড ডেস্ক অফিসার (Ward Desk)',
  field_officer: 'দপ্তর কর্মকর্তা (Department Officer)',
  coordinator: 'কেস সমন্বয়ক (Case Coordinator)',
  admin: 'সিস্টেম অ্যাডমিন (Administrator)'
};

export const RoleLoginPage: React.FC = () => {
  const { role: requestedRole } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsRole } = useAuth();

  const role = (
    !requestedRole || requestedRole === 'citizen'
      ? 'citizen'
      : requestedRole === 'ward'
      ? 'ward_desk'
      : requestedRole === 'officer'
      ? 'field_officer'
      : requestedRole
  ) as UserRole;

  const selected = DEMO_ROLES.find(item => item.role === role) ?? DEMO_ROLES[0];

  // Citizen Login Form State
  const [phone, setPhone] = useState('01712-345678');
  const [name, setName] = useState('আব্দুল্লাহ আল মামুন');
  const [ward, setWard] = useState('ward_03');

  // Check if citizen was redirected from a protected action (like /report)
  const redirectTarget = (location.state as any)?.from?.pathname || destinations[selected.role];
  const redirectState = (location.state as any)?.from?.state;

  const handleCitizenLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    loginAsRole('citizen');
    navigate(redirectTarget, { state: redirectState, replace: true });
  };

  const handleStaffLogin = () => {
    loginAsRole(selected.role);
    navigate(destinations[selected.role], { replace: true });
  };

  // 1. DEDICATED CITIZEN LOGIN & REGISTRATION INTERFACE
  if (role === 'citizen') {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-200">
        <Link
          to="/"
          className="mb-6 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[#166534] transition"
        >
          <ArrowLeft size={16} aria-hidden="true" /> মূল পাতায় ফেরত যান (Home)
        </Link>

        {/* Redirect Context Alert (e.g. from "সমস্যা জানান") */}
        {redirectTarget === '/report' && (
          <div className="mb-5 p-4 rounded-2xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-bold text-sm block mb-0.5">সমস্যা রিপোর্ট করতে লগইন আবশ্যক</strong>
              <span>
                নাগরিক সমস্যার সঠিক নিষ্পত্তি, রিয়েল-টাইম অগ্রগতি ট্র্যাকিং এবং সমাধান পরবর্তী যাচাইয়ের জন্য অনুগ্রহ করে আপনার নাগরিক একাউন্টে প্রবেশ করুন।
              </span>
            </div>
          </div>
        )}

        <section className="civic-card-elevated rounded-2xl p-6 sm:p-8 border border-[var(--line)] bg-[var(--paper)] shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 border-b border-[var(--line)] pb-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#bbf7d0] bg-[#eaf5ed] text-[#166534] shadow-xs">
              <UserRound size={22} aria-hidden="true" />
            </span>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#166534] bg-[#eaf5ed] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                নাগরিক প্রবেশদ্বার · CITIZEN ACCESS
              </span>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[var(--ink)]">
                নাগরিক লগইন ও রেজিস্ট্রেশন
              </h1>
              <p className="mt-1 text-xs text-[var(--muted)]">
                সমস্যা দাখিল ও সমাধান ট্র্যাকিংয়ের জন্য মোবাইল নম্বর দিয়ে প্রবেশ করুন
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCitizenLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                মোবাইল নম্বর (Mobile Number)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs font-mono font-medium focus:outline-none focus:border-[#166534] transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                নাগরিকের পুরো নাম (Full Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs font-medium focus:outline-none focus:border-[#166534] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                আপনার এলাকা / সিটি কর্পোরেশন ওয়ার্ড
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs font-medium focus:outline-none focus:border-[#166534] transition"
                >
                  <option value="ward_03">ওয়ার্ড ৩ (মিরপুর ১০, ঢাকা উত্তর)</option>
                  <option value="ward_12">ওয়ার্ড ১২ (ধানমন্ডি ২৭, ঢাকা দক্ষিণ)</option>
                  <option value="ward_08">ওয়ার্ড ৮ (গুলশান ১, ঢাকা উত্তর)</option>
                  <option value="ward_19">ওয়ার্ড ১৯ (বনানী, ঢাকা উত্তর)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-md mt-2"
            >
              <span>নাগরিক পোর্টালে সরাসরি প্রবেশ করুন</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Citizen Facilities & Guarantees */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 text-xs space-y-2.5">
            <h3 className="font-bold text-[var(--ink)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#166534]" />
              <span>নাগরিক সুরক্ষা ও প্ল্যাটফর্ম সুবিধা:</span>
            </h3>
            <ul className="space-y-1.5 text-[var(--muted)] pl-5 list-disc text-[11px] leading-relaxed">
              <li>সম্পূর্ণ বিনামূল্যে এলাকার রাস্তা, ড্রেন, বর্জ্য ও সড়ক বাতির সমস্যা রিপোর্ট।</li>
              <li>এআই স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট সিটি কর্পোরেশন ওয়ার্ড ও দপ্তর নির্ধারণ করে দেবে।</li>
              <li>মাঠ কর্মকর্তার কাজের আগের ও পরের ছবি জিপিএস প্রমাণসহ যাচাই করার অধিকার।</li>
              <li>কাজ সন্তোষজনক না হলে ৭২ ঘণ্টার মধ্যে আপত্তি জানিয়ে পুনঃতদন্তের নিশ্চয়তা।</li>
            </ul>
          </div>

          {/* Discreet link for staff/officials */}
          <div className="pt-4 border-t border-[var(--line)] text-center text-xs text-[var(--muted)]">
            <span>আপনি কি সিটি কর্পোরেশনের দায়িত্বপ্রাপ্ত কর্মকর্তা? </span>
            <Link to="/roles" className="text-[#166534] font-bold hover:underline inline-flex items-center gap-1">
              <span>দাপ্তরিক ওয়ার্কস্পেস তালিকায় যান</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // 2. OFFICIAL / STAFF WORKSPACE LOGIN
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-200">
      <Link
        to="/roles"
        className="mb-6 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[#166534] transition"
      >
        <ArrowLeft size={16} aria-hidden="true" /> সকল ওয়ার্কস্পেসের তালিকায় ফেরত যান
      </Link>

      <section className="civic-card-elevated rounded-2xl p-6 sm:p-8 border border-[var(--line)] bg-[var(--paper)] shadow-xl" aria-labelledby="access-heading">
        <div className="mb-6 flex items-start gap-4 border-b border-[var(--line)] pb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[#166534]">
            <Landmark size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#166534]">দাপ্তরিক ওয়ার্কস্পেস প্রবেশ</p>
            <h1 id="access-heading" className="mt-1 text-xl sm:text-2xl font-extrabold text-[var(--ink)]">
              {roleTitles[selected.role]}
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)]">সিটি কর্পোরেশন সমন্বিত সেবা অপারেশনাল কন্ট্রোল</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 text-xs text-[var(--muted)] leading-relaxed">
            <h2 className="text-sm font-semibold text-[var(--ink)] mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166534]" />
              <span>ভূমিকা ভিত্তিক প্রবেশাধিকার ও নিরাপত্তা</span>
            </h2>
            <p>
              এই রোল দিয়ে প্রবেশ করলে সংশ্লিষ্ট বিভাগের কাজ, অনুমোদন চেইন, আরবিক রুলস (RBAC) এবং অপরিবর্তনীয় অডিট ট্রেইল প্রযোজ্য হবে।
            </p>
          </div>

          <button
            type="button"
            onClick={handleStaffLogin}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] px-5 text-xs font-bold text-white uppercase tracking-wider transition shadow-md cursor-pointer"
          >
            <span>{selected.title} ওয়ার্কস্পেসে প্রবেশ করুন</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>

          <div className="border-t border-[var(--line)] pt-5">
            <h3 className="text-xs font-semibold text-[var(--ink)] mb-3">অন্যান্য দাপ্তরিক রোলে পরিবর্তন করুন:</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_ROLES.filter(r => r.role !== 'citizen').map(item => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    loginAsRole(item.role);
                    navigate(destinations[item.role]);
                  }}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-left text-xs font-medium text-[var(--ink)] hover:border-[#166534] hover:text-[#166534] transition cursor-pointer"
                >
                  {roleTitles[item.role]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
