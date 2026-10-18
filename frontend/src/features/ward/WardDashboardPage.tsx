import React from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import {
  Layers,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Copy,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  MapPin
} from 'lucide-react';

export const WardDashboardPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  // Filter cases relevant to Ward
  const wardCases = cases.filter(c => !currentUser.wardId || c.location.wardId === currentUser.wardId);
  const pendingVerification = wardCases.filter(c => c.status === 'submitted');
  const emergencyCases = wardCases.filter(c => c.priority === 'emergency');
  const inProgressCases = wardCases.filter(c => c.status === 'in_progress' || c.status === 'under_inspection');
  const resolvedCases = wardCases.filter(c => c.status === 'resolved_pending_citizen' || c.status === 'closed');

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Ward Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--bg)] px-3.5 py-1 rounded-full border border-[var(--line)]">
              {currentUser.wardName || 'ওয়ার্ড ১২ সেবা কেন্দ্র'}
            </span>
            <span className="text-xs font-mono text-[var(--muted)] bg-[var(--paper)] px-2.5 py-1 rounded-md border border-[var(--line)]">
              Operational Control Room
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            ওয়ার্ড ট্রায়াজ ও <strong className="font-extrabold text-[var(--gold)]">দায়িত্ব যাচাই ড্যাশবোর্ড</strong>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            নাগরিক দাখিলকৃত অভিযোগ যাচাই, বিভাগীয় দায় নির্ধারণ ও দ্বৈত রিপোর্ট একত্রীকরণ
          </p>
        </div>

        <Link
          to="/ward/verification"
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-sm font-bold shadow-md transition cursor-pointer active:scale-95"
        >
          <ShieldAlert className="w-4.5 h-4.5 text-white" />
          <span>যাচাই কিউ খুলুন ({toBanglaNumber(pendingVerification.length)})</span>
        </Link>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">যাচাইয়ের অপেক্ষায়</span>
            <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-[var(--gold)] flex items-center justify-center font-bold border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--ink)]">{toBanglaNumber(pendingVerification.length)}</div>
          <span className="text-xs text-[var(--gold)] font-medium mt-1.5 block">এআই প্রস্তাব যাচাই আবশ্যক</span>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">জরুরি অভিযোগ (Emergency)</span>
            <span className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-600 dark:text-rose-400">{toBanglaNumber(emergencyCases.length)}</div>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5 block">তাৎক্ষণিক ব্যবস্থা কাম্য</span>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">মাঠ কাজ চলমান</span>
            <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">{toBanglaNumber(inProgressCases.length)}</div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1.5 block">বিভাগীয় সংস্কার চলছে</span>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--muted)]">সমাধান ও সমাপ্ত</span>
            <span className="w-9 h-9 rounded-xl bg-[var(--green-light)] text-[var(--green)] flex items-center justify-center font-bold border border-[var(--line)]">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--green)]">{toBanglaNumber(resolvedCases.length)}</div>
          <span className="text-xs text-[var(--green)] font-medium mt-1.5 block">প্রমাণসহ নিষ্পত্তি</span>
        </div>
      </div>

      {/* Verification Queue Preview Table */}
      <div className="rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[var(--gold)]" />
              <span>নতুন দাখিলকৃত অভিযোগ ও এআই দায়িত্ব প্রস্তাব (Verification Queue)</span>
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              ওয়ার্ড ডেস্ক কর্মকর্তা যাচাই করে দায়িত্বপ্রাপ্ত বিভাগ চূড়ান্ত করবেন (AI proposes, people decide)
            </p>
          </div>
          <Link
            to="/ward/verification"
            className="text-sm font-semibold text-[var(--gold)] hover:underline flex items-center gap-1.5 transition shrink-0"
          >
            <span>সম্পূর্ণ কিউ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">কেস আইডি</th>
                <th className="py-3.5 px-4">সমস্যার সারসংক্ষেপ</th>
                <th className="py-3.5 px-4">স্থান ও ওয়ার্ড</th>
                <th className="py-3.5 px-4">এআই প্রস্তাবিত বিভাগ</th>
                <th className="py-3.5 px-4">কনফিডেন্স</th>
                <th className="py-3.5 px-4">অগ্রাধিকার</th>
                <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {wardCases.slice(0, 5).map(item => (
                <tr key={item.id} className="hover:bg-[var(--green-light)] transition group cursor-pointer">
                  <td className="py-4 px-4 font-mono font-bold text-[var(--gold)]">#{item.id}</td>
                  <td className="py-4 px-4 font-semibold text-[var(--ink)] max-w-xs">{item.title}</td>
                  <td className="py-4 px-4 text-[var(--muted)]">{item.location.address}</td>
                  <td className="py-4 px-4 text-[var(--ink)] font-medium">{item.aiAnalysis.proposedDepartmentName}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full font-bold text-xs bg-[var(--green-light)] text-[var(--green)] border border-[var(--line)] font-mono">
                      {item.aiAnalysis.confidenceScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/ward/cases/${item.id}`}
                      className="px-4 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1 active:scale-95"
                    >
                      যাচাই করুন
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
