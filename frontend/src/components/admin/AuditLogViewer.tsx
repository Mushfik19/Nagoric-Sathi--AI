import React from 'react';

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
}

interface AuditLogViewerProps {
  logs: AuditRecord[];
  filterRole?: string;
  onFilterChange?: (role: string) => void;
  isLoading?: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  filterRole = 'all',
  onFilterChange,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">নিরাপত্তা ও অ্যাকশন অডিট লগ</h3>
          <p className="text-xs text-slate-500">প্রশাসনিক এবং রোল-ভিত্তিক সমস্ত সিস্টেম অ্যাক্টিভিটির অপরিবর্তনীয় রেকর্ড</p>
        </div>
        {onFilterChange && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-medium">রোল ফিল্টার:</label>
            <select
              value={filterRole}
              onChange={(e) => onFilterChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="all">সকল রোল</option>
              <option value="citizen">নাগরিক</option>
              <option value="ward_desk">ওয়ার্ড ডেস্ক</option>
              <option value="field_officer">মাঠ কর্মকর্তা</option>
              <option value="coordinator">সমন্বয়ক</option>
              <option value="admin">সিস্টেম অ্যাডমিন</option>
            </select>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">সময়</th>
              <th className="px-4 py-3">ব্যবহারকারী</th>
              <th className="px-4 py-3">রোল</th>
              <th className="px-4 py-3">পদক্ষেপ (Action)</th>
              <th className="px-4 py-3">টার্গেট</th>
              <th className="px-4 py-3">স্ট্যাটাস</th>
              <th className="px-4 py-3">বিবরণ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">অডিট রেকর্ড লোড হচ্ছে...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">কোন অডিট রেকর্ড নেই</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('bn-BD')}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.actorName}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{log.action}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{log.targetEntity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'DENIED' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-sm truncate">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
