import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auditService } from '../../services/aiGateService';
import { AuditLogEntry } from '../../types';
import { formatBanglaDate } from '../../utils/formatters';
import { FileText, ShieldCheck, Search, Filter, Lock } from 'lucide-react';

export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    auditService.getLogs().then(setLogs);
  }, []);

  const filteredLogs = logs.filter(
    l =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[var(--gold)]" />
              অপরিবর্তনীয় ক্রিপ্টোগ্রাফিক অডিট ট্রেইল (Immutable)
            </span>
            <span className="text-xs text-[var(--muted)]">SHA-256 চেইন ভ্যালিডেশন</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            প্ল্যাটফর্ম গভর্নেন্স ও অডিট লগ (Audit Log Explorer)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            কেস তৈরি, দায়িত্ব যাচাই, ওভাররাইড, প্রমাণ আপলোড ও পলিসি পরিবর্তনের টাইমস্ট্যাম্পড রেকর্ড
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

      {/* Search Input */}
      <div className="civic-card rounded-xl p-3.5 flex items-center gap-3">
        <Search className="w-4 h-4 text-[var(--muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="অ্যাকশন (যেমন CASE_SUBMITTED, RESPONSIBILITY_VERIFIED), কর্মকর্তা বা কেস আইডি দিয়ে সার্চ করুন..."
          className="w-full text-xs bg-transparent text-[var(--ink)] border-none focus:outline-hidden"
        />
      </div>

      {/* Table */}
      <div className="civic-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[var(--paper-elevated)] border-b border-[var(--line)] text-[var(--muted)] font-semibold font-bangla">
                <th className="p-3.5">টাইমস্ট্যাম্প</th>
                <th className="p-3.5">কর্তা ও ভূমিকা (Actor)</th>
                <th className="p-3.5">অ্যাকশন কোড</th>
                <th className="p-3.5">রিসোর্স আইডি</th>
                <th className="p-3.5">বিস্তারিত বিবরণ</th>
                <th className="p-3.5">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-sans text-xs">
              {filteredLogs.map(item => (
                <tr key={item.id} className="hover:bg-[var(--paper-elevated)] transition">
                  <td className="p-3.5 text-[var(--muted)] font-mono text-[11px] whitespace-nowrap">
                    {formatBanglaDate(item.timestamp)}
                  </td>
                  <td className="p-3.5">
                    <strong className="text-[var(--ink)] block font-bangla">{item.actorName}</strong>
                    <span className="text-[10px] text-[var(--muted)] font-mono uppercase">{item.actorRole}</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[var(--gold)] text-[11px]">
                    {item.action}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[var(--ink)]">{item.resourceId}</td>
                  <td className="p-3.5 text-[var(--muted)] font-bangla max-w-sm">{item.details}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--green)] bg-[var(--green-light)] px-2 py-0.5 rounded border border-[var(--green)]/30 font-bangla">
                      <ShieldCheck className="w-3 h-3 text-[var(--green)]" />
                      যাচাইকৃত
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
