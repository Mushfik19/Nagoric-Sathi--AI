import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceKnowledgeService } from '../../services/serviceKnowledgeService';
import { VerifiedServiceKnowledge } from '../../types';
import { BookOpen, Plus, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

export const AdminServiceKnowledgePage: React.FC = () => {
  const [services, setServices] = useState<VerifiedServiceKnowledge[]>([]);

  useEffect(() => {
    serviceKnowledgeService.getAllServices().then(setServices);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M2 নলেজবেস প্রশাসন
            </span>
            <span className="text-xs text-[var(--muted)]">নাগরিক সেবা বিধিমালার প্রামাণ্য ডেটাবেস</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            নাগরিক সেবা ও নলেজবেস ব্যবস্থাপনা (Service Knowledge Management)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            ১২টি যাচাইকৃত সিটি কর্পোরেশন সেবার প্রয়োজনীয় কাগজপত্র, ফি ও ধাপ হালনাগাদ করুন
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
                <th className="p-3.5">কোড</th>
                <th className="p-3.5">সেবার শিরোনাম</th>
                <th className="p-3.5">বিভাগ / শাখা</th>
                <th className="p-3.5">কাগজপত্র সংখ্যা</th>
                <th className="p-3.5">সরকারি ফি</th>
                <th className="p-3.5">সর্বশেষ যাচাই</th>
                <th className="p-3.5">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-[var(--paper-elevated)] transition">
                  <td className="p-3.5 font-mono font-bold text-[var(--gold)]">{s.code}</td>
                  <td className="p-3.5 font-bold text-[var(--ink)]">{s.title}</td>
                  <td className="p-3.5 text-[var(--muted)]">{s.department}</td>
                  <td className="p-3.5 text-[var(--ink)] font-semibold">{toBanglaNumber(s.requiredDocuments.length)}টি</td>
                  <td className="p-3.5 text-[var(--green)] font-semibold">{s.officialFee}</td>
                  <td className="p-3.5 text-[var(--muted)] font-mono text-[11px]">{s.lastVerifiedDate}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--green)] bg-[var(--green-light)] px-2 py-0.5 rounded border border-[var(--green)]/30">
                      <ShieldCheck className="w-3 h-3 text-[var(--green)]" />
                      প্রকাশিত (Live)
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
