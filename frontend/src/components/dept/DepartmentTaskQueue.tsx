import React from 'react';
import { DepartmentTask } from '../../types';
import { toBanglaNumber } from '../../utils/formatters';

interface DepartmentTaskQueueProps {
  tasks: DepartmentTask[];
  onSelectTask?: (task: DepartmentTask) => void;
  selectedTaskId?: string;
  departmentName?: string;
  isLoading?: boolean;
}

export const DepartmentTaskQueue: React.FC<DepartmentTaskQueueProps> = ({
  tasks,
  onSelectTask,
  selectedTaskId,
  departmentName,
  isLoading = false,
}) => {
  return (
    <div className="bg-[var(--paper)] rounded-2xl shadow-xs border border-[var(--line)] overflow-hidden">
      <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)]">
            {departmentName ? `${departmentName} - ` : ''}দাপ্তরিক কাজের তালিকা
          </h3>
          <p className="text-xs text-[var(--muted)]">পূর্বশর্তভিত্তিক আনলকিং ও এসএলএ ট্র্যাকিং সহ কাজের সারি</p>
        </div>
        <span className="px-2.5 py-1 bg-[var(--bg)] text-[var(--gold)] text-xs font-semibold rounded-full border border-[var(--line)]">
          মোট কাজ: {toBanglaNumber(tasks.length)}
        </span>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {isLoading ? (
          <div className="p-6 text-center text-[var(--muted)] text-xs">কাজ লোড হচ্ছে...</div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted)] text-xs">এই মুহূর্তে কোনো বকেয়া কাজ নেই</div>
        ) : (
          tasks.map((task) => {
            const isBlocked = task.status === 'pending_dependency';
            const isDone = task.status === 'resolved';
            const isSelected = selectedTaskId === task.id;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask && onSelectTask(task)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-[var(--green-light)] border-l-4 border-[var(--green)]' : 'hover:bg-[var(--green-light)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--bg)] text-[var(--gold)] border border-[var(--line)]">
                        ক্রম #{toBanglaNumber(task.sequenceOrder)}
                      </span>
                      <h4 className="text-sm font-semibold text-[var(--ink)]">{task.title}</h4>
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mb-2 leading-relaxed">{task.description}</p>
                    {isBlocked && task.prerequisiteDeptName && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 mb-2">
                        <span>🔒 পূর্বশর্ত আটকে আছে:</span>
                        <span className="font-semibold text-[var(--ink)]">{task.prerequisiteDeptName}</span>
                        <span>দপ্তরের কাজ সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                      isDone ? 'bg-[var(--green-light)] text-[var(--green)] border-[var(--line)]' :
                      isBlocked ? 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]' :
                      task.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-[var(--gold)] border-amber-500/20'
                    }`}>
                      {isDone ? '✓ সম্পন্ন' : isBlocked ? 'লকড (লক করা)' : 'চলমান'}
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">
                      SLA: {toBanglaNumber(task.slaTargetHours || 24)} ঘণ্টা
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
