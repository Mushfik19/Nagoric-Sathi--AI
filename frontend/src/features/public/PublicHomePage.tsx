import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  PlusCircle,
  FileText,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  MessageCircle,
  Layers,
  ChevronRight,
  Globe,
  Camera,
  Mic,
  Workflow,
  ShieldAlert,
  Smartphone,
  BookOpen,
  Repeat,
  HeartHandshake,
  CheckSquare
} from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

interface HeroSlide {
  id: string;
  bnNumber: string;
  img: string;
  tagBn: string;
  stepBn: string;
  headlineBn: string;
  subtitleBn: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: '01',
    bnNumber: '০১',
    img: '/images/hero_civic_lake.jpg',
    tagBn: '— বাংলাদেশ / সবার শহর, সবার পাশে',
    stepBn: '০১ / আমাদের শহর',
    headlineBn: 'সুন্দর শহরের শুরু আপনার হাতে।',
    subtitleBn: 'আপনার কথা, দায়িত্বপ্রাপ্ত বিভাগ এবং যাচাইকৃত সমাধান—একই জায়গায়।'
  },
  {
    id: '02',
    bnNumber: '০২',
    img: '/images/hero_promenade_night.jpg',
    tagBn: '— বাংলাদেশ / সবার শহর, সবার পাশে',
    stepBn: '০২ / সেবার সংযোগ',
    headlineBn: 'এক অভিযোগ। সমন্বিত সেবা।',
    subtitleBn: 'ময়লা অপসারণ, ড্রেন পরিষ্কার ও সড়ক মেরামত—একাধিক বিভাগের কাজ, এক সমন্বিত কেস।'
  },
  {
    id: '03',
    bnNumber: '০৩',
    img: '/images/hero_civic_desk.jpg',
    tagBn: '— বাংলাদেশ / সবার শহর, সবার পাশে',
    stepBn: '০৩ / সমাধানের নিশ্চয়তা',
    headlineBn: 'সমাধান হোক প্রমাণসহ।',
    subtitleBn: 'সমাধানের প্রমাণ দেখুন। কাজ ঠিক না হলে একই কেসে আবার যাচাইয়ের অনুরোধ করুন।'
  }
];

const RECENT_LIVE_CASES = [
  {
    id: 'NS-2026-W03-1001',
    category: 'drainage',
    categoryBn: 'ড্রেনেজ ও জলাবদ্ধতা',
    titleBn: 'প্রধান সড়কে বর্জ্য জমে ড্রেন ভরাট ও জলাবদ্ধতা সৃষ্টি',
    wardBn: 'ওয়ার্ড ৩ (মিরপুর)',
    priority: 'emergency',
    priorityBn: 'জরুরি',
    status: 'in_progress',
    statusBn: 'সমন্বিত সমাধান চলমান',
    tasksCount: 3,
    activeDept: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
    slaRemaining: '২ ঘণ্টা ১৮ মি.',
    prerequisiteNote: 'বর্জ্য অপসারণ সম্পন্ন -> ড্রেন স্লাজ ক্লিনিং চলমান'
  },
  {
    id: 'NS-2026-W12-0842',
    category: 'waste',
    categoryBn: 'কঠিন বর্জ্য ব্যবস্থাপনা',
    titleBn: 'বাজার সংলগ্ন সেকেন্ডারি ট্রান্সফার পয়েন্ট উপচে ময়লা ফেলা',
    wardBn: 'ওয়ার্ড ১২ (ধানমন্ডি)',
    priority: 'high',
    priorityBn: 'উচ্চ অগ্রাধিকার',
    status: 'verified',
    statusBn: 'দপ্তর কর্তৃক গৃহীত',
    tasksCount: 1,
    activeDept: 'বর্জ্য ব্যবস্থাপনা বিভাগ',
    slaRemaining: '৫ ঘণ্টা ৪৫ মি.',
    prerequisiteNote: 'কমপ্যাক্টর ট্রাক নির্ধারিত'
  },
  {
    id: 'NS-2026-W08-0719',
    category: 'roads',
    categoryBn: 'সড়ক ও অবকাঠামো',
    titleBn: 'কালভার্ট সংযোগে গভীর গর্ত ও খোয়া সরে যাওয়া',
    wardBn: 'ওয়ার্ড ৮ (গুলশান)',
    priority: 'medium',
    priorityBn: 'মাঝারি',
    status: 'resolved',
    statusBn: 'সমাধান সম্পন্ন (যাচাইকৃত)',
    tasksCount: 2,
    activeDept: 'সিভিল ও সড়ক সংস্কার বিভাগ',
    slaRemaining: 'সম্পন্ন',
    prerequisiteNote: 'নাগরিক সন্তুষ্টি নিশ্চিতকৃত'
  }
];

const SCOPE_METRICS = [
  { value: '১২+', labelBn: 'সিটি ওয়ার্ড কভারেজ', subBn: 'Active Ward Desks' },
  { value: '৪', labelBn: 'সমন্বিত পৌর দপ্তর', subBn: 'Waste, Drain, Roads, Lights' },
  { value: '৯৪.২%', labelBn: 'অন-টাইম সমাধান হার', subBn: 'Strict SLA Target' },
  { value: '৮০%', labelBn: 'এআই কনফিডেন্স গেট', subBn: 'Human Verification Fallback' }
];

export const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickWard, setQuickWard] = useState('3');
  const [quickCategory, setQuickCategory] = useState('drainage');
  const [selectedCase, setSelectedCase] = useState(RECENT_LIVE_CASES[0]);

  // Auto-play carousel every 6.5s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeSlide = HERO_SLIDES[currentSlide];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    if (isAuthenticated) {
      navigate('/report', { state: { description: quickInput, wardId: quickWard, category: quickCategory } });
    } else {
      navigate('/login/citizen', {
        state: {
          from: {
            pathname: '/report',
            state: { description: quickInput, wardId: quickWard, category: quickCategory }
          }
        }
      });
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-[#382326] text-[#e8b6b8] border-[#71434a]';
      case 'high':
        return 'bg-[#373224] text-[#d4c19a] border-[#6b5c3e]';
      case 'resolved':
        return 'bg-[#1c2b20] text-[#a8e6cf] border-[#295e42]';
      default:
        return 'bg-[#22312f] text-[#b3c6c6] border-[#3d5553]';
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 animate-in fade-in duration-300 pb-16">
      {/* 1. CINEMATIC EDITORIAL HERO CAROUSEL (Reference-Identical) */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="hero-preserve relative min-h-[640px] sm:min-h-[720px] lg:min-h-[840px] flex flex-col justify-between overflow-hidden border-b border-[#343d34]"
      >
        {/* Background Slide Images with Crossfade & Ambient Vignette */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transition-transform duration-[7000ms]`}
          >
            <img
              src={slide.img}
              alt={slide.headlineBn}
              className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08]"
            />
            {/* Cinematic Gradients for Rich Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d100e] via-[#0d100e]/40 to-[#0d100e]/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d100e]/85 via-transparent to-[#0d100e]/60" />
          </div>
        ))}

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-[#295e42]/20 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[300px] bg-[#d4c19a]/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32 pb-8 flex-1 flex flex-col justify-center">
          <div className="max-w-4xl space-y-6 text-left">
            {/* Breadcrumb Tags */}
            <div className="space-y-1 animate-in fade-in duration-500">
              <span className="text-xs sm:text-sm font-medium tracking-wide text-[#a7b0a8] block">
                {activeSlide.tagBn}
              </span>
              <span className="text-xs font-mono tracking-widest text-[#d4c19a] uppercase block">
                {activeSlide.stepBn}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#eeeee6] leading-[1.12]">
              {activeSlide.headlineBn}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-[#cbd5cc] font-normal leading-relaxed max-w-2xl">
              {activeSlide.subtitleBn}
            </p>

            {/* 3 Interactive Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-3xl">
              {/* Card 1: সমস্যা জানাই (Highlighted Accent Card) */}
              <Link
                to={isAuthenticated ? '/report' : '/login/citizen'}
                state={!isAuthenticated ? { from: { pathname: '/report' } } : undefined}
                className="group p-5 rounded-2xl bg-[#d4c19a] hover:bg-[#ebd8b1] text-[#0d100e] transition-all duration-200 shadow-2xl flex items-center justify-between cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0d100e]/10 border border-[#0d100e]/15 flex items-center justify-center font-bold text-xl text-[#0d100e]">
                    +
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0d100e] leading-snug">
                      সমস্যা জানাই
                    </h3>
                    <p className="text-[11px] text-[#2c332d] font-medium">
                      আপনার সমস্যাটি জানান
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#0d100e] group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Card 2: অভিযোগের খবর দেখি (Translucent Glass Card) */}
              <Link
                to={isAuthenticated ? '/cases' : '/login/citizen'}
                state={!isAuthenticated ? { from: { pathname: '/cases' } } : undefined}
                className="group p-5 rounded-2xl bg-[#151a16]/85 backdrop-blur-md hover:bg-[#1f382a] border border-[#343d34] hover:border-[#d4c19a] text-[#eeeee6] transition-all duration-200 shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0d100e] border border-[#343d34] flex items-center justify-center text-[#d4c19a]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#eeeee6] leading-snug">
                      অভিযোগের খবর দেখি
                    </h3>
                    <p className="text-[11px] text-[#a7b0a8]">
                      কাজ কত দূর হলো দেখুন
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#a7b0a8] group-hover:text-[#d4c19a] group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Card 3: কাছের সেবা খুঁজি (Translucent Glass Card) */}
              <Link
                to="/map"
                className="group p-5 rounded-2xl bg-[#151a16]/85 backdrop-blur-md hover:bg-[#1f382a] border border-[#343d34] hover:border-[#d4c19a] text-[#eeeee6] transition-all duration-200 shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0d100e] border border-[#343d34] flex items-center justify-center text-[#d4c19a]">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#eeeee6] leading-snug">
                      কাছের সেবা খুঁজি
                    </h3>
                    <p className="text-[11px] text-[#a7b0a8]">
                      দরকারি জায়গা সহজে খুঁজুন
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#a7b0a8] group-hover:text-[#d4c19a] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Prototype Disclaimer Bar */}
            <p className="text-[11px] text-[#869288] pt-2">
              এটি নমুনা সাইট। অভিযোগ এই ব্রাউজারে থাকবে; সরকারি দপ্তরে যাবে না।
            </p>
          </div>
        </div>

        {/* Bottom Hero Control Bar */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#343d34]/40 bg-[#0d100e]/40 backdrop-blur-sm">
          {/* Satellite Map Quick Button */}
          <Link
            to="/map?layer=satellite"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#eeeee6] hover:text-[#d4c19a] transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#d4c19a]" />
            <span>স্যাটেলাইট মানচিত্র দেখি</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Carousel Slide Indicators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-mono">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative py-1 transition cursor-pointer ${
                    idx === currentSlide
                      ? 'text-[#eeeee6] font-bold'
                      : 'text-[#708379] hover:text-[#a7b0a8]'
                  }`}
                >
                  <span>{slide.bnNumber}</span>
                  {idx === currentSlide && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4c19a] rounded-full animate-in fade-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Image Credit */}
            <span className="text-[10px] text-[#708379] hidden md:inline">
              ভাবনা থেকে তৈরি শহরের ছবি
            </span>
          </div>
        </div>

        {/* Floating Help Button (Bottom Right) */}
        <Link
          to="/services"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#295e42] hover:bg-[#347955] text-[#eeeee6] text-xs font-bold shadow-2xl border border-[#4b9e78] transition active:scale-95 cursor-pointer"
          title="সহায়তা ও সেবা তথ্য"
        >
          <MessageCircle className="w-4 h-4 text-[#d4c19a]" />
          <span>সাহায্য</span>
        </Link>
      </section>

      {/* 2. QUICK INTAKE & COMPACT REPORT COMPOSER */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="civic-card-elevated rounded-2xl p-6 sm:p-8 border border-[#343d34] bg-[#151a16] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b221c] border border-[#343d34] text-[#d4c19a] text-[10px] font-mono tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#d4c19a]" />
                <span>AI-ASSISTED TRIAGE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#eeeee6] leading-tight">
                কী সমস্যা দেখছেন? সংক্ষেপে লিখুন
              </h2>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                আপনার এলাকার রাস্তা, ড্রেন, ময়লা বা সড়ক বাতির সমস্যা লিখুন। এআই স্বয়ংক্রিয়ভাবে সঠিক সিটি কর্পোরেশন দপ্তর ও ওয়ার্ড নির্ধারণ করে দেবে।
              </p>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleQuickSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={quickInput}
                    onChange={e => setQuickInput(e.target.value)}
                    placeholder="যেমন: মিরপুর ১০ নং গোলচত্বরে ড্রেন বন্ধ হয়ে প্রধান সড়কে নোংরা পানি জমেছে..."
                    className="w-full bg-[#0d100e] text-[#eeeee6] placeholder-[#708379] p-3.5 rounded-xl border border-[#343d34] focus:outline-none focus:border-[#d4c19a] text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#a7b0a8] mb-1 font-medium">ওয়ার্ড নির্বাচন:</label>
                    <select
                      value={quickWard}
                      onChange={e => setQuickWard(e.target.value)}
                      className="w-full bg-[#0d100e] text-[#eeeee6] p-2.5 rounded-xl border border-[#343d34] focus:outline-none focus:border-[#d4c19a] text-xs"
                    >
                      <option value="3">ওয়ার্ড ৩ (মিরপুর)</option>
                      <option value="12">ওয়ার্ড ১২ (ধানমন্ডি)</option>
                      <option value="8">ওয়ার্ড ৮ (গুলশান)</option>
                      <option value="19">ওয়ার্ড ১৯ (বনানী)</option>
                      <option value="1">ওয়ার্ড ১ (উত্তরা)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#a7b0a8] mb-1 font-medium">সমস্যার ধরন:</label>
                    <select
                      value={quickCategory}
                      onChange={e => setQuickCategory(e.target.value)}
                      className="w-full bg-[#0d100e] text-[#eeeee6] p-2.5 rounded-xl border border-[#343d34] focus:outline-none focus:border-[#d4c19a] text-xs"
                    >
                      <option value="drainage">ড্রেনেজ ও জলাবদ্ধতা</option>
                      <option value="waste">কঠিন বর্জ্য অপসারণ</option>
                      <option value="roads">সড়ক ও ফুটপাত সংস্কার</option>
                      <option value="streetlights">সড়ক বাতি মেরামত</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#d4c19a] hover:bg-[#ebd8b1] text-[#0d100e] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-95"
                    >
                      <span>রিপোর্ট শুরু করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCOPE & RELIABILITY METRICS STRIP */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {SCOPE_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="civic-card p-5 sm:p-6 rounded-2xl border border-[#343d34] bg-[#151a16] text-left hover:border-[#4b9e78] transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#d4c19a] font-mono tracking-tight mb-1">
                {metric.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#eeeee6]">
                {metric.labelBn}
              </div>
              <div className="text-[10px] sm:text-xs text-[#a7b0a8] font-mono mt-0.5">
                {metric.subBn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOUR ARCHITECTURAL PILLARS (Compound Case + Deterministic Routing) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4c19a]">
            CORE ARCHITECTURAL PILLARS · মূল ভিত্তি
          </span>
          <h2 className="text-2xl sm:text-4xl font-light text-[#eeeee6]">
            এক নাগরিক অভিযোগ · <strong className="font-extrabold text-[#d4c19a]">বহু বিভাগের সমন্বিত কাজ</strong>
          </h2>
          <p className="text-xs sm:text-sm text-[#a7b0a8] max-w-2xl">
            একই স্থানে ড্রেন আটকে রাস্তা ভাঙলে নাগরিককে তিন দপ্তরে ঘুরতে হবে না। একটি কেসের অধীনে বর্জ্য, ড্রেনেজ ও সড়ক বিভাগ ধাপে ধাপে কাজ সম্পন্ন করবে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#1b221c] border border-[#343d34] text-[#d4c19a] flex items-center justify-center font-mono font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">
              স্বয়ংক্রিয় দায়িত্ব বণ্টন ও কনফিডেন্স গেট
            </h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              নাগরিকের বিবরণ ও জিপিএস অবস্থান যাচাই করে সিটি কর্পোরেশনের নীতিমালা অনুযায়ী দায়িত্বপ্রাপ্ত দপ্তর নির্ধারণ। ৮০% কনফিডেন্সের নিচে নামলে সরাসরি মানবীয় পর্যালোচনায় প্রেরণ।
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#1b221c] border border-[#343d34] text-[#4b9e78] flex items-center justify-center font-mono font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">
              ধাপভিত্তিক টাস্ক সিকোয়েন্সিং (Waste &rarr; Drain &rarr; Road)
            </h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              বর্জ্য অপসারণ না করে ড্রেন পরিষ্কার করা যাবে না, এবং ড্রেন মেরামত না করে সড়ক সংস্কার অসম্ভব। সিস্টেম স্বয়ংক্রিয়ভাবে পূর্বশর্ত লক বজায় রাখে।
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#1b221c] border border-[#343d34] text-[#d8a155] flex items-center justify-center font-mono font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">
              প্রমাণ যাচাই ও নাগরিকের আপিল অধিকার
            </h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              কর্মকর্তা কাজের পূর্বের ও পরের ছবি আপলোড করবেন। সমাধান ঠিকমতো না হলে নাগরিক “কাজটি সমাধান হয়নি” বাটনে ক্লিক করে একই কেস পুনরায় চালু করতে পারবেন।
            </p>
          </div>
        </div>
      </section>

      {/* 5. LIVE INCIDENT RADAR & DIRECT MAP ACCESS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#343d34]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#d4c19a] uppercase">
              LIVE MONITORING
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#eeeee6]">
              লাইভ কেস রাডার ও গুগল ম্যাপ ভিউ
            </h2>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#295e42] hover:bg-[#347955] text-[#d4c19a] text-xs font-bold transition shadow cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>সম্পূর্ণ ম্যাপ ওপেন করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Live Cases Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECENT_LIVE_CASES.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedCase(item)}
              className="civic-card p-4 rounded-xl border border-[#343d34] bg-[#151a16] hover:border-[#d4c19a] transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#a7b0a8]">{item.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadgeClass(item.priority)}`}>
                  {item.priorityBn}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#eeeee6] line-clamp-2">
                {item.titleBn}
              </h4>
              <div className="text-[11px] text-[#a7b0a8] flex items-center justify-between pt-2 border-t border-[#343d34]/60">
                <span>{item.wardBn}</span>
                <span className="text-[#4b9e78] font-bold">{item.slaRemaining}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PLATFORM FACILITIES & CITIZEN ADVANTAGES (এই সাইটে নাগরিকের কী কী সুবিধা রয়েছে) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4c19a]">
            CITIZEN BENEFITS & FACILITIES · নাগরিক সুবিধা
          </span>
          <h2 className="text-2xl sm:text-4xl font-light text-[#eeeee6]">
            নাগরিক সাথী এআই প্ল্যাটফর্মের <strong className="font-extrabold text-[#d4c19a]">প্রধান সুবিধাসমূহ</strong>
          </h2>
          <p className="text-xs sm:text-sm text-[#a7b0a8] max-w-2xl leading-relaxed">
            সরকারি অফিসে দৌড়াদৌড়ি ও দীর্ঘসূত্রতা দূর করে আধুনিক কৃত্রিম বুদ্ধিমত্তা ও জবাবদিহিতামূলক প্রক্রিয়ায় নাগরিক সমস্যার দ্রুততম সমাধান।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Facility 1 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] hover:border-[#d4c19a] transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold">
              <Camera className="w-5 h-5 text-[#166534]" />
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">ছবি ও ভয়েস নোট দিয়ে সহজ রিপোর্ট</h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              মোবাইল ক্যামেরা দিয়ে ছবি তুলে অথবা সাধারণ বাংলায় ভয়েস রেকর্ড করে সমস্যা জানান। কোনো জটিল ফর্ম ফিলাপের ঝামেলা নেই।
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#d4c19a] flex items-center gap-1.5">
              <span>✓ ফটো ও অডিও সমর্থন</span>
            </div>
          </div>

          {/* Facility 2 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] hover:border-[#d4c19a] transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-[#166534]" />
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">এআই স্বয়ংক্রিয় বিভাগ ও ওয়ার্ড নির্ধারণ</h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              কোন দপ্তরে অভিযোগ দেবেন তা জানা নেই? এআই বিবরণ ও জিপিএস বিশ্লেষণ করে সরাসরি বর্জ্য, ড্রেনেজ বা সড়ক বিভাগে দায়িত্ব অর্পণ করে।
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#d4c19a] flex items-center gap-1.5">
              <span>✓ ৮০% নিশ্চয়তা কনফিডেন্স গেট</span>
            </div>
          </div>

          {/* Facility 3 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] hover:border-[#d4c19a] transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold">
              <Workflow className="w-5 h-5 text-[#166534]" />
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">বহু-বিভাগীয় সমন্বিত সমাধান</h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              একই স্থানে ড্রেন আটকে রাস্তা ভাঙলে পৃথক অভিযোগ নয়। এক কেসের অধীনেই বর্জ্য অপসারণ &rarr; ড্রেন মেরামত &rarr; রাস্তা সংস্কার পর্যায়ক্রমে শেষ হয়।
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#d4c19a] flex items-center gap-1.5">
              <span>✓ এক ফাইলে বহু দপ্তর সমন্বয়</span>
            </div>
          </div>

          {/* Facility 4 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] hover:border-[#d4c19a] transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#166534]" />
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">জরুরি এসএলএ গ্যারান্টি ও ট্র্যাকিং</h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              জরুরি জননিরাপত্তা ঝুঁকিতে ২ ঘণ্টার মধ্যে ফিল্ড রেসপন্স টিম উপস্থিত হয়। সাধারণ বর্জ্য ও ড্রেন পরিষ্কারে ২৪ থেকে ৪৮ ঘণ্টার সমাধান লক্ষ্যমাত্রা।
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#d4c19a] flex items-center gap-1.5">
              <span>✓ লাইভ কাউন্টডাউন ও এস্কেলেশন</span>
            </div>
          </div>

          {/* Facility 5 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] hover:border-[#d4c19a] transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#166534]" />
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">কাজের সত্যতা ও জিপিএস সমাধান প্রমাণ</h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              মাঠ কর্মকর্তা কাজের আগের ও পরের ছবি জিপিএস অবস্থানসহ আপলোড করতে বাধ্য। কোনো ভুয়া বা কাগুজে সমাধান দেখানো সম্ভব নয়।
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#d4c19a] flex items-center gap-1.5">
              <span>✓ Before & After ছবির প্রমাণ</span>
            </div>
          </div>

          {/* Facility 6 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] hover:border-[#d4c19a] transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold">
              <Repeat className="w-5 h-5 text-[#166534]" />
            </div>
            <h3 className="text-base font-bold text-[#eeeee6]">নাগরিকের আপত্তির পূর্ণ ক্ষমতা</h3>
            <p className="text-xs text-[#a7b0a8] leading-relaxed">
              কাজ ঠিকমতো না হলে নাগরিক “কাজটি সমাধান হয়নি” বাটনে ক্লিক করে আপত্তি দাখিল করতে পারেন। কেসটি তাৎক্ষণিকভাবে পুনরায় চালু হয়ে তদন্তে যায়।
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#d4c19a] flex items-center gap-1.5">
              <span>✓ ৭২ ঘণ্টার মধ্যে রিওপেন অধিকার</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS (৪ ধাপে নাগরিক সমস্যার দ্রুত সমাধান) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="civic-card-elevated p-8 sm:p-12 rounded-3xl border border-[#343d34] bg-[#151a16] shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4c19a]">
              STEP-BY-STEP PROCESS · প্রক্রিয়া
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#eeeee6]">
              ৪টি সহজ ধাপে আপনার সমস্যার সমাধান
            </h2>
            <p className="text-xs text-[#a7b0a8]">
              অভিযোগ দাখিল থেকে সমাধান প্রমাণ যাচাই পর্যন্ত সম্পূর্ণ প্রক্রিয়া ডিজিটাল ও স্বচ্ছ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#0d100e] border border-[#343d34] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#d4c19a] text-[#0d100e] font-bold text-xs flex items-center justify-center font-mono">
                ০১
              </span>
              <h4 className="text-sm font-bold text-[#eeeee6]">সমস্যা জানান</h4>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                মোবাইল দিয়ে ছবি তুলুন অথবা সংক্ষেপে বিবরণ লিখে নাগরিক পোর্টালে জমা দিন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d100e] border border-[#343d34] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#4b9e78] text-[#0d100e] font-bold text-xs flex items-center justify-center font-mono">
                ০২
              </span>
              <h4 className="text-sm font-bold text-[#eeeee6]">এআই ও ওয়ার্ড যাচাই</h4>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                এআই সংশ্লিষ্ট ওয়ার্ড ও বিভাগ নির্ধারণ করে। ওয়ার্ড ডেস্ক কর্মকর্তা অনুমোদন দিয়ে ফিল্ডে পাঠান।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d100e] border border-[#343d34] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#d8a155] text-[#0d100e] font-bold text-xs flex items-center justify-center font-mono">
                ০৩
              </span>
              <h4 className="text-sm font-bold text-[#eeeee6]">ফিল্ড টিম অ্যাকশন</h4>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                নির্দিষ্ট এসএলএ সময়সীমার মধ্যে মাঠ কর্মকর্তা সরেজমিনে গিয়ে সমস্যাটি সমাধান করেন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d100e] border border-[#343d34] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#39765e] text-[#0d100e] font-bold text-xs flex items-center justify-center font-mono">
                ০৪
              </span>
              <h4 className="text-sm font-bold text-[#eeeee6]">সমাধান প্রমাণ ও যাচাই</h4>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                কাজের ছবি দেখে নাগরিক সমাধান নিশ্চিত করবেন। সন্তুষ্ট না হলে আপত্তি জানানোর সুযোগ।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. VERIFIED CITIZEN SERVICES & OFFICIAL GUIDANCE (পৌর নাগরিক সেবা ও আবেদন গাইড) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#343d34]">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4c19a]">
              OFFICIAL SERVICE CHARTER · সেবা সহায়িকা
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#eeeee6]">
              সিটি কর্পোরেশনের সকল নাগরিক সেবাসমূহ
            </h2>
            <p className="text-xs text-[#a7b0a8]">
              ট্রেড লাইসেন্স, জন্ম নিবন্ধন, হোল্ডিং ট্যাক্স সহ সকল সেবার সরকারি ফি ও প্রয়োজনীয় নথিপত্র
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#295e42] hover:bg-[#347955] text-[#d4c19a] text-xs font-bold transition shadow cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span>সকল সেবা ও ফি তালিকা দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service 1 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#d4c19a] bg-[#1b221c] px-2 py-0.5 rounded border border-[#343d34]">
                TRD-01 · ব্যবসা ও বাণিজ্য
              </span>
              <h3 className="text-base font-bold text-[#eeeee6]">ই-ট্রেড লাইসেন্স ইস্যু ও নবায়ন</h3>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                দোকান বা ব্যবসা প্রতিষ্ঠানের নতুন ডিজিটাল ট্রেড লাইসেন্স গ্রহণ ও বাৎসরিক নবায়ন আবেদন।
              </p>
              <div className="p-3 rounded-xl bg-[#0d100e] border border-[#242c24] text-[11px] space-y-1">
                <div className="flex justify-between"><span className="text-[#a7b0a8]">সরকারি ফি:</span> <strong className="text-[#d4c19a]">৳ ৫০০ - ৫,০০০</strong></div>
                <div className="flex justify-between"><span className="text-[#a7b0a8]">সময়সীমা:</span> <strong className="text-[#eeeee6]">৩-৫ কর্মদিবস</strong></div>
              </div>
            </div>
            <Link
              to="/services/srv_01"
              className="inline-flex items-center justify-between text-xs font-bold text-[#4b9e78] hover:text-[#d4c19a] pt-3 border-t border-[#343d34] transition"
            >
              <span>প্রয়োজনীয় কাগজপত্র ও প্রস্তুতি</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Service 2 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#4b9e78] bg-[#1c2b20] px-2 py-0.5 rounded border border-[#295e42]">
                BRG-02 · নাগরিক সনদ
              </span>
              <h3 className="text-base font-bold text-[#eeeee6]">অনলাইন জন্ম নিবন্ধন ও সংশোধন</h3>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                নবজাতকের জন্ম নিবন্ধন, বয়স বা নামের ভুল সংশোধন এবং ১৭ ডিজিটের অনলাইন ডিজিটাল সনদ গ্রহণ।
              </p>
              <div className="p-3 rounded-xl bg-[#0d100e] border border-[#242c24] text-[11px] space-y-1">
                <div className="flex justify-between"><span className="text-[#a7b0a8]">সরকারি ফি:</span> <strong className="text-[#4b9e78]">বিনামূল্যে / ৳ ৫০-১০০</strong></div>
                <div className="flex justify-between"><span className="text-[#a7b0a8]">অনলাইন পোর্টাল:</span> <strong className="text-[#eeeee6]">BDRIS Gov</strong></div>
              </div>
            </div>
            <Link
              to="/services/srv_02"
              className="inline-flex items-center justify-between text-xs font-bold text-[#4b9e78] hover:text-[#d4c19a] pt-3 border-t border-[#343d34] transition"
            >
              <span>প্রয়োজনীয় কাগজপত্র ও প্রস্তুতি</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Service 3 */}
          <div className="civic-card p-6 rounded-2xl border border-[#343d34] bg-[#151a16] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#d8a155] bg-[#373224] px-2 py-0.5 rounded border border-[#6b5c3e]">
                HLD-03 · কর ও রাজস্ব
              </span>
              <h3 className="text-base font-bold text-[#eeeee6]">হোল্ডিং ট্যাক্স ও অনলাইন ই-পেমেন্ট</h3>
              <p className="text-xs text-[#a7b0a8] leading-relaxed">
                সিটি কর্পোরেশনের বাড়ি বা ফ্ল্যাটের বাৎসরিক পৌর কর অ্যাসেসমেন্ট এবং বিকাশ/কার্ডে সরাসরি পরিশোধ।
              </p>
              <div className="p-3 rounded-xl bg-[#0d100e] border border-[#242c24] text-[11px] space-y-1">
                <div className="flex justify-between"><span className="text-[#a7b0a8]">সরকারি ফি:</span> <strong className="text-[#d4c19a]">১২% বার্ষিক মূল্যায়ন</strong></div>
                <div className="flex justify-between"><span className="text-[#a7b0a8]">পেমেন্ট মাধ্যম:</span> <strong className="text-[#eeeee6]">বিকাশ / নগদ / কার্ড</strong></div>
              </div>
            </div>
            <Link
              to="/services/srv_03"
              className="inline-flex items-center justify-between text-xs font-bold text-[#4b9e78] hover:text-[#d4c19a] pt-3 border-t border-[#343d34] transition"
            >
              <span>প্রয়োজনীয় কাগজপত্র ও প্রস্তুতি</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CITIZEN ACTION CALLOUT (নাগরিক আহ্বান) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#184d3f] to-[#123e27] border border-[#295e42] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-2xl text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4c19a] font-bold">
              START RIGHT NOW · আজই অংশ নিন
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              আপনার এলাকার সমস্যা সমাধান করুন সহজে
            </h3>
            <p className="text-xs sm:text-sm text-[#cbd5cc] leading-relaxed">
              রাস্তা ভাঙা, ড্রেনে জলাবদ্ধতা কিংবা সড়ক বাতি নষ্ট? এখনই নাগরিক সাথী এআই-তে রিপোর্ট করুন এবং লাইভ অগ্রগতি পর্যবেক্ষণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to={isAuthenticated ? '/report' : '/login/citizen'}
              state={!isAuthenticated ? { from: { pathname: '/report' } } : undefined}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d4c19a] hover:bg-[#ebd8b1] text-[#0d100e] text-xs sm:text-sm font-extrabold shadow-lg transition active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>সমস্যা রিপোর্ট করুন</span>
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0d100e]/40 hover:bg-[#0d100e]/60 text-white border border-[#343d34] text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer"
            >
              <span>সেবা নির্দেশিকা দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
