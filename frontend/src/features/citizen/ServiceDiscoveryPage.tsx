import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceKnowledgeService } from '../../services/serviceKnowledgeService';
import { VerifiedServiceKnowledge } from '../../types';
import { BookOpen, Search, CheckCircle2, ArrowRight, ShieldCheck, FileCheck2, ExternalLink, Sparkles } from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

export const ServiceDiscoveryPage: React.FC = () => {
  const [services, setServices] = useState<VerifiedServiceKnowledge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    serviceKnowledgeService.getAllServices().then(setServices);
  }, []);

  const handleAskSathiForService = (service: VerifiedServiceKnowledge) => {
    window.dispatchEvent(
      new CustomEvent('open-ask-sathi', {
        detail: {
          service,
          type: 'service'
        }
      })
    );
  };

  const handleAskSathiForChecklist = () => {
    window.dispatchEvent(
      new CustomEvent('open-ask-sathi', {
        detail: {
          type: 'checklist'
        }
      })
    );
  };

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = services.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Title & Official Verification Stamp */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <div className="inline-flex items-center gap-2 text-[#166534] text-xs font-semibold bg-[#eaf5ed] px-3 py-1 rounded-full border border-[#bbf7d0] mb-2">
            <ShieldCheck className="w-4 h-4 text-[#166534]" />
            সিটি কর্পোরেশন কর্তৃক সরকারিভাবে যাচাইকৃত নাগরিক নলেজবেস
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            নাগরিক সেবা ও <strong className="font-extrabold text-[#166534]">আবেদন প্রস্তুতি নির্দেশিকা</strong>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 max-w-3xl">
            ট্রেড লাইসেন্স, জন্ম নিবন্ধন, হোল্ডিং ট্যাক্সসহ সকল সরকারি সেবার প্রয়োজনীয় কাগজপত্র, অফিসিয়াল ফি এবং ডিজিটাল আবেদন ধাপসমূহ
          </p>
        </div>

        {/* Quick Hotline Badge */}
        <div className="flex items-center gap-3 bg-[var(--paper)] p-3 rounded-2xl border border-[var(--line)] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] flex items-center justify-center text-[#166534] font-bold">
            ১৬
          </div>
          <div className="text-xs">
            <span className="text-[var(--muted)] block">পৌর সহায়তা হেল্পলাইন</span>
            <span className="font-bold text-sm text-[var(--ink)]">১৬১০৬ (টোল-ফ্রি)</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="rounded-2xl p-5 flex flex-col lg:flex-row items-center gap-4 bg-[var(--paper)] border border-[var(--line)] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4.5 h-4.5 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="সেবার নাম (যেমন: ট্রেড লাইসেন্স, জন্ম নিবন্ধন, ট্যাক্স) বা বিভাগ দিয়ে খুঁজুন..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--muted)] rounded-xl border border-[var(--line)] focus:outline-none focus:border-[#166534] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#166534] text-white border border-[#166534] shadow-xs'
                  : 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] hover:border-[#166534] hover:text-[#166534]'
              }`}
            >
              {cat === 'all' ? `সকল সেবা (${toBanglaNumber(services.length)})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid & Companion Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="rounded-2xl p-6 flex flex-col justify-between group bg-[var(--paper)] border border-[var(--line)] hover:border-[#166534] hover:shadow-md transition duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--bg)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
                  {service.code}
                </span>
                <span className="text-xs text-[#166534] font-semibold bg-[#eaf5ed] px-2.5 py-1 rounded-lg border border-[#bbf7d0] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                  যাচাইকৃত তথ্য
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--ink)] group-hover:text-[#166534] transition leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{service.titleEn}</p>
              </div>

              <p className="text-xs text-[var(--muted)]">
                লক্ষ্যদল: <strong className="text-[var(--ink)]">{service.targetCitizens}</strong>
              </p>

              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">প্রয়োজনীয় ডকুমেন্ট:</span>
                  <span className="font-bold text-[var(--ink)]">
                    {toBanglaNumber(service.requiredDocuments.length)}টি (বাধ্যতামূলক {toBanglaNumber(service.requiredDocuments.filter(d => d.mandatory).length)}টি)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">অফিসিয়াল ফি:</span>
                  <span className="font-bold text-[#8c6820]">{service.officialFee}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[var(--muted)]">
                শাখা: <span className="font-medium text-[var(--ink)]">{service.department}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAskSathiForService(service)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg)] hover:bg-[#eaf5ed] text-[var(--ink)] hover:text-[#166534] border border-[var(--line)] hover:border-[#166534] text-xs font-semibold transition cursor-pointer shadow-2xs"
                  title="এই সেবার জন্য এআই সহায়তা"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
                  <span>সহায়তা চান</span>
                </button>

                <Link
                  to={`/services/${service.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eaf5ed] hover:bg-[#166534] text-[#166534] hover:text-white border border-[#bbf7d0] text-xs font-bold transition shadow-2xs"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>প্রস্তুতি ও আবেদন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* When filtered down to 1 or 2 items, show helpful citizen guidance card to keep screen beautifully balanced */}
        {filteredServices.length <= 2 && (
          <div className="rounded-2xl p-6 bg-[#f0fdf4] border border-[#bbf7d0] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#166534] bg-[var(--paper)] px-3 py-1 rounded-full border border-[#bbf7d0]">
                <BookOpen className="w-4 h-4 text-[#166534]" />
                আবেদনের সাধারণ নিয়মাবলী
              </div>
              <h3 className="text-base font-bold text-[var(--ink)] leading-snug">
                কাগজপত্র জমা দেওয়ার পূর্বে করণীয় চেকলিস্ট
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                সরকারি সেবায় আবেদন সফলভাবে সম্পন্ন করার জন্য মূল কাগজপত্রের স্পষ্ট স্ক্যান কপি অথবা ডিজিটাল ফটোকপি সংগ্রহে রাখুন।
              </p>
              <ul className="text-xs text-[var(--ink)] space-y-1.5 list-disc pl-4">
                <li>জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন জন্ম নিবন্ধন সনদ</li>
                <li>হালনাগাদ হোল্ডিং ট্যাক্স বা ভাড়ার চুক্তিপত্রের কপি</li>
                <li>নির্দিষ্ট সাইজের পাসপোর্ট সাইজ ছবি (ডিজিটাল ফরম্যাট)</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-[#bbf7d0] flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">অনলাইন হেল্পডেস্ক উপলব্ধ</span>
              <button
                type="button"
                onClick={handleAskSathiForChecklist}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>সহায়তা চান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Banner */}
      <div className="rounded-2xl p-6 bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[var(--ink)]">যে কোনো নাগরিক সমস্যার দ্রুত সমাধানের নিশ্চয়তা</h4>
          <p className="text-xs text-[var(--muted)]">
            ড্রেনেজ, বর্জ্য ব্যবস্থাপনা, ভাঙা রাস্তা কিংবা সড়ক বাতির যে কোনো সমস্যার দ্রুত সমাধানে সরাসরি অভিযোগ দাখিল করুন
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs sm:text-sm font-bold transition shadow-xs whitespace-nowrap"
        >
          <span>সমস্যা রিপোর্ট করুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

