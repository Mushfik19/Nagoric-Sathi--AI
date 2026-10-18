import React, { useEffect, useState } from 'react';
import { getStoredDuplicates, saveStoredDuplicates, appendAuditLog } from '../../services/storage';
import { useCases } from '../../context/CaseContext';
import { DuplicateCandidate } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Copy, ShieldCheck, CheckCircle2, XCircle, ArrowRight, EyeOff, Sparkles, MapPin } from 'lucide-react';
import { toBanglaNumber, formatBanglaDate } from '../../utils/formatters';

export const WardDuplicateManagerPage: React.FC = () => {
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const { cases, refreshCases } = useCases();
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    setDuplicates(getStoredDuplicates());
  }, []);

  const handleMerge = (dup: DuplicateCandidate) => {
    const updated = duplicates.map(d =>
      d.primaryCaseId === dup.primaryCaseId && d.duplicateCaseId === dup.duplicateCaseId
        ? { ...d, status: 'merged' as const }
        : d
    );
    setDuplicates(updated);
    saveStoredDuplicates(updated);

    appendAuditLog({
      actorId: 'ward_officer',
      actorName: 'কামরুল হাসান (ওয়ার্ড ১২ ডেস্ক)',
      actorRole: 'ward_desk',
      action: 'DUPLICATE_INCIDENTS_MERGED',
      resourceType: 'duplicate',
      resourceId: dup.duplicateCaseId,
      details: `${dup.duplicateCaseId} কেসটি মূল কেস ${dup.primaryCaseId} এর সাথে মার্জ করা হয়েছে (${dup.similarityScore}% মিল)`,
      ipAddress: '192.168.12.44'
    });

    showSuccess('ডুপ্লিকেট অভিযোগ সংযুক্ত (মার্জ) হয়েছে', `মূল কেস: ${dup.primaryCaseId}`);
  };

  const handleReject = (dup: DuplicateCandidate) => {
    const updated = duplicates.map(d =>
      d.primaryCaseId === dup.primaryCaseId && d.duplicateCaseId === dup.duplicateCaseId
        ? { ...d, status: 'rejected_distinct' as const }
        : d
    );
    setDuplicates(updated);
    saveStoredDuplicates(updated);
    showInfo('অভিযোগ দুটিকে আলাদা হিসেবে চিহ্নিত করা হয়েছে');
  };

  const handleUnmerge = (dup: DuplicateCandidate) => {
    const updated = duplicates.map(d =>
      d.primaryCaseId === dup.primaryCaseId && d.duplicateCaseId === dup.duplicateCaseId
        ? { ...d, status: 'pending_review' as const }
        : d
    );
    setDuplicates(updated);
    saveStoredDuplicates(updated);

    appendAuditLog({
      actorId: 'ward_officer',
      actorName: 'কামরুল হাসান (ওয়ার্ড ১২ ডেস্ক)',
      actorRole: 'ward_desk',
      action: 'DUPLICATE_INCIDENTS_UNMERGED',
      resourceType: 'duplicate',
      resourceId: dup.duplicateCaseId,
      details: `${dup.duplicateCaseId} কেসটির মার্জ প্রত্যাহার করে পৃথক কেস হিসেবে পুনরুজ্জীবিত করা হয়েছে`,
      ipAddress: '192.168.12.44'
    });

    showInfo('মার্জ প্রত্যাহার করা হয়েছে', 'কেস দুটি পৃথক হিসেবে পুনর্নির্ধারণ করা হলো');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M6 ডুপ্লিকেট অ্যানালাইসিস
            </span>
            <span className="text-xs text-[var(--muted)]">স্বয়ংক্রিয় ক্লাস্টারিং ও নাগরিক সুরক্ষা</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            সম্ভাব্য ডুপ্লিকেট অভিযোগ ব্যবস্থাপনা (Duplicate Incident Manager)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            একই স্থানে একই সমস্যার একাধিক রিপোর্ট এআই অ্যালগরিদম দ্বারা শনাক্তকৃত। ব্যক্তিগত পরিচয় উন্মোচন ছাড়াই পর্যালোচনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)]">
            সনাক্তকৃত ক্লাস্টার: <strong className="text-[var(--gold)]">{toBanglaNumber(duplicates.length)}</strong>
          </span>
        </div>
      </div>

      <div className="civic-card rounded-xl p-4 bg-[var(--paper-elevated)] border border-[var(--line)] flex items-center gap-3 text-xs">
        <EyeOff className="w-5 h-5 text-[var(--gold)] shrink-0" />
        <div>
          <strong className="font-semibold text-[var(--ink)]">গোপনীয়তা নিশ্চিতকরণ নীতি:</strong>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            ডুপ্লিকেট পর্যালোচনায় অন্য কোনো নাগরিকের নাম, ফোন বা ব্যক্তিগত ডেটা দেখানো হয় না; শুধুমাত্র অবস্থান, সময় ও সমস্যার সাদৃশ্য প্রদর্শিত হয়।
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {duplicates.map((dup, idx) => {
          const primaryCase = cases.find(c => c.id === dup.primaryCaseId);
          const duplicateCase = cases.find(c => c.id === dup.duplicateCaseId);

          return (
            <div key={idx} className="civic-card rounded-xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--gold)] flex items-center justify-center font-bold text-xs">
                    <Copy className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-[var(--ink)]">
                    সনাক্তকরণ মিল (Similarity Score):
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--green)] bg-[var(--green-light)] px-2 py-0.5 rounded border border-[var(--green)]/30">
                    {toBanglaNumber(dup.similarityScore)}% মিল
                  </span>
                </div>

                <span className="text-xs text-[var(--muted)]">
                  দূরত্ব: <strong className="text-[var(--ink)]">{toBanglaNumber(dup.distanceMeters)} মিটার</strong>
                </span>
              </div>

              {/* Side-by-side Case Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Primary Case */}
                <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[var(--gold)] bg-[var(--paper)] px-2 py-0.5 rounded border border-[var(--line)]">
                      মূল কেস: {dup.primaryCaseId}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {primaryCase ? formatBanglaDate(primaryCase.submittedAt) : 'দাখিলকৃত'}
                    </span>
                  </div>
                  <h4 className="font-bold text-[var(--ink)] text-sm">{primaryCase?.title || 'রাস্তার ড্রেন বর্জ্য জমে বন্ধ'}</h4>
                  <p className="text-[var(--muted)] text-xs leading-relaxed">{primaryCase?.description}</p>
                  <p className="text-xs text-[var(--muted)] flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--green)]" />
                    {primaryCase?.location.address}
                  </p>
                </div>

                {/* Candidate Duplicate Case */}
                <div className="p-4 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)]">
                      ডুপ্লিকেট কেস: {dup.duplicateCaseId}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {formatBanglaDate(dup.detectedAt)}
                    </span>
                  </div>
                  <h4 className="font-bold text-[var(--ink)] text-sm">সেক্টর ৭ ড্রেনের পানি উপচে পড়ছে</h4>
                  <p className="text-[var(--muted)] text-xs leading-relaxed">একই ড্রেনের মুখ ময়লা জমে বন্ধ থাকায় পানি রাস্তায় আসছে।</p>
                  <p className="text-xs text-[var(--muted)] flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
                    রোড ৪ সংলগ্ন ড্রেন সেগমেন্ট
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
                <span className="text-xs text-[var(--muted)]">
                  অবস্থা: <strong className="text-[var(--ink)]">{dup.status === 'merged' ? 'সংযুক্ত (Merged)' : dup.status === 'rejected_distinct' ? 'আলাদা হিসেবে গৃহীত' : 'বিবেচনাধীন'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {dup.status === 'pending_review' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(dup)}
                        className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-elevated)] text-xs font-semibold transition"
                      >
                        আলাদা সমস্যা হিসেবে রাখুন
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMerge(dup)}
                        className="px-4 py-1.5 rounded-lg bg-[var(--green)] hover:opacity-90 text-white text-xs font-bold transition shadow-xs"
                      >
                        একই সমস্যা (মার্জ করুন)
                      </button>
                    </>
                  ) : dup.status === 'merged' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--green)] bg-[var(--green-light)] px-3 py-1 rounded-lg border border-[var(--green)]/30">
                        সংযুক্ত (মার্জড)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUnmerge(dup)}
                        className="px-3 py-1 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
                      >
                        মার্জ প্রত্যাহার (আনমার্জ)
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[var(--muted)] bg-[var(--paper-elevated)] px-3 py-1 rounded-lg border border-[var(--line)]">
                      আলাদা সমস্যা হিসেবে সংরক্ষিত
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
