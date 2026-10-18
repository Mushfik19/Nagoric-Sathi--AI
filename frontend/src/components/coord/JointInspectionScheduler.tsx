import React, { useState } from 'react';

export interface InspectionSchedulePayload {
  caseId: string;
  inspectionDate: string;
  participatingDepartments: string[];
  leadOfficerName: string;
  specialInstructions: string;
}

interface JointInspectionSchedulerProps {
  caseId: string;
  caseTitle: string;
  wardName: string;
  onSchedule?: (payload: InspectionSchedulePayload) => Promise<void> | void;
}

export const JointInspectionScheduler: React.FC<JointInspectionSchedulerProps> = ({
  caseId,
  caseTitle,
  wardName,
  onSchedule,
}) => {
  const [date, setDate] = useState('');
  const [departments, setDepartments] = useState<string[]>(['waste', 'drainage']);
  const [leadOfficer, setLeadOfficer] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleDept = (dept: string) => {
    setDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || departments.length === 0) return;
    setIsSubmitting(true);
    try {
      if (onSchedule) {
        await onSchedule({
          caseId,
          inspectionDate: date,
          participatingDepartments: departments,
          leadOfficerName: leadOfficer,
          specialInstructions: notes,
        });
      }
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">যৌথ মাঠ পরিদর্শন সূচি (Joint Field Inspection)</h3>
          <p className="text-xs text-slate-500">বহু-বিভাগীয় জটিল সমস্যা সরেজমিনে তদন্তের জন্য সমন্বয়ক কর্তৃক নির্ধারিত সূচি</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-md border border-amber-200">
          ওয়ার্ড: {wardName}
        </span>
      </div>

      {submitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
          <p className="font-semibold">✓ যৌথ পরিদর্শন সূচি সফলভাবে সংরক্ষিত ও সংশ্লিষ্ট দপ্তরে প্রেরিত হয়েছে।</p>
          <p className="text-xs mt-1 text-emerald-700">তারিখ: {date} | বিভাগসমূহ: {departments.join(', ')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">সমস্যা:</label>
            <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {caseTitle} (আইডি: #{caseId.slice(0, 8)})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">পরিদর্শনের তারিখ ও সময় *</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">নেতৃত্বদানকারী কর্মকর্তা</label>
              <input
                type="text"
                placeholder="কর্মকর্তার নাম ও পদবী"
                value={leadOfficer}
                onChange={(e) => setLeadOfficer(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">অংশগ্রহণকারী দপ্তরসমূহ *</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'waste', label: 'বর্জ্য ব্যবস্থাপনা (Waste)' },
                { id: 'drainage', label: 'ড্রেনেজ ও নর্দমা (Drainage)' },
                { id: 'road_engineering', label: 'সড়ক ও অবকাঠামো (Roads)' },
                { id: 'lighting', label: 'বিদ্যুৎ ও বাতি (Lighting)' },
              ].map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => toggleDept(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    departments.includes(d.id)
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {departments.includes(d.id) ? '✓ ' : '+ '}
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">বিশেষ নির্দেশনা / পর্যবেক্ষণ নোট</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="পরিদর্শনের সময় ড্রেন ব্লক ও রাস্তা ক্ষয়ের গভীরতা যৌথভাবে পরিমাপ করুন..."
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !date || departments.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'প্রেরণ করা হচ্ছে...' : 'পরিদর্শন সূচি চূড়ান্ত করুন'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
