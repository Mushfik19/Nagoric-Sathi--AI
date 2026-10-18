import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { MUNICIPAL_DEPARTMENTS } from '../../constants';
import { PriorityLevel } from '../../types';
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';

export const WardCaseReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCase, verifyCaseResponsibility } = useCases();
  const { currentUser } = useAuth();

  const caseData = getCase(id || 'NS-2026-000184');

  const [selectedDeptId, setSelectedDeptId] = useState(
    caseData?.humanVerification?.confirmedDepartmentId ||
      caseData?.aiAnalysis.proposedDepartmentId ||
      'dept_drainage'
  );
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(
    caseData?.priority || caseData?.aiAnalysis.proposedPriority || 'high'
  );
  const [overrideReason, setOverrideReason] = useState('');
  const [priorityOverrideReason, setPriorityOverrideReason] = useState('');
  const [criticalConfirmed, setCriticalConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">কেসটি পাওয়া যায়নি</h2>
        <Link to="/ward/verification" className="text-xs text-emerald-700 font-semibold mt-2 inline-block">
          ← কিউতে ফিরুন
        </Link>
      </div>
    );
  }

  const selectedDeptObj = MUNICIPAL_DEPARTMENTS.find(d => d.id === selectedDeptId);
  const isDeptChanged = selectedDeptId !== caseData.aiAnalysis.proposedDepartmentId;
  const isPriorityChanged = selectedPriority !== caseData.aiAnalysis.proposedPriority;
  const isCritical = caseData.priority === 'emergency' || caseData.aiAnalysis.proposedPriority === 'emergency';

  const handleVerify = async () => {
    if (isDeptChanged && !overrideReason.trim()) {
      alert('এআই দায়িত্ব প্রস্তাব পরিবর্তন (ওভাররাইড) করতে বাধ্যতামূলক কারণ উল্লেখ করুন');
      return;
    }
    if (isPriorityChanged && !priorityOverrideReason.trim()) {
      alert('অগ্রাধিকার পরিবর্তন করতে বাধ্যতামূলক কারণ উল্লেখ করুন');
      return;
    }
    if (isCritical && !criticalConfirmed) {
      alert('জরুরি/ক্রিটিক্যাল কেসের ক্ষেত্রে বিশেষ দায়িত্ব সম্মতি নিশ্চিত করুন');
      return;
    }

    setIsSubmitting(true);
    const combinedReason = [
      isDeptChanged ? `বিভাগ পরিবর্তন: ${overrideReason}` : '',
      isPriorityChanged ? `অগ্রাধিকার পরিবর্তন (${selectedPriority}): ${priorityOverrideReason}` : ''
    ].filter(Boolean).join(' | ');

    await verifyCaseResponsibility(
      caseData.id,
      currentUser.name,
      selectedDeptId,
      selectedDeptObj?.name || 'নির্বাচিত বিভাগ',
      isDeptChanged || isPriorityChanged,
      combinedReason || undefined
    );
    setIsSubmitting(false);
    navigate('/ward/verification');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-3">
          <Link
            to="/ward/verification"
            className="p-2.5 rounded-lg bg-[var(--paper-elevated)] hover:bg-[var(--line)]/20 text-[var(--ink)] border border-[var(--line)] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--gold)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
                {caseData.id}
              </span>
              <PriorityBadge priority={caseData.priority} />
              <StatusBadge status={caseData.status} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--ink)] mt-1.5">
              {caseData.title}
            </h1>
          </div>
        </div>

        <span className="text-xs text-[var(--muted)] font-mono">
          দাখিল: <strong className="text-[var(--ink)]">{formatBanglaDate(caseData.submittedAt)}</strong>
        </span>
      </div>

      {/* Manual Fallback Alert if AI confidence is low */}
      {caseData.aiAnalysis.confidenceScore < 80 && (
        <div className="civic-card rounded-xl p-4 bg-[var(--status-high-bg)] border border-[var(--status-high-border)] flex items-center gap-3 text-xs text-[var(--ink)]">
          <AlertTriangle className="w-5 h-5 text-[var(--gold)] shrink-0" />
          <div>
            <strong className="font-bold text-[var(--gold)]">ম্যানুয়াল যাচাইকরণ প্রয়োজন (Manual Verification Required):</strong>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              এআই কনফিডেন্স স্কোর ({toBanglaNumber(caseData.aiAnalysis.confidenceScore)}%) গেটিং থ্রেশহোল্ডের (৮০%) নিচে। ওয়ার্ড ডেস্কের মানব কর্মকর্তার নিশ্চিতকরণ ব্যতীত কোনো ওয়ার্ক-অর্ডার জারি হবে না।
            </p>
          </div>
        </div>
      )}

      {/* 3-COLUMN TRIAGE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* COLUMN 1: Citizen Report & Media */}
        <div className="civic-card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[var(--muted)]" />
              <span>১. নাগরিকের রিপোর্ট (Citizen Intake)</span>
            </h3>
            <span className="text-[10px] text-[var(--gold)] bg-[var(--paper-elevated)] px-2 py-0.5 rounded font-mono border border-[var(--line)]">
              M1 Intake
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[var(--muted)] block mb-1">সমস্যার বর্ণনা:</span>
            <p className="text-xs text-[var(--ink)] bg-[var(--bg)] p-3 rounded-lg border border-[var(--line)] leading-relaxed">
              {caseData.description}
            </p>
          </div>

          {/* Location Details */}
          <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--line)] text-xs space-y-1">
            <span className="text-[11px] text-[var(--muted)] block">অবস্থান ও ওয়ার্ড:</span>
            <div className="flex items-start gap-1.5 text-[var(--ink)] font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[var(--green)] shrink-0 mt-0.5" />
              <span>{caseData.location.address}</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] pl-5">
              {caseData.location.wardName} (ল্যান্ডমার্ক: {caseData.location.landmark})
            </p>
          </div>

          {/* Attached Media Photo */}
          <div>
            <span className="text-[11px] text-[var(--muted)] block mb-1.5">সংযুক্ত ছবি/ভিডিও প্রমাণ:</span>
            {caseData.initialEvidence.map(att => (
              <div key={att.id} className="rounded-lg overflow-hidden border border-[var(--line)] aspect-video bg-[var(--bg)] relative">
                <img src={att.url} alt={att.caption} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs p-2 text-[10px] text-white">
                  {att.caption}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: AI Analysis & Signal Breakdown */}
        <div className="civic-card rounded-xl p-5 space-y-4 border-[var(--line)] bg-[var(--paper-elevated)]">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--green)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--green)]" />
              <span>২. এআই বিশ্লেষণ ও প্রস্তাব (AI Proposal)</span>
            </h3>
            <span className="text-xs font-bold font-mono text-[var(--green)] bg-[var(--green-light)] px-2 py-0.5 rounded border border-[var(--green)]/30">
              {toBanglaNumber(caseData.aiAnalysis.confidenceScore)}% Confidence
            </span>
          </div>

          {/* Extracted Category & Summary */}
          <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--line)] text-xs">
            <span className="text-[11px] text-[var(--muted)] block mb-0.5">এআই সমস্যা শ্রেণিবিভাগ:</span>
            <strong className="text-[var(--ink)] font-bold block">{caseData.aiAnalysis.categoryLabel}</strong>
            <p className="text-[11px] text-[var(--muted)] mt-1">{caseData.aiAnalysis.problemSummary}</p>
          </div>

          {/* Proposed Priority & Department */}
          <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--line)] text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[var(--muted)]">প্রস্তাবিত অগ্রাধিকার:</span>
              <PriorityBadge priority={caseData.aiAnalysis.proposedPriority} />
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--line)]">
              <span className="text-[11px] text-[var(--muted)]">প্রস্তাবিত বিভাগ:</span>
              <strong className="text-[var(--green)]">{caseData.aiAnalysis.proposedDepartmentName}</strong>
            </div>
          </div>

          {/* Rule Match & Asset Link */}
          <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--line)] text-xs space-y-1">
            <span className="text-[11px] text-[var(--muted)] block">প্রযোজ্য রেসপন্সিবিলিটি রুল:</span>
            <p className="font-semibold text-[var(--gold)]">{caseData.aiAnalysis.ruleReference}</p>
            <div className="text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
              সম্পর্কিত অ্যাসেট: <strong className="text-[var(--ink)]">{caseData.aiAnalysis.assetName}</strong>
            </div>
          </div>

          {/* Signals List */}
          <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--line)] text-xs">
            <span className="text-[11px] font-semibold text-[var(--ink)] block mb-1.5">শনাক্তকরণ সিগন্যালসমূহ:</span>
            <ul className="space-y-1 text-[11px] text-[var(--muted)] pl-3 list-disc">
              {caseData.aiAnalysis.signals.map((sig, i) => (
                <li key={i}>{sig}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* COLUMN 3: Responsibility Confirmation & Action */}
        <div className="civic-card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
              <span>৩. দায়িত্ব ও অগ্রাধিকার পর্যালোচনা</span>
            </h3>
            <span className="text-[10px] font-bold text-[var(--muted)] bg-[var(--paper-elevated)] px-2 py-0.5 rounded border border-[var(--line)]">
              M5 Triage
            </span>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
              দায়িত্বপ্রাপ্ত প্রধান বিভাগ:
            </label>
            <select
              value={selectedDeptId}
              onChange={e => setSelectedDeptId(e.target.value)}
              className="w-full p-2.5 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] font-semibold focus:outline-hidden focus:border-[var(--accent)]"
            >
              {MUNICIPAL_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.id === caseData.aiAnalysis.proposedDepartmentId ? ' (এআই প্রস্তাবিত)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Review (R&D Section 4.C) */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
              অগ্রাধিকার নির্ধারণ (Priority Review):
            </label>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value as PriorityLevel)}
              className="w-full p-2.5 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] font-semibold focus:outline-hidden focus:border-[var(--accent)]"
            >
              <option value="emergency">জরুরি (Emergency - জীবন ও নিরাপত্তার ঝুঁকি)</option>
              <option value="high">উচ্চ (High - প্রধান ড্রেন/রাস্তা ক্ষতিগ্রস্ত)</option>
              <option value="medium">মাঝারি (Medium - বর্জ্য অপসারণ/প্যানেল মেরামত)</option>
              <option value="low">সাধারণ (Low - সাধারণ রক্ষণাবেক্ষণ)</option>
            </select>
          </div>

          {/* If Dept Changed: Mandatory Override Reason */}
          {isDeptChanged && (
            <div className="p-3 bg-[var(--status-high-bg)] rounded-lg border border-[var(--status-high-border)] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--gold)] font-bold">
                <ShieldAlert className="w-4 h-4 text-[var(--gold)]" />
                <span>এআই বিভাগ পরিবর্তনের কারণ (বাধ্যতামূলক):</span>
              </div>
              <textarea
                rows={2}
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="কেন এআই প্রস্তাবিত বিভাগ পরিবর্তন করা হচ্ছে..."
                className="w-full p-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* If Priority Changed: Mandatory Reason */}
          {isPriorityChanged && (
            <div className="p-3 bg-[var(--status-high-bg)] rounded-lg border border-[var(--status-high-border)] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--gold)] font-bold">
                <ShieldAlert className="w-4 h-4 text-[var(--gold)]" />
                <span>অগ্রাধিকার পরিবর্তনের কারণ (বাধ্যতামূলক):</span>
              </div>
              <textarea
                rows={2}
                value={priorityOverrideReason}
                onChange={e => setPriorityOverrideReason(e.target.value)}
                placeholder="অগ্রাধিকার বৃদ্ধির যৌক্তিক কারণ লিখুন..."
                className="w-full p-2 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] focus:outline-hidden focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* If Critical Flag: 2nd Confirmation Checkbox */}
          {isCritical && (
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--status-emergency-bg)] border border-[var(--status-emergency-border)] text-xs text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                checked={criticalConfirmed}
                onChange={e => setCriticalConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <strong className="font-bold block text-rose-400">জরুরি কেস দ্বিতীয় নিশ্চয়তা (Critical Confirmation)</strong>
                <p className="text-[11px] text-[var(--muted)]">
                  আমি নিশ্চিত করছি যে এটি একটি জরুরি নাগরিক ঝুঁকি এবং তাৎক্ষণিক ফিল্ড রেসপন্স প্রয়োজন।
                </p>
              </div>
            </label>
          )}

          {/* Verification CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--green)] hover:opacity-90 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isDeptChanged || isPriorityChanged ? 'ওভাররাইডসহ যাচাই চূড়ান্ত করুন' : 'সুপারিশ অনুমোদন ও ওয়ার্ক-অর্ডার জারি করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
