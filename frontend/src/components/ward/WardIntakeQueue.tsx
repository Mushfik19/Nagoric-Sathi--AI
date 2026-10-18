import React from 'react';
import { PriorityLevel } from '../../types';

export interface WardCaseItem {
  id: string;
  trackingNumber: string;
  title: string;
  categoryLabel: string;
  confidenceScore: number;
  requiresHumanVerification: boolean;
  priority: PriorityLevel;
  submittedAt: string;
  status: string;
}

interface WardIntakeQueueProps {
  cases: WardCaseItem[];
  onReviewCase?: (caseItem: WardCaseItem) => void;
  isLoading?: boolean;
}

export const WardIntakeQueue: React.FC<WardIntakeQueueProps> = ({
  cases,
  onReviewCase,
  isLoading = false,
}) => {
  return (
    <div className="civic-card rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-xs overflow-hidden">
      <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
        <div>
          <h3 className="text-base font-light text-[var(--ink)]">
            ওয়ার্ড ইনটেক ও <strong className="font-semibold text-[var(--gold)]">এআই ভেরিফিকেশন কিউ</strong>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">৮০% এর কম এআই কনফিডেন্স যুক্ত অভিযোগগুলোর জন্য মানব যাচাই প্রয়োজন</p>
        </div>
        <span className="px-2.5 py-1 bg-[var(--bg)] border border-[var(--line)] text-[var(--gold)] text-xs font-mono font-semibold rounded-lg">
          মোট অভিযোগ: {cases.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--muted)]">
          <thead className="bg-[var(--bg)] text-xs uppercase font-semibold text-[var(--muted)] border-b border-[var(--line)]">
            <tr>
              <th className="px-4 py-3">ট্র্যাকিং নম্বর</th>
              <th className="px-4 py-3">অভিযোগের বিবরণ</th>
              <th className="px-4 py-3">বিভাগ / ক্যাটাগরি</th>
              <th className="px-4 py-3">AI কনফিডেন্স</th>
              <th className="px-4 py-3">যাচাই অবস্থা</th>
              <th className="px-4 py-3 text-right">পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-[var(--muted)]">কেস লোড হচ্ছে...</td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-[var(--muted)]">এই মুহূর্তে কোনো নতুন ইনটেক নেই</td>
              </tr>
            ) : (
              cases.map((c) => {
                const isUnderThreshold = c.confidenceScore < 80;
                return (
                  <tr key={c.id} className="hover:bg-[var(--green-light)] transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono font-semibold text-xs text-[var(--gold)]">
                      {c.trackingNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--ink)] max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-4 py-3 text-xs">{c.categoryLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${
                          isUnderThreshold ? 'text-[var(--gold)]' : 'text-[var(--green)]'
                        }`}>
                          {c.confidenceScore}%
                        </span>
                        <div className="w-12 h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--line)]">
                          <div
                            className={`h-full ${isUnderThreshold ? 'bg-[var(--gold)]' : 'bg-[var(--green)]'}`}
                            style={{ width: `${c.confidenceScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.requiresHumanVerification ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          ⚠️ মানব যাচাই প্রয়োজন
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--green-light)] text-[var(--green)] border border-[var(--line)]">
                          ✓ স্বয়ংক্রিয় অনুমোদিত
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {onReviewCase && (
                        <button
                          onClick={() => onReviewCase(c)}
                          className="px-3 py-1 bg-[var(--green)] hover:bg-[var(--green-dark)] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          পর্যালোচনা
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
