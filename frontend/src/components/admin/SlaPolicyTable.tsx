import React from 'react';
import { PriorityLevel } from '../../types';

export interface SLAPolicyItem {
  id?: string;
  priority: PriorityLevel;
  labelBangla: string;
  targetResponseHours: number;
  targetResolutionHours: number;
  escalationThresholdHours: number;
  description: string;
}

interface SlaPolicyTableProps {
  policies: SLAPolicyItem[];
  onUpdatePolicy?: (policy: SLAPolicyItem) => void;
  isLoading?: boolean;
}

export const SlaPolicyTable: React.FC<SlaPolicyTableProps> = ({
  policies,
  onUpdatePolicy,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">সিটি কর্পোরেশন এসএলএ (SLA) পলিসি কনফিগারেশন</h3>
          <p className="text-xs text-slate-500">অগ্রাধিকার স্তর অনুযায়ী সর্বোচ্চ প্রতিক্রিয়া ও সমাধান সময়সীমা</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">অগ্রাধিকার (Priority)</th>
              <th className="px-4 py-3">স্বীকৃতি সময় (ঘণ্টা)</th>
              <th className="px-4 py-3">সমাধান সময় (ঘণ্টা)</th>
              <th className="px-4 py-3">এসকেলেশন সীমা (ঘণ্টা)</th>
              <th className="px-4 py-3">বিবরণ</th>
              <th className="px-4 py-3 text-right">পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">পলিসি লোড হচ্ছে...</td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">কোন পলিসি পাওয়া যায়নি</td>
              </tr>
            ) : (
              policies.map((p) => (
                <tr key={p.priority} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                      p.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                      p.priority === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.labelBangla || p.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.targetResponseHours} ঘণ্টা</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.targetResolutionHours} ঘণ্টা</td>
                  <td className="px-4 py-3">{p.escalationThresholdHours} ঘণ্টা</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">{p.description}</td>
                  <td className="px-4 py-3 text-right">
                    {onUpdatePolicy && (
                      <button
                        onClick={() => onUpdatePolicy(p)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-semibold"
                      >
                        সম্পাদনা
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
