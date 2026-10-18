import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Bell, MapPin, Camera, Lock, CheckCircle2 } from 'lucide-react';

export const CitizenProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [gpsConsent, setGpsConsent] = useState(true);
  const [mediaPrivacyConsent, setMediaPrivacyConsent] = useState(true);
  const [smsConsent, setSmsConsent] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-light text-[var(--ink)]">
          নাগরিক প্রোফাইল ও <strong className="font-semibold text-[var(--gold)]">গোপনীয়তা সেটিংস</strong>
        </h1>
        <p className="text-xs text-[var(--muted)] mt-1">
          আপনার ব্যক্তিগত তথ্য ও প্ল্যাটফর্ম ডেটা ব্যবহারের অনুমতি নিয়ন্ত্রণ করুন
        </p>
      </div>

      <div className="rounded-2xl p-6 bg-[var(--paper)] border border-[var(--line)] space-y-6 shadow-xs">
        {/* User Info */}
        <div className="flex items-center gap-4 pb-6 border-b border-[var(--line)]">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full border-2 border-[var(--green)] object-cover"
          />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[var(--ink)]">{currentUser.name}</h2>
            <p className="text-xs text-[var(--muted)]">ফোন: <strong className="text-[var(--ink)]">{currentUser.phone || '০১৭১২-৩৪৫৬৭৮'}</strong></p>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--green)] bg-[var(--green-light)] px-2.5 py-0.5 rounded border border-[var(--line)] mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ভেরিফায়েড নাগরিক অ্যাকাউন্ট (NID Verified)
            </span>
          </div>
        </div>

        {/* Consent Controls */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
            ডেটা ও গোপনীয়তা সম্মতি (Privacy & Consent)
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--green)] transition cursor-pointer">
              <input
                type="checkbox"
                checked={gpsConsent}
                onChange={e => setGpsConsent(e.target.checked)}
                className="mt-0.5 rounded accent-[var(--green)]"
              />
              <div>
                <strong className="text-[var(--ink)] block text-xs">জিপিএস ও অবস্থান ব্যবহারের অনুমতি</strong>
                <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                  সমস্যার স্থান সঠিকভাবে মানচিত্রে চিহ্নিত করতে আপনার ব্রাউজারের ভৌগোলিক অবস্থান গ্রহণ করা হবে।
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--green)] transition cursor-pointer">
              <input
                type="checkbox"
                checked={mediaPrivacyConsent}
                onChange={e => setMediaPrivacyConsent(e.target.checked)}
                className="mt-0.5 rounded accent-[var(--green)]"
              />
              <div>
                <strong className="text-[var(--ink)] block text-xs">মিডিয়া প্রাইভেসী মাস্কিং</strong>
                <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                  ছবি ও ভিডিওতে পথচারীর মুখ ও গাড়ির নম্বর প্লেট স্বয়ংক্রিয়ভাবে অস্পষ্ট (Blur) রাখা হবে।
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--green)] transition cursor-pointer">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={e => setSmsConsent(e.target.checked)}
                className="mt-0.5 rounded accent-[var(--green)]"
              />
              <div>
                <strong className="text-[var(--ink)] block text-xs">এসএমএস ও পুশ নোটিফিকেশন এলার্ট</strong>
                <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                  অভিযোগের অবস্থা পরিবর্তনের সাথে সাথে ফোনে এসএমএস এবং অ্যাপে পুশ নোটিফিকেশন পাঠানো হবে।
                </p>
              </div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--line)]">
            {isSaved ? (
              <span className="flex items-center gap-1.5 text-xs text-[var(--green)] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>পছন্দসমূহ সংরক্ষিত হয়েছে</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
