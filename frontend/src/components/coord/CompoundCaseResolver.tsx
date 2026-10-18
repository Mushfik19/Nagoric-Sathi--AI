import React from 'react';
import { DepartmentTask } from '../../types';

interface CompoundCaseResolverProps {
  caseId: string;
  tasks: DepartmentTask[];
  onAuthorizeClosure: (caseId: string) => Promise<void> | void;
  isAuthorizing?: boolean;
}

export const CompoundCaseResolver: React.FC<CompoundCaseResolverProps> = ({
  caseId,
  tasks,
  onAuthorizeClosure,
  isAuthorizing = false,
}) => {
  const allTasksResolved = tasks.length > 0 && tasks.every((t) => t.status === 'resolved');
  const unresolvedTasks = tasks.filter((t) => t.status !== 'resolved');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">যৌথ কেস চূড়ান্ত নিষ্পত্তি গেট (Coordinator Closure Gate)</h3>
          <p className="text-xs text-slate-500">সমস্ত আন্তঃবিভাগীয় সাবটাস্ক সম্পন্ন এবং প্রমাণ যাচাইয়ের পর চূড়ান্ত সমাপ্তি অনুমোদন</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
          allTasksResolved
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {allTasksResolved ? 'নিষ্পত্তির জন্য প্রস্তুত' : 'অমীমাংসিত কাজ বিদ্যমান'}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">উপ-কাজের ক্রমানুসারে অগ্রগতি</h4>
        {tasks.map((task) => {
          const isDone = task.status === 'resolved';
          return (
            <div
              key={task.id}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}>
                  {task.sequenceOrder}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.departmentName} দপ্তরের দায়িত্ব</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isDone ? '✓ সম্পন্ন' : 'চলমান'}
              </span>
            </div>
          );
        })}
      </div>

      {!allTasksResolved ? (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
          ⚠️ এখনও {unresolvedTasks.length}টি দপ্তরের কাজ চলমান রয়েছে। সিকোয়েন্স অনুযায়ী পূর্ববর্তী ডিপার্টমেন্টের প্রমাণ নিশ্চিত হওয়ার পূর্বে চূড়ান্ত ক্লোজার অনুমোদন করা যাবে না।
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <div className="text-xs text-emerald-900">
            <p className="font-bold text-sm">সকল বিভাগীয় কাজ ও প্রমাণ আপলোড সম্পন্ন হয়েছে।</p>
            <p>নাগরিকের ৭২ ঘণ্টার আপত্তি সময়সীমা অতিক্রম হওয়ার পর বা সন্তুষ্টি সাপেক্ষে স্থায়ীভাবে কেসটি বন্ধ করুন।</p>
          </div>
          <button
            onClick={() => onAuthorizeClosure(caseId)}
            disabled={isAuthorizing}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {isAuthorizing ? 'প্রক্রিয়াধীন...' : 'চূড়ান্ত সমাপ্তি অনুমোদন করুন (Authorize Closure)'}
          </button>
        </div>
      )}
    </div>
  );
};
