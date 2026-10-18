import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Flame,
  HeartPulse,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { APP_NAME_BN } from '../../constants';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[var(--paper)] text-[var(--ink)] border-t border-[var(--line)] transition-colors duration-200">
      {/* Sleek Emergency Hotline Bar */}
      <div className="border-b border-[var(--line)] bg-[var(--bg)]/70 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1540px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#991b1b] font-bold">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="uppercase tracking-wider">জরুরি জাতীয় হটলাইন ও তাৎক্ষণিক সহায়তা:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <a
              href="tel:999"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 font-bold transition"
              title="জাতীয় জরুরি সেবা (পুলিশ, অ্যাম্বুলেন্স, ফায়ার সার্ভিস)"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>৯৯৯</span>
              <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(জরুরি সেবা)</span>
            </a>

            <a
              href="tel:333"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold transition"
              title="সরকারি তথ্য ও নাগরিক সেবা কল সেন্টার"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>৩৩৩</span>
              <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(নাগরিক সেবা)</span>
            </a>

            <a
              href="tel:16106"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold transition"
              title="পৌর ও সিটি কর্পোরেশন নাগরিক সহায়তা"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>১৬১০৬</span>
              <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(পৌর সহায়তা)</span>
            </a>

            <a
              href="tel:16263"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 font-bold transition"
              title="স্বাস্থ্য বাতায়ন ২৪/৭"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>১৬২৬৩</span>
              <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(স্বাস্থ্য বাতায়ন)</span>
            </a>

            <a
              href="tel:109"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 font-bold transition"
              title="নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>১০৯</span>
              <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(নারী ও শিশু)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Professional Compact Body */}
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Principles */}
          <div className="md:col-span-4 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-[#166534]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wider uppercase text-[var(--ink)] leading-none">
                  NAGORIK SATHI <span className="text-[#166534]">AI</span>
                </span>
                <span className="text-[11px] font-medium text-[var(--muted)] mt-0.5">
                  {APP_NAME_BN}
                </span>
              </div>
            </Link>

            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm">
              সিটি কর্পোরেশন এলাকার নাগরিক সমস্যা দ্রুত নিরসন ও বহু-বিভাগীয় টাস্ক সমন্বয়ে কৃত্রিম বুদ্ধিমত্তা-সহায়তাপ্রাপ্ত সরকারি প্ল্যাটফর্ম।
            </p>

            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#166534] bg-[var(--bg)] border border-[var(--line)] rounded-xl px-3 py-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#166534] shrink-0" />
              <span>নীতি: “AI proposes, People decide.”</span>
            </div>
          </div>

          {/* Quick Citizen Services */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              নাগরিক সেবা
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/report" className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[#166534]" />
                  <span>সমস্যা রিপোর্ট করুন</span>
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[#166534]" />
                  <span>লাইভ সিটি মানচিত্র</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[#166534]" />
                  <span>সেবা নির্দেশিকা ও নলেজবেস</span>
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3 h-3 text-[#166534]" />
                  <span>পাবলিক স্বচ্ছতা ড্যাশবোর্ড</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Gov Portals */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider flex items-center gap-1.5">
              <span>জরুরি সরকারি পোর্টাল</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://bangladesh.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                  <span>বাংলাদেশ জাতীয় তথ্য বাতায়ন</span>
                </a>
              </li>
              <li>
                <a
                  href="https://modmr.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                  <span>দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয়</span>
                </a>
              </li>
              <li>
                <a
                  href="https://fireservice.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                  <span>ফায়ার সার্ভিস ও সিভিল ডিফেন্স</span>
                </a>
              </li>
              <li>
                <a
                  href="https://lgd.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                  <span>স্থানীয় সরকার বিভাগ (LGD)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bdris.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[#166534] transition flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                  <span>জন্ম ও মৃত্যু নিবন্ধন পোর্টাল</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Operational Roles */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              দাপ্তরিক ওয়ার্কস্পেস
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/login/ward" className="text-[var(--muted)] hover:text-[#166534] transition">
                  ওয়ার্ড ডেস্ক কমান্ড
                </Link>
              </li>
              <li>
                <Link to="/login/officer" className="text-[var(--muted)] hover:text-[#166534] transition">
                  দপ্তর কর্মকর্তা
                </Link>
              </li>
              <li>
                <Link to="/login/coordinator" className="text-[var(--muted)] hover:text-[#166534] transition">
                  কেস কোঅর্ডিনেটর
                </Link>
              </li>
              <li>
                <Link to="/login/admin" className="text-[var(--muted)] hover:text-[#166534] transition">
                  সিস্টেম অডিট ও গভর্ন্যান্স
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Compact Metadata & Copyright */}
        <div className="border-t border-[var(--line)] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--muted)]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span>গণপ্রজাতন্ত্রী বাংলাদেশ · সিভিক সার্ভিস আরএন্ডডি v1.2</span>
            <span>•</span>
            <span className="font-mono">SHA-256 ইমিউটেবল অডিট সিকিউরড</span>
          </div>
          <div>
            <span>© ২০২৬ নাগরি সাথী এআই · সর্বস্বত্ব সংরক্ষিত</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
