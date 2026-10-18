import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const usersList = [
    { name: 'আব্দুল্লাহ আল মামুন', role: 'নাগরিক (Citizen)', dept: 'নাগরিক পোর্টাল', ward: 'ওয়ার্ড ১২', mfa: true },
    { name: 'কামরুল হাসান', role: 'ওয়ার্ড ডেস্ক অফিসার (Ward Desk)', dept: 'ওয়ার্ড ১২ সেবা কেন্দ্র', ward: 'ওয়ার্ড ১২', mfa: true },
    { name: 'মোঃ শফিকুল ইসলাম', role: 'মাঠ পরিদর্শক (Field Officer)', dept: 'বর্জ্য ব্যবস্থাপনা বিভাগ', ward: 'ওয়ার্ড ১২ ও ১৩', mfa: true },
    { name: 'প্রকৌশলী তানভীর আহমেদ', role: 'সহকারী প্রকৌশলী (Field Officer)', dept: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ', ward: 'ওয়ার্ড ১২', mfa: true },
    { name: 'মাহমুদুল হক', role: 'প্রধান সমন্বয় কর্মকর্তা (Coordinator)', dept: 'সেন্ট্রাল কমান্ড সেন্টার', ward: 'সকল ওয়ার্ড', mfa: true },
    { name: 'মোছাঃ নাসরিন সুলতানা', role: 'সিস্টেম অ্যাডমিনিস্ট্রেটর (Admin)', dept: 'আইসিটি ও গভর্ন্যান্স শাখা', ward: 'সিটি কর্পোরেশন', mfa: true }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              RBAC ব্যবহারকারী ব্যবস্থাপনা
            </span>
            <span className="text-xs text-[var(--muted)]">ভূমিকা ও অধিকার প্রশাসন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            ব্যবহারকারী ও ভূমিকা প্রশাসন (User & Role Management)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            ভূমিকাভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ (RBAC), দ্বিমুখী প্রমাণীকরণ (MFA) ও ওয়ার্ড দায়িত্ব বরাদ্দ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition"
          >
            ← অ্যাডমিন কনসোলে ফিরুন
          </Link>
        </div>
      </div>

      <div className="civic-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--paper-elevated)] border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                <th className="p-3.5">কর্মকর্তার নাম</th>
                <th className="p-3.5">নির্ধারিত ভূমিকা (Role)</th>
                <th className="p-3.5">বিভাগ / শাখা</th>
                <th className="p-3.5">ওয়ার্ড দায়িত্ব</th>
                <th className="p-3.5">MFA সিকিউরিটি</th>
                <th className="p-3.5">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {usersList.map((u, i) => (
                <tr key={i} className="hover:bg-[var(--paper-elevated)] transition">
                  <td className="p-3.5 font-bold text-[var(--ink)]">{u.name}</td>
                  <td className="p-3.5 font-semibold text-[var(--gold)]">{u.role}</td>
                  <td className="p-3.5 text-[var(--muted)]">{u.dept}</td>
                  <td className="p-3.5 text-[var(--ink)] font-medium">{u.ward}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--green)] bg-[var(--green-light)] px-2 py-0.5 rounded border border-[var(--green)]/30">
                      <ShieldCheck className="w-3 h-3 text-[var(--green)]" /> সক্রিয়
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--muted)]">
                      অনুমোদিত
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
