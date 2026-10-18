import React, { useState } from 'react';

export interface EvidenceSubmissionPayload {
  taskId: string;
  photoUrl: string;
  notes: string;
  gpsCoordinates?: { lat: number; lng: number };
}

interface EvidenceSubmissionCardProps {
  taskId: string;
  taskTitle: string;
  onSubmitEvidence: (payload: EvidenceSubmissionPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const EvidenceSubmissionCard: React.FC<EvidenceSubmissionCardProps> = ({
  taskId,
  taskTitle,
  onSubmitEvidence,
  isSubmitting = false,
}) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState('23.7925');
  const [lng, setLng] = useState('90.4078');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !notes) return;
    await onSubmitEvidence({
      taskId,
      photoUrl,
      notes,
      gpsCoordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
    });
    setIsSuccess(true);
  };

  return (
    <div className="civic-card rounded-xl border border-[var(--line)] p-5">
      <div className="border-b border-[var(--line)] pb-3 mb-4">
        <h3 className="text-base font-bold text-[var(--ink)]">কাজের সমাপ্তি প্রমাণ আপলোড (Resolution Evidence)</h3>
        <p className="text-xs text-[var(--muted)]">মাঠ পর্যায়ে কাজ সমাপ্তির ছবি, জিপিএস ও কর্মকর্তাদের প্রত্যয়ন জমা দিন</p>
      </div>

      {isSuccess ? (
        <div className="bg-[var(--green-light)] border border-[var(--green)]/30 text-[var(--green)] p-4 rounded-lg text-xs">
          <p className="font-semibold">✓ কাজের প্রমাণ সফলভাবে জমা হয়েছে এবং টাস্কটি সমাধান হিসেবে চিহ্নিত হয়েছে।</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--line)]">
            <span className="text-xs text-[var(--muted)] block">কাজের শিরোনাম:</span>
            <span className="text-sm font-semibold text-[var(--ink)]">{taskTitle}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
              সমাপ্তির ছবির ইউআরএল (Before/After Proof) *
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/... বা আপলোডকৃত লিঙ্ক"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              required
              className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">জিপিএস অক্ষাংশ (Lat)</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">জিপিএস দ্রাঘিমাংশ (Lng)</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
              কর্মকর্তার সমাপ্তি মন্তব্য ও কাজের বিবরণ *
            </label>
            <textarea
              rows={3}
              placeholder="বর্জ্য পরিষ্কার সম্পন্ন হয়েছে এবং ড্রেন প্রবাহ সম্পূর্ণ উন্মুক্ত করা হয়েছে..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              className="w-full text-xs bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-lg p-2.5 focus:outline-hidden focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !photoUrl || !notes}
              className="px-5 py-2.5 bg-[var(--green)] hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition"
            >
              {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'প্রমাণ সাবমিট ও সমাধান সম্পন্ন করুন'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
