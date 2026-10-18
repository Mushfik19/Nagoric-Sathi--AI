import React from 'react';
import { AiExtractedDetail } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { Sparkles, ShieldAlert, CheckCircle2, FileText, Info, HelpCircle } from 'lucide-react';

interface AiProposalCardProps {
  proposal: AiExtractedDetail;
  isStaffView?: boolean;
}

export const AiProposalCard: React.FC<AiProposalCardProps> = ({ proposal, isStaffView = false }) => {
  const isConfidenceHigh = proposal.confidenceScore >= 80;

  return (
    <div className="bg-[var(--paper)] rounded-2xl border border-[var(--line)] p-5 shadow-xs space-y-4">
      {/* Principle Banner */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--line)] flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--gold)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
              এআই বহু-মাধ্যম বিশ্লেষণ ও দায়িত্ব প্রস্তাব (AI Proposal)
            </h4>
            <p className="text-[11px] text-[var(--muted)]">
              AI proposes, people decide — চূড়ান্ত সিদ্ধান্ত মানব কর্মকর্তা গ্রহণ করবেন
            </p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex items-center gap-2.5 bg-[var(--bg)] px-3.5 py-1.5 rounded-xl border border-[var(--line)]">
          <span className="text-[11px] text-[var(--muted)] font-medium">কনফিডেন্স স্কোর:</span>
          <span className="text-sm font-bold font-mono text-[var(--green)]">{proposal.confidenceScore}%</span>
          <div className="w-16 h-2 bg-[var(--paper)] rounded-full overflow-hidden border border-[var(--line)]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                proposal.confidenceScore >= 80 ? 'bg-[var(--green)]' : 'bg-[var(--gold)]'
              }`}
              style={{ width: `${proposal.confidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Uncertainty Notice if Low Confidence */}
      {!isConfidenceHigh && (
        <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-start gap-2.5 text-xs text-[var(--gold)]">
          <ShieldAlert className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-[var(--ink)]">মানব যাচাই বাধ্যতামূলক (Gate Fallback):</strong>
            <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
              এআই কনফিডেন্স ৮০% এর কম হওয়ায় সরাসরি কোনো বিভাগ চূড়ান্ত করা হয়নি। ওয়ার্ড ডেস্ক কর্মকর্তা তথ্য যাচাই করে সিদ্ধান্ত দেবেন।
            </p>
          </div>
        </div>
      )}

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--line)] space-y-1">
          <span className="text-[11px] text-[var(--muted)] block">সমস্যার ধরন ও সারসংক্ষেপ:</span>
          <p className="font-semibold text-[var(--ink)]">{proposal.categoryLabel}</p>
          <p className="text-[11px] text-[var(--muted)] leading-relaxed">{proposal.problemSummary}</p>
        </div>

        <div className="bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--line)] space-y-1">
          <span className="text-[11px] text-[var(--muted)] block">প্রস্তাবিত অগ্রাধিকার (AI Suggested Priority):</span>
          <div className="flex items-center gap-2 mt-1">
            <PriorityBadge priority={proposal.proposedPriority} />
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-1.5 leading-relaxed">{proposal.priorityReason}</p>
        </div>

        <div className="bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--line)] space-y-1">
          <span className="text-[11px] text-[var(--muted)] block">প্রস্তাবিত দায়িত্বপ্রাপ্ত বিভাগ:</span>
          <p className="font-semibold text-[var(--green)]">{proposal.proposedDepartmentName}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] mt-1">
            <FileText className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>প্রযোজ্য বিধি: <strong className="text-[var(--ink)] font-mono">{proposal.ruleReference}</strong></span>
          </div>
        </div>

        <div className="bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--line)] space-y-1">
          <span className="text-[11px] text-[var(--muted)] block">সম্পর্কিত সিটি অ্যাসেট (Asset Link):</span>
          <p className="font-semibold text-[var(--ink)]">{proposal.assetName || 'সাধারণ ওয়ার্ড অবকাঠামো'}</p>
          {proposal.assetId && (
            <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--gold)] mt-1 border border-[var(--line)]">
              Asset ID: {proposal.assetId}
            </span>
          )}
        </div>
      </div>

      {/* Signal Extraction List */}
      {proposal.signals && proposal.signals.length > 0 && (
        <div className="bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--line)] text-xs">
          <span className="text-[11px] font-semibold text-[var(--gold)] flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>শনাক্তকৃত সিগন্যাল ও নিয়ামকসমূহ (Extracted Signals):</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {proposal.signals.map((sig, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] text-[11px] font-mono"
              >
                {sig}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
