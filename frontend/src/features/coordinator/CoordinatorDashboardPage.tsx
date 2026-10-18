import React from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import {
  Layers,
  GitMerge,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Shield,
  MapPin,
  Sparkles
} from 'lucide-react';

export const CoordinatorDashboardPage: React.FC = () => {
  const { cases } = useCases();

  const multiDeptCases = cases.filter(c => c.tasks && c.tasks.length > 1);
  const stalledCases = cases.filter(c => c.tasks.some(t => t.waitingReason));
  const pendingClosureCases = cases.filter(c => c.status === 'resolved_pending_citizen');
  const reopenedCases = cases.filter(c => c.status === 'reopened');

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3.5 py-1 rounded-full border border-[var(--line)]">
              সেন্ট্রাল কেস কোঅর্ডিনেশন কমান্ড
            </span>
            <span className="text-xs text-[var(--muted)]">আন্তঃবিভাগীয় কাজের প্রবাহ ও ডিপেন্ডেন্সি নিয়ন্ত্রণ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            বহু-বিভাগীয় কেস সমন্বয়ক ড্যাশবোর্ড (Case Coordinator Command)
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/coordinator/escalations"
            className="px-4 py-2.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] text-sm font-semibold border border-[var(--line)] transition shadow-sm cursor-pointer"
          >
            এসএলএ ও এস্কেলেশন
          </Link>
          <Link
            to="/coordinator/hotspots"
            className="px-5 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-sm font-bold transition shadow-lg cursor-pointer active:scale-95"
          >
            হটস্পট অ্যানালিটিক্স
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">বহু-বিভাগীয় কেস</span>
            <span className="w-9 h-9 rounded-xl bg-[var(--green-light)] border border-[var(--line)] text-[var(--green)] flex items-center justify-center font-bold">
              <GitMerge className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] font-mono">{toBanglaNumber(multiDeptCases.length)}</div>
          <span className="text-xs text-[var(--muted)] mt-1.5 block">আন্তঃবিভাগীয় ডিপেন্ডেন্সি সক্রিয়</span>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">অগ্রগতি স্থবির (Stalled)</span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-[#373224] border border-amber-200 dark:border-[#6b5c3e] text-amber-700 dark:text-[#d4c19a] flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-700 dark:text-[#d4c19a] font-mono">{toBanglaNumber(stalledCases.length)}</div>
          <span className="text-xs text-[var(--gold)] mt-1.5 block">ডিপেন্ডেন্সি বা সাইট বাধা</span>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">নাগরিক মতামতের অপেক্ষায়</span>
            <span className="w-9 h-9 rounded-xl bg-[var(--green-light)] border border-[var(--line)] text-[var(--green)] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] font-mono">{toBanglaNumber(pendingClosureCases.length)}</div>
          <span className="text-xs text-[var(--muted)] mt-1.5 block">প্রমাণ আপলোড সম্পন্ন</span>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">পুনরায় তদন্তাধীন (Reopened)</span>
            <span className="w-9 h-9 rounded-xl bg-red-50 dark:bg-[#382326] border border-red-200 dark:border-[#71434a] text-red-700 dark:text-[#e8b6b8] flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-red-700 dark:text-[#e8b6b8] font-mono">{toBanglaNumber(reopenedCases.length)}</div>
          <span className="text-xs text-[var(--muted)] mt-1.5 block">নাগরিক আপত্তি প্রেক্ষিতে</span>
        </div>
      </div>

      {/* Multi-Department Cases Table */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
              <GitMerge className="w-5 h-5 text-[var(--green)]" />
              <span>বহু-বিভাগীয় কেস ট্র্যাকিং ও ডিপেন্ডেন্সি অনুমোদন (Multi-Department Queue)</span>
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              বর্জ্য &rarr; ড্রেনেজ &rarr; সড়ক প্রকৌশল বিভাগের ধারাবাহিক কাজের সমন্বয় নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">কেস আইডি</th>
                <th className="py-3.5 px-4">সমস্যার সারসংক্ষেপ</th>
                <th className="py-3.5 px-4">ওয়ার্ড</th>
                <th className="py-3.5 px-4">বিভাগসমূহের সিকোয়েন্স</th>
                <th className="py-3.5 px-4">অগ্রাধিকার</th>
                <th className="py-3.5 px-4">বর্তমান অবস্থা</th>
                <th className="py-3.5 px-4 text-right">সিকোয়েন্স অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {cases.map(item => (
                <tr key={item.id} className="hover:bg-[var(--green-light)] transition cursor-pointer">
                  <td className="py-4 px-4 font-mono font-bold text-[var(--gold)]">#{item.id}</td>
                  <td className="py-4 px-4 font-semibold text-[var(--ink)] max-w-xs">{item.title}</td>
                  <td className="py-4 px-4 text-[var(--muted)]">{item.location.wardName}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tasks.map((t, i) => (
                        <span
                          key={t.id}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
                            t.status === 'resolved'
                              ? 'bg-[var(--green-light)] text-[var(--green)] border-[var(--line)]'
                              : t.status === 'in_progress'
                              ? 'bg-amber-50 dark:bg-[#373224] text-amber-800 dark:text-[#d4c19a] border-amber-200 dark:border-[#6b5c3e]'
                              : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]'
                          }`}
                        >
                          {toBanglaNumber(i + 1)}. {t.departmentName.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/coordinator/cases/${item.id}`}
                      className="px-4 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-md transition inline-flex items-center gap-1 active:scale-95"
                    >
                      সিকোয়েন্স পরিচালনা
                    </Link>
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
