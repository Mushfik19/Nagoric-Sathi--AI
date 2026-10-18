import React from 'react';
import { DepartmentTask } from '../../types';
import { StatusBadge } from '../common/Badge';
import { calculateSlaCountdown, toBanglaNumber } from '../../utils/formatters';
import { ArrowDown, CheckCircle2, Clock, AlertTriangle, Lock, Unlock, Shield } from 'lucide-react';

interface DependencySequenceDiagramProps {
  tasks: DepartmentTask[];
  onTaskClick?: (task: DepartmentTask) => void;
}

export const DependencySequenceDiagram: React.FC<DependencySequenceDiagramProps> = ({
  tasks,
  onTaskClick
}) => {
  const sortedTasks = [...tasks].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  return (
    <div className="rounded-2xl p-5 bg-[var(--paper)] border border-[var(--line)] shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--line)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--gold)]" />
            <span>বহু-বিভাগীয় ডিপেন্ডেন্সি ও কাজের অনুক্রম (Multi-Department Sequencing)</span>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            আন্তঃবিভাগীয় সমন্বয়: পূর্ববর্তী বিভাগের কাজ শেষ না হওয়া পর্যন্ত পরবর্তী ডিপেন্ডেন্ট কাজ ব্লক থাকবে
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTasks.map((task, index) => {
          const isBlocked = task.status === 'pending_dependency';
          const isResolved = task.status === 'resolved';
          const isInProgress = task.status === 'in_progress' || task.status === 'in_inspection';
          const sla = calculateSlaCountdown(task.slaDeadline);

          return (
            <React.Fragment key={task.id}>
              {index > 0 && (
                <div className="flex items-center justify-center my-1 text-[var(--muted)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold bg-[var(--bg)] px-3.5 py-1 rounded-full border border-[var(--line)]">
                    <ArrowDown className="w-3.5 h-3.5 text-[var(--green)]" />
                    <span>পূর্ববর্তী কাজের সমাপ্তি আবশ্যক (Prerequisite Dependency)</span>
                  </div>
                </div>
              )}

              <div
                onClick={() => onTaskClick?.(task)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isResolved
                    ? 'bg-[var(--green-light)] border-[var(--line)]'
                    : isInProgress
                    ? 'bg-[var(--bg)] border-[var(--gold)] shadow-xs'
                    : isBlocked
                    ? 'bg-[var(--bg)] border-[var(--line)] opacity-80'
                    : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--green)] shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isResolved
                          ? 'bg-[var(--green)] text-white'
                          : isBlocked
                          ? 'bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)]'
                          : 'bg-[var(--green)] text-white'
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : isBlocked ? (
                        <Lock className="w-3.5 h-3.5 text-[var(--gold)]" />
                      ) : (
                        toBanglaNumber(task.sequenceOrder)
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[var(--gold)] uppercase tracking-wide">
                          ধাপ {toBanglaNumber(task.sequenceOrder)}: {task.departmentName}
                        </span>
                        {isBlocked && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> ব্লকড
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--ink)]">{task.title}</h4>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={task.status} />
                    <div className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                      <Clock className="w-3 h-3 text-[var(--gold)]" />
                      <span>{sla.text}</span>
                    </div>
                  </div>
                </div>

                {task.waitingReason && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>স্থবির কারণ: {task.waitingReason}</span>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
