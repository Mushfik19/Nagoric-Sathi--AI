import React, { useState, useEffect, useRef } from 'react';
import { Type, Eye, Activity, Volume2, VolumeX, Sparkles, X } from 'lucide-react';

export const AccessibilityPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Font size scaling handler
  const cycleFontSize = () => {
    const nextLevel = fontSizeLevel === 'normal' ? 'large' : fontSizeLevel === 'large' ? 'xlarge' : 'normal';
    setFontSizeLevel(nextLevel);
    document.documentElement.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    document.documentElement.classList.add(`text-size-${nextLevel}`);
  };

  // High contrast handler
  const toggleHighContrast = () => {
    const nextVal = !isHighContrast;
    setIsHighContrast(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('high-contrast');
      document.body.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.classList.remove('high-contrast');
    }
  };

  // Reduced motion handler
  const toggleReducedMotion = () => {
    const nextVal = !isReducedMotion;
    setIsReducedMotion(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  // Text to Speech (Bangla Synthesis)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে স্পিচ সিন্থেসিস সমর্থন নেই');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fontSizeLabels = {
    normal: 'স্বাভাবিক লেখা (১০০%)',
    large: 'বড় লেখা (১২০%)',
    xlarge: 'অতিরিক্ত বড় (১৪০%)'
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="অ্যাক্সেসিবিলিটি সেটিংস"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--green-light)] border border-[var(--line)] transition duration-200 cursor-pointer"
        title="সহজে পড়ার সুবিধা ও অ্যাক্সেসিবিলিটি"
      >
        <span className="font-serif font-bold text-sm tracking-tighter text-[var(--gold)]">Aa</span>
        <span className="hidden xl:inline text-[11px] font-medium text-[var(--muted)]">সহজ পাঠ</span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="অ্যাক্সেসিবিলিটি বিকল্পসমূহ"
          className="absolute right-0 top-full mt-2 w-72 bg-[var(--paper)] rounded-2xl border border-[var(--line)] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-[var(--ink)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <span className="text-xs font-semibold text-[var(--gold)]">সহজে ব্যবহারের সুবিধাসমূহ</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--green-light)] transition cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 mt-3 text-xs">
            {/* Font Size Scaling */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[var(--gold)]" />
                ফন্ট সাইজ:
              </span>
              <button
                type="button"
                onClick={cycleFontSize}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg)] hover:bg-[var(--green-light)] text-[11px] font-semibold text-[var(--ink)] border border-[var(--line)] transition cursor-pointer"
              >
                {fontSizeLabels[fontSizeLevel]}
              </button>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[var(--gold)]" />
                উচ্চ কনট্রাস্ট:
              </span>
              <button
                type="button"
                onClick={toggleHighContrast}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                  isHighContrast
                    ? 'bg-[var(--green)] text-white border-[var(--green)]'
                    : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:bg-[var(--green-light)]'
                }`}
              >
                {isHighContrast ? 'সক্রিয়' : 'বন্ধ'}
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--gold)]" />
                অ্যানিমেশন সীমিত:
              </span>
              <button
                type="button"
                onClick={toggleReducedMotion}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                  isReducedMotion
                    ? 'bg-[var(--green)] text-white border-[var(--green)]'
                    : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:bg-[var(--green-light)]'
                }`}
              >
                {isReducedMotion ? 'সক্রিয়' : 'বন্ধ'}
              </button>
            </div>

            {/* Text-to-Speech */}
            <div className="pt-2 border-t border-[var(--line)]">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 dark:bg-[#382326] text-red-700 dark:text-[#c66e60] border border-red-200 dark:border-[#71434a] font-bold text-xs animate-pulse cursor-pointer"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>পড়ে শোনানো বন্ধ করুন</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      'নাগরিক সাথী এআই প্ল্যাটফর্মে স্বাগতম। আপনার এলাকার যে কোনো নাগরিক সমস্যা জানাতে সমস্যা জানাবেন বাটনে ক্লিক করুন।'
                    )
                  }
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--bg)] hover:bg-[var(--green-light)] text-[var(--gold)] border border-[var(--line)] font-semibold text-xs transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-[var(--gold)]" />
                  <span>পেজের মূল বিষয় পড়ে শোনান</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
