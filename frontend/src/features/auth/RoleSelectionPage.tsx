import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, ClipboardList, UserRound, UsersRound } from 'lucide-react';
import { DEMO_ROLES } from '../../constants';

const icons = [UserRound, ClipboardList, BriefcaseBusiness, UsersRound, Building2];
const paths: Record<string, string> = {
  citizen: '/login/citizen',
  ward_desk: '/login/ward',
  field_officer: '/login/officer',
  coordinator: '/login/coordinator',
  admin: '/login/admin'
};
const copy: Record<string, { title: string; description: string; badge: string }> = {
  citizen: { title: 'নাগরিক (Citizen)', description: 'সমস্যা দাখিল, টাইমলাইন দেখা ও সমাধান আপত্তি।', badge: 'Citizen Portal' },
  ward_desk: { title: 'ওয়ার্ড ডেস্ক (Ward Desk)', description: 'যাচাই কিউ (<৮০% AI), ডুপ্লিকেট শনাক্তকরণ ও ওয়াক-ইন গ্রহণ।', badge: 'Ward Operations' },
  field_officer: { title: 'দপ্তর কর্মকর্তা (Dept Officer)', description: 'দাপ্তরিক অনুরোধ গ্রহণ/প্রত্যাখ্যান, উপস্থিতি ও প্রমাণ আপলোড।', badge: 'Field Operations' },
  coordinator: { title: 'কেস সমন্বয়ক (Case Coordinator)', description: 'বহু-বিভাগীয় টাস্ক ক্রম আনলক, এসএলএ মনিটরিং ও হটস্পট।', badge: 'Central Command' },
  admin: { title: 'সিস্টেম অ্যাডমিন (Administrator)', description: 'এআই কনফিডেন্স গেট থ্রেশহোল্ড, এসএলএ ও অডিট হ্যাশ চেইন।', badge: 'System Governance' }
};

export const RoleSelectionPage: React.FC = () => (
  <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-200">
    <Link to="/" className="mb-6 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--gold)] transition">
      <ArrowLeft size={16} aria-hidden="true" /> মূল পাতায় ফেরত যান (Public Home)
    </Link>
    <header className="mb-6 space-y-2">
      <div className="text-[10px] font-mono tracking-widest text-[var(--gold)] uppercase">
        NAGORIK SATHI AI · ROLE SELECTION
      </div>
      <h1 className="text-2xl sm:text-3xl font-light text-[var(--ink)]">
        পৌর ভূমিকা নির্বাচন করুন · <strong className="font-semibold text-[var(--gold)]">Select Persona</strong>
      </h1>
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        নাগরিক সাথী এআই প্ল্যাটফর্মের ৫টি পৃথক অপারেশনাল ওয়ার্কস্পেস রয়েছে। যে কোনো ওয়ার্কস্পেস নির্বাচন করে নির্দিষ্ট দায়িত্ব ও ফিচার পরীক্ষা করুন।
      </p>
    </header>

    <div className="space-y-3">
      {DEMO_ROLES.map((role, index) => {
        const Icon = icons[index];
        const roleInfo = copy[role.role] || { title: role.title, description: role.subtitle, badge: role.role };
        return (
          <Link
            key={role.role}
            to={paths[role.role] || `/login/${role.role}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 transition hover:border-[var(--gold)] hover:bg-[var(--green-light)] cursor-pointer shadow-sm"
          >
            <span className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--gold)] group-hover:scale-105 transition-transform">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--gold)] transition">
                  {roleInfo.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[var(--muted)]">
                  {roleInfo.description}
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-[var(--gold)]">
              <span className="hidden sm:inline px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px] font-mono">
                {roleInfo.badge}
              </span>
              <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        );
      })}
    </div>
  </main>
);
