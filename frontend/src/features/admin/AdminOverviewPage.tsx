import React from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { toBanglaNumber } from '../../utils/formatters';
import { Shield, Sparkles, Sliders, Users, FileText, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { cases } = useCases();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3.5 py-1 rounded-full border border-[var(--line)]">
              গভর্ন্যান্স ও সিস্টেম প্রশাসন
            </span>
            <span className="text-xs text-[var(--muted)]">প্ল্যাটফর্ম অডিট ও নীতি কনফিগারেশন</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            প্ল্যাটফর্ম গভর্ন্যান্স ও প্রশাসন কনসোল (Admin Console)
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
            এআই রাউটিং গেট, দায়িত্ব নীতিমালা, ব্যবহারকারী রোল (RBAC) ও অপরিবর্তনীয় অডিট লগ নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono px-3.5 py-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--gold)] font-bold">
            সিস্টেম সংস্করণ: v2.4 (R&D v1.2 Compliant)
          </span>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          to="/admin/ai-gate"
          className="rounded-2xl p-6 sm:p-7 block group bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--green)] hover:bg-[var(--green-light)] transition shadow-xl space-y-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--green-light)] border border-[var(--line)] text-[var(--green)] flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition">
            এআই রাউটিং গেট কনফিগারেশন
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            ৮০% কনফিডেন্স থ্রেশহোল্ড ও ক্রিটিক্যাল ফ্ল্যাগ যাচাই নীতিমালা নির্ধারণ করুন।
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--green)] group-hover:translate-x-1.5 transition-transform">
            <span>কনফিগ পরিচালনা</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/rules"
          className="rounded-2xl p-6 sm:p-7 block group bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--gold)] hover:bg-[var(--green-light)] transition shadow-xl space-y-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-[#373224] border border-amber-200 dark:border-[#6b5c3e] text-amber-700 dark:text-[#d4c19a] flex items-center justify-center mb-2">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[var(--gold)] transition">
            দায়িত্ব নীতিমালা ইঞ্জিন (Rules)
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            ওয়ার্ড ও অ্যাসেট ভিত্তিক দায়িত্ব বিধি (যেমন Rule R-12) ও সংস্করণ অনুমোদন।
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--gold)] group-hover:translate-x-1.5 transition-transform">
            <span>নীতিমালা দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/audit"
          className="rounded-2xl p-6 sm:p-7 block group bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--green)] hover:bg-[var(--green-light)] transition shadow-xl space-y-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--green-light)] border border-[var(--line)] text-[var(--green)] flex items-center justify-center mb-2">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition">
            অপরিবর্তনীয় অডিট লগ (Audit Trail)
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            প্ল্যাটফর্মের প্রতিটি পদক্ষেপ, ওভাররাইড ও নীতি পরিবর্তনের টাইমস্ট্যাম্পড লগ।
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--green)] group-hover:translate-x-1.5 transition-transform">
            <span>অডিট লগ পরিবীক্ষণ</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="rounded-2xl p-6 sm:p-7 block group bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--green)] hover:bg-[var(--green-light)] transition shadow-xl space-y-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] flex items-center justify-center mb-2">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition">
            ব্যবহারকারী ও ভূমিকা (RBAC)
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            কর্মকর্তা প্রোফাইল, বিভাগ ও ওয়ার্ড অনুযায়ী অ্যাক্সেস পারমিশন ম্যাপিং।
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--green)] group-hover:translate-x-1.5 transition-transform">
            <span>ইউজার তালিকা</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/services"
          className="rounded-2xl p-6 sm:p-7 block group bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--gold)] hover:bg-[var(--green-light)] transition shadow-xl space-y-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-[#373224] border border-amber-200 dark:border-[#6b5c3e] text-amber-700 dark:text-[#d4c19a] flex items-center justify-center mb-2">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[var(--gold)] transition">
            সেবা নলেজবেস ব্যবস্থাপনা
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            ১২টি অফিসিয়াল নাগরিক সেবার প্রয়োজনীয় ডকুমেন্টস ও ফি তথ্য আপডেট।
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--gold)] group-hover:translate-x-1.5 transition-transform">
            <span>নলেজবেস আপডেট</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/transparency"
          className="rounded-2xl p-6 sm:p-7 block group bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--green)] hover:bg-[var(--green-light)] transition shadow-xl space-y-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--green-light)] border border-[var(--line)] text-[var(--green)] flex items-center justify-center mb-2">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition">
            পাবলিক স্বচ্ছতা ড্যাশবোর্ড
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            নাগরিকদের জন্য প্রকাশিত সমন্বিত সমাধান হার ও পরিসংখ্যান পোর্টাল।
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--green)] group-hover:translate-x-1.5 transition-transform">
            <span>স্বচ্ছতা রিপোর্ট</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};
