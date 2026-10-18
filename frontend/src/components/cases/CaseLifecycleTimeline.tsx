import React from 'react';
import { CaseLifecycleEvent, CaseStatus } from '../../types';
import { STATUS_CONFIG } from '../../constants';
import { formatBanglaDate, getRelativeTimeAgo } from '../../utils/formatters';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface CaseLifecycleTimelineProps {
  timeline: CaseLifecycleEvent[];
  currentStatus: CaseStatus;
}

export const CaseLifecycleTimeline: React.FC<CaseLifecycleTimelineProps> = ({
  timeline,
  currentStatus
}) => {
  const getBadgeIcon = (event: CaseLifecycleEvent) => {
    if (event.actionTitle.includes('AI') || event.actionTitle.includes('এআই')) {
      return <Sparkles className="w-3.5 h-3.5 text-[#d4c19a]" />;
    }
    if (event.stage === 'reopened') {
      return <AlertCircle className="w-3.5 h-3.5 text-[#c66e60]" />;
    }
    if (event.stage === 'closed') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#4b9e78]" />;
    }
    if (event.stage === 'verified') {
      return <UserCheck className="w-3.5 h-3.5 text-[#8f92b3]" />;
    }
    return <Clock className="w-3.5 h-3.5 text-[#a7b0a8]" />;
  };

  return (
    <div className="rounded-2xl p-5 bg-[var(--paper)] border border-[var(--line)] shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--line)]">
        <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--gold)]" />
          <span>অভিযোগের জীবন্ত অগ্রগতি পরিক্রমা (Live Timeline)</span>
        </h3>
        <span className="text-xs text-[var(--muted)] font-medium">
          বর্তমান অবস্থা: <strong className="text-[var(--green)] font-bold">{STATUS_CONFIG[currentStatus]?.label || currentStatus}</strong>
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--line)]">
        {timeline.map((event, index) => {
          const isLatest = index === timeline.length - 1;
          return (
            <div key={event.id} className="relative group animate-in fade-in duration-200">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-[var(--paper)] shadow transition ${
                  isLatest
                    ? 'border-[var(--green)] text-[var(--green)]'
                    : 'border-[var(--line)] text-[var(--muted)]'
                }`}
              >
                {getBadgeIcon(event)}
              </div>

              {/* Event Content */}
              <div className="bg-[var(--bg)] hover:bg-[var(--paper-elevated)] p-4 rounded-xl border border-[var(--line)] transition space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <h4 className="text-xs font-semibold text-[var(--ink)] leading-tight">
                    {event.actionTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                    <span>{getRelativeTimeAgo(event.timestamp)}</span>
                    <span>•</span>
                    <span>{formatBanglaDate(event.timestamp)}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted)] leading-relaxed">{event.actionDescription}</p>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)]">
                  <span>কর্মকর্তা/সূত্র:</span>
                  <span className="font-semibold text-[var(--gold)] bg-[var(--paper)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {event.actorName}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
