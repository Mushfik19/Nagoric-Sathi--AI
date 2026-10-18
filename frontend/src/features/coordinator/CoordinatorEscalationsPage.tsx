import React from 'react';
import { useCases } from '../../context/CaseContext';
import { calculateSlaCountdown, formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CoordinatorEscalationsPage: React.FC = () => {
  const { cases } = useCases();

  const allTasks = cases.flatMap(c =>
    c.tasks.map(t => ({
      ...t,
      caseTitle: c.title,
      casePriority: c.priority,
      caseWard: c.location.wardName
    }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30">
              SLA & Escalation Center
            </span>
            <span className="text-xs text-[var(--muted)]">এসএলএ ব্রিচ মনিটর ও অগ্রাধিকার এস্কেলেশন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            এসএলএ মনিটর ও টার্গেট মিস এস্কেলেশন (SLA Escalations)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            জরুরি ও উচ্চ অগ্রাধিকার কেসসমূহের সময়সীমা নজরদারি এবং ঊর্ধ্বতন কর্মকর্তার পর্যালোচনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coordinator"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition"
          >
            ← সমন্বয়ক ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </div>

      <div className="civic-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--paper-elevated)] border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                <th className="p-3.5">কেস আইডি</th>
                <th className="p-3.5">টাস্ক ও বিভাগ</th>
                <th className="p-3.5">অগ্রাধিকার</th>
                <th className="p-3.5">এসএলএ সময়সীমা</th>
                <th className="p-3.5">অবশিষ্ট সময় / অবস্থা</th>
                <th className="p-3.5">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {allTasks.map(task => {
                const sla = calculateSlaCountdown(task.slaDeadline);
                return (
                  <tr key={task.id} className="hover:bg-[var(--paper-elevated)] transition">
                    <td className="p-3.5 font-mono font-bold text-[var(--gold)]">{task.caseId}</td>
                    <td className="p-3.5">
                      <strong className="text-[var(--ink)] block text-xs">{task.title}</strong>
                      <span className="text-[11px] text-[var(--muted)]">{task.departmentName}</span>
                    </td>
                    <td className="p-3.5">
                      <PriorityBadge priority={task.casePriority} />
                    </td>
                    <td className="p-3.5 text-[var(--muted)]">{formatBanglaDate(task.slaDeadline)}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded border ${
                          sla.isBreached
                            ? 'bg-[var(--status-emergency-bg)] text-rose-400 border-[var(--status-emergency-border)]'
                            : 'bg-[var(--status-high-bg)] text-[var(--gold)] border-[var(--status-high-border)]'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {sla.text}
                      </span>
                    </td>
                    <td className="p-3.5 text-[var(--ink)] font-medium">
                      {task.assignedOfficerName || 'বরাদ্দ প্রক্রিয়াধীন'}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/coordinator/cases/${task.caseId}`}
                        className="px-3 py-1.5 rounded-lg bg-[var(--green)] hover:opacity-90 text-white text-[11px] font-bold shadow-xs transition"
                      >
                        পর্যালোচনা
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
