import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { CaseLifecycleTimeline } from '../../components/cases/CaseLifecycleTimeline';
import { BeforeAfterViewer } from '../../components/cases/BeforeAfterViewer';
import { DependencySequenceDiagram } from '../../components/cases/DependencySequenceDiagram';
import { AiProposalCard } from '../../components/ai/AiProposalCard';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const CitizenCaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCase, submitProof, submitObjection, acceptResolution } = useCases();
  const { currentUser, activeRole } = useAuth();

  const caseData = getCase(id || 'NS-2026-000184');

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-[#151a16] rounded-xl border border-[#343d34] my-8">
        <h2 className="text-base font-semibold text-[#eeeee6]">কেসটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-xs text-[#a7b0a8] mt-1">সঠিক কেস আইডি দিয়ে পুনরায় চেষ্টা করুন</p>
        <button
          onClick={() => navigate('/cases')}
          className="mt-4 px-4 py-2 bg-[#295e42] text-[#d4c19a] rounded-xl text-xs font-semibold hover:bg-[#347955] transition cursor-pointer"
        >
          আমার সকল কেস দেখুন
        </button>
      </div>
    );
  }

  const handleAccept = async (rating: number, feedback?: string) => {
    await acceptResolution(caseData.id, rating, feedback);
  };

  const handleObject = async (reasons: string[], notes?: string) => {
    await submitObjection(caseData.id, reasons, notes);
  };

  const latestTask = caseData.tasks[caseData.tasks.length - 1];
  const resolutionEvidence = caseData.tasks.find(t => t.resolutionEvidence && t.resolutionEvidence.length > 0)?.resolutionEvidence;

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Back Button & Top Meta */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
        <Link
          to="/cases"
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--ink)] hover:text-[#166534] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#166534]" />
          <span>সকল অভিযোগ তালিকায় ফিরুন</span>
        </Link>
        <span className="text-xs text-[var(--muted)]">
          জমার তারিখ: <strong className="text-[var(--ink)]">{formatBanglaDate(caseData.submittedAt)}</strong>
        </span>
      </div>

      {/* Dual Column Layout for Wide Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) — Case details, Evidence, Sequencer & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Case Main Header Card */}
          <div className="rounded-2xl p-6 sm:p-8 border border-[var(--line)] bg-[var(--paper)] shadow-xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-[var(--ink)] bg-[var(--bg)] px-3 py-1 rounded-lg border border-[var(--line)]">
                    #{caseData.id}
                  </span>
                  <PriorityBadge priority={caseData.priority} />
                  <StatusBadge status={caseData.status} />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] leading-snug">
                  {caseData.title}
                </h1>
              </div>

              {/* SLA / Estimated Resolution Badge */}
              <div className="bg-[var(--bg)] border border-[var(--line)] px-4 py-2.5 rounded-xl text-right">
                <span className="text-xs text-[var(--muted)] block">আনুমানিক সমাধান কাল:</span>
                <strong className="text-sm text-[var(--gold)] font-bold">
                  {toBanglaNumber(caseData.estimatedResolutionDays)} কর্মদিবস
                </strong>
              </div>
            </div>

            <p className="text-sm text-[var(--ink)] leading-relaxed bg-[var(--bg)] p-4 rounded-xl border border-[var(--line)]">
              {caseData.description}
            </p>

            {/* Location & Department Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="flex items-start gap-2.5 text-[var(--muted)]">
                <MapPin className="w-4.5 h-4.5 text-[var(--green)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)] text-sm block">{caseData.location.address}</strong>
                  <span className="text-xs text-[var(--muted)]">{caseData.location.wardName} ({caseData.location.landmark})</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[var(--muted)]">
                <ShieldCheck className="w-4.5 h-4.5 text-[var(--green)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)] text-sm block">
                    {caseData.humanVerification?.confirmedDepartmentName || caseData.aiAnalysis.proposedDepartmentName}
                  </strong>
                  <span className="text-xs text-[var(--muted)]">
                    {caseData.humanVerification ? 'ওয়ার্ড ডেস্ক কর্তৃক যাচাইকৃত' : 'এআই প্রস্তাবনা সাপেক্ষে প্রক্রিয়াধীন'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Before / After Evidence Verification Viewer */}
          <BeforeAfterViewer
            initialEvidence={caseData.initialEvidence}
            resolutionEvidence={resolutionEvidence}
            onAccept={handleAccept}
            onObject={handleObject}
            canVerify={true}
            status={caseData.status}
          />

          {/* Multi-Department Task Sequencer View */}
          {caseData.tasks && caseData.tasks.length > 0 && (
            <DependencySequenceDiagram tasks={caseData.tasks} />
          )}

          {/* Waiting Reason & Blocker Alert (R&D Section 3.I) */}
          {caseData.tasks.some(t => t.status === 'pending_dependency' || t.waitingReason) && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs text-amber-700 dark:text-amber-400 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold">কাজের অগ্রগতি সম্পর্কিত তথ্য (অপেক্ষার কারণ):</span>
              </div>
              <p className="text-xs font-semibold text-[var(--ink)]">
                “কাজটি অন্য একটি বিভাগের কাজ শেষ হওয়ার অপেক্ষায় আছে।”
              </p>
              <div className="pt-2 border-t border-amber-500/20 space-y-1 text-xs text-[var(--muted)]">
                {caseData.tasks
                  .filter(t => t.status === 'pending_dependency' || t.waitingReason)
                  .map(t => (
                    <div key={t.id} className="flex items-start gap-1.5">
                      <span className="font-bold text-[var(--ink)]">• {t.departmentName}:</span>
                      <span>{t.waitingReason || `পূর্ববর্তী ধাপ (${t.prerequisiteDeptName || 'পূর্ববর্তী বিভাগ'}) এর কাজ শেষ হলে স্বয়ংক্রিয়ভাবে শুরু হবে।`}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 8-Stage Lifecycle Timeline */}
          <CaseLifecycleTimeline timeline={caseData.timeline} currentStatus={caseData.status} />
        </div>

        {/* Right Column (4 cols) — Responsible Officials, AI Proposal & Hotline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Responsible Official Contact Info (R&D Section 3.J) */}
          <div className="rounded-2xl p-6 bg-[var(--paper)] border border-[var(--line)] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--green)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
              <span>দায়িত্বপ্রাপ্ত কর্মকর্তা ও অফিশিয়াল যোগাযোগ</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-1">
                <span className="text-xs text-[var(--muted)] block">দায়িত্বপ্রাপ্ত প্রধান বিভাগ ও কর্মকর্তা:</span>
                <strong className="text-[var(--ink)] block font-bold text-sm">
                  {caseData.humanVerification?.confirmedDepartmentName || caseData.aiAnalysis.proposedDepartmentName}
                </strong>
                <p className="text-[var(--green)] font-semibold">প্রকৌশলী তানভীর আহমেদ (সহকারী প্রকৌশলী, ফিল্ড)</p>
                <p className="text-[var(--muted)] text-xs">অফিস: অঞ্চল-৩, সিটি কর্পোরেশন</p>
              </div>

              <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--line)] space-y-2">
                <span className="text-xs text-[var(--muted)] block">দাপ্তরিক যোগাযোগ (শুধুমাত্র অফিশিয়াল):</span>
                <div className="flex items-center gap-2 text-[var(--ink)]">
                  <Phone className="w-3.5 h-3.5 text-[var(--green)]" />
                  <span>দাপ্তরিক ফোন: <strong className="font-mono text-[var(--ink)]">০২-৮৮০১২৩৪</strong> (এক্সটেন্সন: ৪২০)</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--ink)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--green)]" />
                  <span>দাপ্তরিক ইমেইল: <strong className="font-mono text-[var(--ink)]">engineering.div3@city.gov.bd</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Proposal Details */}
          <AiProposalCard proposal={caseData.aiAnalysis} />

          {/* Contact & Privacy Notice */}
          <div className="p-5 rounded-2xl bg-[var(--green-light)] border border-[var(--line)] text-[var(--ink)] space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[var(--green)]">
              <Phone className="w-4 h-4 text-[var(--green)]" />
              <span>জরুরি সহায়তা কন্ট্রোল রুম:</span>
            </div>
            <p className="font-bold text-base text-[var(--ink)]">১৬১০৬ (টোল-ফ্রি)</p>
            <p className="text-[var(--muted)] text-xs">
              নাগরিক গোপনীয়তা এনক্রিপশন সক্রিয় (Privacy Token Active)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
