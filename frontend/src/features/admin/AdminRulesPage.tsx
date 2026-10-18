import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiGateService } from '../../services/aiGateService';
import { ResponsibilityRule } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Sliders, ShieldCheck, Plus, CheckCircle2, History, FileText } from 'lucide-react';
import { formatBanglaDate } from '../../utils/formatters';

export const AdminRulesPage: React.FC = () => {
  const [rules, setRules] = useState<ResponsibilityRule[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    aiGateService.getRules().then(setRules);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M5/M10 রেসপন্সিবিলিটি রুলস
            </span>
            <span className="text-xs text-[var(--muted)]">অ্যাসেট ওনারশিপ ও প্রাতিষ্ঠানিক দায়িত্ব ইঞ্জিন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            দায়িত্ব নীতিমালা ও অ্যাসেট ওনারশিপ ইঞ্জিন (Responsibility Rules Engine)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            ওয়ার্ড ও সিটি অ্যাসেট (যেমন ড্রেন, রাস্তা, বাতি) অনুযায়ী বিভাগীয় দায়িত্ব বিধিমালার সংস্করণ ও অনুমোদন
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
                <th className="p-3.5">রুল কোড</th>
                <th className="p-3.5">নীতিমালার শিরোনাম</th>
                <th className="p-3.5">সম্পর্কিত সম্পদ (Asset Type)</th>
                <th className="p-3.5">মূল দায়িত্বপ্রাপ্ত বিভাগ</th>
                <th className="p-3.5">সহযোগী বিভাগ</th>
                <th className="p-3.5">সংস্করণ</th>
                <th className="p-3.5">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rules.map(r => (
                <tr key={r.id} className="hover:bg-[var(--paper-elevated)] transition">
                  <td className="p-3.5 font-mono font-bold text-[var(--gold)]">{r.ruleCode}</td>
                  <td className="p-3.5 font-bold text-[var(--ink)]">{r.title}</td>
                  <td className="p-3.5 text-[var(--muted)]">{r.assetType}</td>
                  <td className="p-3.5 font-semibold text-[var(--green)]">{r.primaryDepartmentName}</td>
                  <td className="p-3.5 text-[var(--muted)]">{r.secondaryDepartmentName || 'নাই'}</td>
                  <td className="p-3.5 font-mono text-[11px] text-[var(--gold)]">{r.version}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--green-light)] text-[var(--green)] border border-[var(--green)]/30">
                      সক্রিয় (Active)
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
