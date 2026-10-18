import React from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import {
  PlusCircle,
  FileText,
  MapPin,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Layers,
  ChevronRight
} from 'lucide-react';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';

export const CitizenHomePage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

  const citizenCases = cases.filter(
    c => c.citizenId === currentUser.id || c.id === 'NS-2026-000184' || c.id === 'NS-2026-000170' || c.id === 'NS-2026-W03-1001'
  );

  const activeCasesCount = citizenCases.filter(c => c.status !== 'closed').length;
  const resolvedCasesCount = citizenCases.filter(c => c.status === 'resolved_pending_citizen' || c.status === 'closed').length;

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-200">
      {/* Calm Editorial Hero Section */}
      <section className="rounded-3xl p-6 sm:p-10 border border-[var(--line)] bg-white relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] text-xs font-mono tracking-wider font-bold">
            <Sparkles className="w-4 h-4 text-[#166534]" />
            <span>নাগরিক পোর্টাল · CITIZEN WORKSPACE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--ink)] leading-tight tracking-tight">
            আপনার এলাকার যে কোনো সমস্যা <strong className="font-extrabold text-[#166534]">সরাসরি জানান</strong>
          </h1>

          <p className="text-sm sm:text-base text-[var(--muted)] font-normal leading-relaxed">
            ছবি, অডিও রেকর্ড বা সাধারণ বাংলায় বিবরণ দিন। এআই বিশ্লেষণ শেষে সঠিক বিভাগ ও কর্মকর্তাদের কাছে পৌঁছে যাবে এবং প্রতিটি ধাপ আপনি যাচাই করতে পারবেন।
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/report"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-bold transition shadow-md cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>নতুন সমস্যা জানান</span>
            </Link>

            <Link
              to="/services"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[var(--bg)] hover:bg-[#eaf5ed] text-[var(--ink)] text-sm font-semibold border border-[var(--line)] transition cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4.5 h-4.5 text-[#166534]" />
              <span>সেবা নির্দেশিকা</span>
            </Link>

            <Link
              to="/map"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[var(--bg)] hover:bg-[#eaf5ed] text-[var(--ink)] text-sm font-medium border border-[var(--line)] transition cursor-pointer shadow-xs"
            >
              <MapPin className="w-4.5 h-4.5 text-[#166534]" />
              <span>লাইভ ম্যাপ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <span className="text-sm text-[var(--muted)] font-medium block mb-1">মোট দাখিলকৃত</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--ink)]">{toBanglaNumber(citizenCases.length)}</div>
        </div>
        <div className="rounded-2xl p-5 bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <span className="text-sm text-[var(--muted)] font-medium block mb-1">চলমান অগ্রগতি</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#8c6820]">{toBanglaNumber(activeCasesCount)}</div>
        </div>
        <div className="rounded-2xl p-5 bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <span className="text-sm text-[var(--muted)] font-medium block mb-1">সমাধান সম্পন্ন</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#166534]">{toBanglaNumber(resolvedCasesCount)}</div>
        </div>
        <div className="rounded-2xl p-5 bg-[var(--paper)] border border-[var(--line)] shadow-xs">
          <span className="text-sm text-[var(--muted)] font-medium block mb-1">যাচাইয়ের অধিকার</span>
          <div className="text-base font-bold text-[#166534] flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-5 h-5 text-[#166534]" />
            <span>আপত্তি সক্ষম</span>
          </div>
        </div>
      </div>

      {/* Governance Principle Banner */}
      <section className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-[var(--muted)] shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--ink)] font-semibold text-sm">“AI proposes, people decide” নীতিতে পরিচালিত</strong>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              এআই কেবল সুপারিশ ও তথ্য সাজিয়ে দেয়, সমাধান ও দায়িত্ব প্রদানের প্রতিটি সিদ্ধান্ত দায়িত্বপ্রাপ্ত কর্মকর্তা যাচাই করেন।
            </p>
          </div>
        </div>
        <Link
          to="/transparency"
          className="text-[#166534] hover:underline font-semibold flex items-center gap-1 shrink-0 text-sm whitespace-nowrap"
        >
          <span>পাবলিক স্বচ্ছতা রিপোর্ট</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Active Cases Summary Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)]">
              আমার অভিযোগ ও <strong className="font-bold text-[#166534]">অগ্রগতি</strong>
            </h2>
            <p className="text-sm text-[var(--muted)] mt-0.5">আপনার দাখিলকৃত সাম্প্রতিক সমস্যাসমূহের রিয়েল-টাইম অবস্থা</p>
          </div>
          <Link
            to="/cases"
            className="text-sm font-semibold text-[#166534] hover:underline flex items-center gap-1"
          >
            <span>সবগুলো দেখুন ({toBanglaNumber(citizenCases.length)})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {citizenCases.length === 0 ? (
          <div className="rounded-2xl p-10 text-center text-[var(--muted)] bg-[var(--paper)] border border-[var(--line)] space-y-3">
            <FileText className="w-10 h-10 mx-auto text-[var(--muted)] opacity-50" />
            <p className="text-sm font-semibold text-[var(--ink)]">আপনি এখনও কোনো সমস্যা দাখিল করেননি</p>
            <Link
              to="/report"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-[#166534] text-white rounded-xl text-sm font-bold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>প্রথম সমস্যা রিপোর্ট করুন</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {citizenCases.slice(0, 4).map(c => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="rounded-2xl p-6 bg-[var(--paper)] border border-[var(--line)] hover:border-[#166534] hover:shadow-md transition flex flex-col justify-between gap-4 block group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--bg)] px-2.5 py-1 rounded-md border border-[var(--line)]">
                      #{c.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[#166534] transition">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1.5 text-[var(--ink)]">
                      <MapPin className="w-4 h-4 text-[#166534]" />
                      <span>{c.location.wardName || c.location.address}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono">দাখিল: {formatBanglaDate(c.submittedAt)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-bold text-[#166534]">
                  <span>টাইমলাইন ও প্রমাণ দেখুন</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
