import React, { useState } from 'react';
import { MediaAttachment } from '../../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { CitizenObjectionModal } from './CitizenObjectionModal';

interface BeforeAfterViewerProps {
  initialEvidence: MediaAttachment[];
  resolutionEvidence?: MediaAttachment[];
  onAccept: (rating: number, feedback?: string) => void;
  onObject: (reasons: string[], notes?: string) => void;
  canVerify: boolean;
  status: string;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  initialEvidence,
  resolutionEvidence,
  onAccept,
  onObject,
  canVerify,
  status
}) => {
  const [isObjectionModalOpen, setIsObjectionModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [showAcceptFeedback, setShowAcceptFeedback] = useState(false);

  const initialPhoto = initialEvidence[0] || {
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
    caption: 'নাগরিকের প্রাথমিক সমস্যা'
  };

  const resolvedPhoto = resolutionEvidence?.[0] || {
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    caption: 'মাঠ দলের সংস্কার সমাধান'
  };

  const handleConfirmAccept = () => {
    onAccept(rating, feedbackNote);
    setShowAcceptFeedback(false);
  };

  return (
    <div className="civic-card rounded-2xl p-6 border border-[var(--line)] bg-[var(--paper)] shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--line)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
            <span>সমাধান যাচাই ও প্রমাণ তুলনা (Before / After Resolution Proof)</span>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            নাগরিকের অভিযোগের প্রাথমিক ছবি ও মাঠ দলের কাজ সম্পন্নের প্রমাণ পাশাপাশি যাচাই করুন
          </p>
        </div>
      </div>

      {/* Side-by-side Evidence Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Citizen's Initial Proof */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--muted)]">১. নাগরিকের প্রাথমিক রিপোর্ট (আগের অবস্থা):</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
              আগের সমস্যা
            </span>
          </div>
          <div className="rounded-xl overflow-hidden border border-[var(--line)] aspect-video bg-[var(--bg)] relative group">
            <img src={initialPhoto.url} alt="Initial Problem" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs p-2 text-[11px] text-white">
              {initialPhoto.caption}
            </div>
          </div>
        </div>

        {/* Right: Field Staff's Resolution Proof */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--green)]">২. মাঠ দলের সমাধান প্রমাণ (বর্তমান অবস্থা):</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--green-light)] text-[var(--green)] font-bold border border-[var(--line)]">
              কাজ সম্পন্ন
            </span>
          </div>
          <div className="rounded-xl overflow-hidden border border-[var(--line)] aspect-video bg-[var(--bg)] relative group">
            <img src={resolvedPhoto.url} alt="Resolved Proof" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs p-2 text-[11px] text-white">
              {resolvedPhoto.caption}
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Action Bar if Resolved and Awaiting Citizen Confirmation */}
      {canVerify && (status === 'resolved_pending_citizen' || status === 'in_progress') && (
        <div className="mt-6 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
          {!showAcceptFeedback ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)]">
                  মাঠ দলের সমাধান দেখে আপনি কি সন্তুষ্ট?
                </h4>
                <p className="text-[11px] text-[var(--muted)]">
                  কাজ ঠিকমতো হয়ে থাকলে সম্মতি দিন, অন্যথায় আপত্তি জানিয়ে পুনরায় পর্যালোচনায় পাঠান।
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsObjectionModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold shadow transition cursor-pointer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>সমাধান হয়নি (আপত্তি)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAcceptFeedback(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>সমাধান হয়েছে (সম্মতি)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <h4 className="text-xs font-bold text-[var(--ink)]">সেবার মান মূল্যায়ন করুন ও মন্তব্য দিন</h4>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-500' : 'text-[var(--muted)]'}`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-[var(--ink)] ml-2">({rating}/৫ স্টার)</span>
              </div>

              <input
                type="text"
                value={feedbackNote}
                onChange={e => setFeedbackNote(e.target.value)}
                placeholder="ঐচ্ছিক মন্তব্য লিখুন (যেমন: দ্রুত কাজের জন্য ধন্যবাদ)"
                className="w-full px-3 py-2 text-xs bg-[var(--paper)] text-[var(--ink)] placeholder-[var(--muted)] rounded-lg border border-[var(--line)] focus:ring-1 focus:ring-[var(--green)]"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAcceptFeedback(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:bg-[var(--bg)] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAccept}
                  className="px-4 py-1.5 rounded-lg bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  কেস সমাপ্তি নিশ্চিত করুন
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citizen Objection Modal */}
      <CitizenObjectionModal
        isOpen={isObjectionModalOpen}
        onClose={() => setIsObjectionModalOpen(false)}
        onSubmitObjection={(reasons, notes) => {
          onObject(reasons, notes);
          setIsObjectionModalOpen(false);
        }}
      />
    </div>
  );
};
