import React, { useState } from 'react';
import { AlertCircle, X, CheckSquare, Square, ShieldAlert } from 'lucide-react';

interface CitizenObjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitObjection: (reasons: string[], notes?: string) => void;
}

export const CitizenObjectionModal: React.FC<CitizenObjectionModalProps> = ({
  isOpen,
  onClose,
  onSubmitObjection
}) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const OBJECTION_OPTIONS = [
    'কাজ সম্পূর্ণ বা পুরোপুরি শেষ হয়নি',
    'ভুল জায়গায় বা অন্য স্পটে কাজ করা হয়েছে',
    'আবার একই সমস্যা দেখা দিয়েছে (পুনরাবৃত্তি)',
    'আপলোডকৃত ছবি বা ভিডিও প্রমাণটি যথেষ্ট বা স্পষ্ট নয়',
    'কাজের পর আশপাশে আবর্জনা বা ধ্বংসাবশেষ ফেলে রাখা হয়েছে',
    'অন্য কোনো সমস্যা রয়ে গেছে'
  ];

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReasons.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি আপত্তির কারণ নির্বাচন করুন');
      return;
    }
    onSubmitObjection(selectedReasons, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--paper)] text-[var(--ink)] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--line)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>নাগরিক আপত্তি দাখিল (Objection Flow)</span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--bg)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-[var(--muted)]">
            কী কারণে আপনি কাজটি সমাধান হিসেবে গণ্য করছেন না? কারণ নির্বাচন করুন:
          </p>

          <div className="space-y-2">
            {OBJECTION_OPTIONS.map(opt => {
              const isChecked = selectedReasons.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleReason(opt)}
                  className={`w-full text-left flex items-start gap-2.5 p-3 rounded-xl border text-xs transition cursor-pointer ${
                    isChecked
                      ? 'bg-rose-500/10 border-rose-500/30 text-[var(--ink)] font-medium'
                      : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-[var(--muted)] shrink-0 mt-0.5" />
                  )}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              বিস্তারিত বিবরণ (ঐচ্ছিক):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="সুনির্দিষ্ট কোনো তথ্য বা অবস্থান থাকলে লিখুন..."
              className="w-full p-2.5 text-xs bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--muted)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--bg)] border border-[var(--line)] rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer shadow-xs"
            >
              আপত্তি দাখিল ও পুনঃতদন্ত অনুরোধ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
