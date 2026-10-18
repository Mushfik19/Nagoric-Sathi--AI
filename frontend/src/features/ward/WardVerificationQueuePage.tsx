import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import { Shield, Search, Filter, Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const WardVerificationQueuePage: React.FC = () => {
  const { cases } = useCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  const verificationCases = cases.filter(c => c.status === 'submitted' || c.status === 'verified');

  const filtered = verificationCases.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDept === 'all' || c.aiAnalysis.proposedDepartmentId === filterDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              ওয়ার্ড ১২ ট্রায়াজ কিউ
            </span>
            <span className="text-xs text-[var(--muted)]">তড়িৎ যাচাই ও মানব সিদ্ধান্ত</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            দায়িত্ব ও রাউটিং যাচাই তালিকা (Verification Queue)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            এআই প্রস্তাবিত বিভাগ, নিয়মাবলী ও সিগন্যাল যাচাই করে চূড়ান্ত অনুমোদন দিন
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)]">
            মোট অভিযোগ: <strong className="text-[var(--gold)]">{toBanglaNumber(verificationCases.length)}</strong>
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="civic-card rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="কেস আইডি, সমস্যা বা এলাকা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] focus:outline-hidden focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] font-medium focus:outline-hidden focus:border-[var(--accent)]"
          >
            <option value="all">সকল বিভাগ ({toBanglaNumber(verificationCases.length)})</option>
            <option value="dept_drainage">ড্রেনেজ বিভাগ</option>
            <option value="dept_waste">বর্জ্য ব্যবস্থাপনা বিভাগ</option>
            <option value="dept_road">সড়ক প্রকৌশল বিভাগ</option>
            <option value="dept_lighting">বিদ্যুৎ বিভাগ</option>
          </select>
        </div>
      </div>

      {/* Queue Cards / Table */}
      <div className="civic-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--paper-elevated)] border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                <th className="p-3.5">কেস আইডি</th>
                <th className="p-3.5">সমস্যার সারসংক্ষেপ</th>
                <th className="p-3.5">স্থান</th>
                <th className="p-3.5">এআই প্রস্তাবিত বিভাগ</th>
                <th className="p-3.5">কনফিডেন্স ও নিয়ম</th>
                <th className="p-3.5">অগ্রাধিকার</th>
                <th className="p-3.5">বর্তমান অবস্থা</th>
                <th className="p-3.5 text-right">যাচাই অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-[var(--paper-elevated)] transition">
                  <td className="p-3.5 font-mono font-bold text-[var(--gold)]">{item.id}</td>
                  <td className="p-3.5 font-semibold text-[var(--ink)] max-w-xs">{item.title}</td>
                  <td className="p-3.5 text-[var(--muted)]">{item.location.address}</td>
                  <td className="p-3.5 text-[var(--green)] font-bold">{item.aiAnalysis.proposedDepartmentName}</td>
                  <td className="p-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[var(--green)]">{toBanglaNumber(item.aiAnalysis.confidenceScore)}% কনফিডেন্স</span>
                      <span className="text-[10px] text-[var(--muted)] font-mono">{item.aiAnalysis.ruleReference}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      to={`/ward/cases/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--green)] hover:opacity-90 text-white text-xs font-bold transition shadow-xs"
                    >
                      <span>রিভিউ ও নিশ্চিতকরণ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
