import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Type, Eye, Volume2, VolumeX, Sparkles } from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const {
    fontSizeLevel,
    cycleFontSize,
    isHighContrast,
    toggleHighContrast,
    isSpeaking,
    stopSpeaking,
    speakText
  } = useAccessibility();

  const fontSizeLabels = {
    normal: 'স্বাভাবিক লেখা',
    large: 'বড় লেখা (L)',
    xlarge: 'অতিরিক্ত বড় (XL)'
  };

  return (
    <div className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 py-1.5 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 hidden sm:inline">সহজে পড়ার সুবিধা:</span>
          <button
            onClick={cycleFontSize}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-300 font-medium transition"
            title="ফন্ট সাইজ পরিবর্তন করুন"
          >
            <Type className="w-3.5 h-3.5 text-slate-600" />
            <span>{fontSizeLabels[fontSizeLevel]}</span>
          </button>

          <button
            onClick={toggleHighContrast}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition font-medium ${
              isHighContrast ? 'bg-black text-white border-black' : 'bg-white hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title="হাই-কনট্রাস্ট মোড"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">হাই কনট্রাস্ট</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-medium animate-pulse"
              title="পড়ে শোনানো বন্ধ করুন"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>পড়া বন্ধ করুন</span>
            </button>
          ) : (
            <button
              onClick={() => speakText('নাগরিক সাথী এআই প্ল্যাটফর্মে আপনাকে স্বাগতম। সিটি কর্পোরেশনের সমস্যা জানাতে ও সেবার তথ্য পেতে এই প্ল্যাটফর্ম ব্যবহার করুন।')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-medium transition"
              title="পেজের সারসংক্ষেপ শুনুন"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>পড়ে শোনান</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/60 font-medium">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            AI Proposes, People Decide
          </div>
        </div>
      </div>
    </div>
  );
};
