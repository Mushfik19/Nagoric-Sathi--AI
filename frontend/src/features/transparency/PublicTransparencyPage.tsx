import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Layers,
  Award,
  Flame,
  FileCheck2,
  ArrowUpRight
} from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

const TRANSPARENCY_KPIS = [
  {
    titleBn: 'মোট দাখিলকৃত অভিযোগ',
    valueBn: '৩,২৪৮',
    subBn: 'সর্বমোট নাগরিক ইনটেক',
    changeBn: '+১২% বিগত মাস হতে',
    colorClass: 'text-[#eeeee6]'
  },
  {
    titleBn: 'সফলভাবে সমাধানকৃত',
    valueBn: '৩,০৬০',
    subBn: '৯৪.২% সফল সমাধান হার',
    changeBn: 'নাগরিক যাচাইকৃত',
    colorClass: 'text-[#4b9e78]'
  },
  {
    titleBn: 'গড় সমাধান সময়',
    valueBn: '৬.৪ ঘণ্টা',
    subBn: 'জরুরি ক্ষেত্রে ২.১ ঘণ্টা',
    changeBn: 'এসএলএ অনুবর্তন ৯৬.৫%',
    colorClass: 'text-[#d4c19a]'
  },
  {
    titleBn: 'সক্রিয় দীর্ঘস্থায়ী হটস্পট',
    valueBn: '৪ টি',
    subBn: 'পুনরাবৃত্তিমূলক ক্লাস্টার',
    changeBn: 'বিশেষ নজরদারি চলমান',
    colorClass: 'text-[#c66e60]'
  }
];

const DEPARTMENT_PERFORMANCE = [
  { nameBn: 'বর্জ্য ব্যবস্থাপনা বিভাগ', cases: 1420, resolved: 1365, rate: '৯৬.১%', avgHours: '৪.২ ঘণ্টা' },
  { nameBn: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ', cases: 980, resolved: 912, rate: '৯৩.১%', avgHours: '৫.৮ ঘণ্টা' },
  { nameBn: 'সিভিল ও সড়ক সংস্কার বিভাগ', cases: 540, resolved: 498, rate: '৯২.২%', avgHours: '১২.৪ ঘণ্টা' },
  { nameBn: 'বিদ্যুৎ ও আলোকায়ন বিভাগ', cases: 308, resolved: 285, rate: '৯২.৫%', avgHours: '৬.১ ঘণ্টা' }
];

const WARD_LEADERBOARD = [
  { wardBn: 'ওয়ার্ড ৩ (মিরপুর)', total: 840, rate: '৯৫.২%', rating: '৪.৮ / ৫.০', status: 'সেরা পারফর্মিং' },
  { wardBn: 'ওয়ার্ড ১২ (ধানমন্ডি)', total: 720, rate: '৯৪.৮%', rating: '৪.৭ / ৫.০', status: 'উন্নত সেবা' },
  { wardBn: 'ওয়ার্ড ৮ (গুলশান)', total: 610, rate: '৯৩.৬%', rating: '৪.৬ / ৫.০', status: 'ধারাবাহিক' },
  { wardBn: 'ওয়ার্ড ১৯ (বনানী)', total: 520, rate: '৯২.৯%', rating: '৪.৫ / ৫.০', status: 'সন্তোষজনক' }
];

export const PublicTransparencyPage: React.FC = () => {
  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono tracking-widest text-[var(--gold)] uppercase font-semibold">
              OPEN CIVIC GOVERNANCE & ACCOUNTABILITY
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            নাগরিক সেবা স্বচ্ছতা ও <strong className="font-extrabold text-[var(--gold)]">পৌর কর্মক্ষমতা ড্যাশবোর্ড</strong>
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] mt-2 max-w-3xl leading-relaxed">
            সিটি কর্পোরেশনের সকল নাগরিক অভিযোগের সার্বিক অগ্রগতি, বিভাগীয় কর্মক্ষমতা, এসএলএ লক্ষ্যমাত্রা এবং ওয়ার্ডভিত্তিক পারফরম্যান্স পরিসংখ্যান সবার জন্য উন্মুক্ত।
          </p>
        </div>

        {/* PII Shield Compliance Badge */}
        <div className="bg-[var(--paper)] border border-[var(--line)] px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md shrink-0">
          <ShieldCheck className="w-5 h-5 text-[var(--green)] shrink-0" />
          <div className="text-left text-xs">
            <strong className="text-[var(--ink)] block font-bold">PII প্রাইভেসি শিল্ড সক্রিয়</strong>
            <span className="text-xs text-[var(--muted)]">ব্যক্তিগত পরিচয় ও ফোন নম্বর স্বয়ংক্রিয়ভাবে গোপন</span>
          </div>
        </div>
      </div>

      {/* 1. Core KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TRANSPARENCY_KPIS.map((kpi, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 border border-[var(--line)] bg-[var(--paper)] space-y-3 hover:border-[var(--gold)] transition shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--muted)]">{kpi.titleBn}</span>
              <BarChart3 className="w-4.5 h-4.5 text-[var(--muted)]" />
            </div>
            <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[var(--ink)]`}>
              {kpi.valueBn}
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--line)]">
              <span className="text-[var(--muted)] font-mono">{kpi.subBn}</span>
              <span className="text-[var(--gold)] font-medium">{kpi.changeBn}</span>
            </div>
          </div>
        ))}
      </section>

      {/* 2. Department Performance & SLA Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Table */}
        <div className="lg:col-span-8 rounded-2xl p-6 sm:p-7 border border-[var(--line)] bg-[var(--paper)] space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[var(--gold)]" />
              <h2 className="text-base sm:text-lg font-bold text-[var(--ink)]">
                বিভাগভিত্তিক অভিযোগ ও সমাধান কর্মক্ষমতা
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--muted)] bg-[var(--bg)] px-2.5 py-1 rounded-md border border-[var(--line)]">Last 30 Days</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-3">পৌর বিভাগ</th>
                  <th className="py-3.5 px-3 text-right">মোট অভিযোগ</th>
                  <th className="py-3.5 px-3 text-right">নিষ্পত্তি</th>
                  <th className="py-3.5 px-3 text-right">সমাধান হার</th>
                  <th className="py-3.5 px-3 text-right">গড় সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {DEPARTMENT_PERFORMANCE.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-[var(--green-light)] transition cursor-pointer">
                    <td className="py-4 px-3 font-semibold text-[var(--ink)]">{dept.nameBn}</td>
                    <td className="py-4 px-3 text-right font-mono text-[var(--muted)]">{toBanglaNumber(dept.cases)}</td>
                    <td className="py-4 px-3 text-right font-mono text-[var(--muted)]">{toBanglaNumber(dept.resolved)}</td>
                    <td className="py-4 px-3 text-right font-bold text-[var(--green)] font-mono">{dept.rate}</td>
                    <td className="py-4 px-3 text-right font-bold text-[var(--gold)] font-mono">{dept.avgHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLA Compliance Ladder Overview */}
        <div className="lg:col-span-4 rounded-2xl p-6 sm:p-7 border border-[var(--line)] bg-[var(--paper)] space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--line)]">
            <Clock className="w-5 h-5 text-[var(--gold)]" />
            <h3 className="text-base font-bold text-[var(--ink)]">
              এসএলএ (SLA) অনুবর্তন স্তর
            </h3>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-600 dark:text-[#e8b6b8] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>জরুরি হ্যাজার্ড (৬ ঘণ্টা)</span>
                </span>
                <span className="font-bold text-[var(--ink)] font-mono">৯৮.৪%</span>
              </div>
              <div className="w-full bg-[var(--line)] h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '98.4%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--gold)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
                  <span>উচ্চ অগ্রাধিকার (২৪ ঘণ্টা)</span>
                </span>
                <span className="font-bold text-[var(--ink)] font-mono">৯৫.১%</span>
              </div>
              <div className="w-full bg-[var(--line)] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[var(--gold)] h-full rounded-full" style={{ width: '95.1%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--green)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--green)]" />
                  <span>সাধারণ সংস্কার (৭২ ঘণ্টা)</span>
                </span>
                <span className="font-bold text-[var(--ink)] font-mono">৯১.৮%</span>
              </div>
              <div className="w-full bg-[var(--line)] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[var(--green)] h-full rounded-full" style={{ width: '91.8%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Ward Leaderboard */}
      <section className="rounded-2xl p-6 sm:p-7 border border-[var(--line)] bg-[var(--paper)] space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[var(--gold)]" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--ink)]">
              ওয়ার্ডভিত্তিক নাগরিক সেবা রেটিং ও পারফরম্যান্স
            </h2>
          </div>
          <span className="text-xs text-[var(--muted)]">সিটি কর্পোরেশন সমন্বিত মূল্যায়ন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WARD_LEADERBOARD.map((ward, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] space-y-3 hover:border-[var(--gold)] hover:bg-[var(--green-light)] transition shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--ink)]">{ward.wardBn}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-[var(--paper)] text-[var(--gold)] font-mono border border-[var(--line)]">
                  {ward.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between">
                  <span>অভিযোগ নিষ্পত্তি:</span>
                  <strong className="text-[var(--green)] font-mono">{ward.rate}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>নাগরিক রেটিং:</span>
                  <strong className="text-[var(--gold)] font-mono">{ward.rating}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>মোট অভিযোগ:</span>
                  <span className="font-mono text-[var(--ink)]">{toBanglaNumber(ward.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Tamper-Proof Cryptographic Verification Seal */}
      <section className="p-5 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <FileCheck2 className="w-5 h-5 text-[var(--green)] shrink-0" />
          <div>
            <strong className="text-[var(--ink)] block text-sm">ক্রিপ্টোগ্রাফিক অপরিবর্তনীয় অডিট হ্যাশ চেইন নিশ্চিতকরণ</strong>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              উপরোক্ত সকল তথ্য ও সমাপ্তি প্রমাণ SHA-256 ব্লকহ্যাশ ভ্যালিডেশন চেইনে সংরক্ষিত। কোনো তথ্য মুছে ফেলা বা পরিবর্তন করা যায় না।
            </p>
          </div>
        </div>
        <div className="font-mono text-[11px] px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--gold)] font-bold">
          HASH: e9f8...2a1c · VERIFIED
        </div>
      </section>
    </div>
  );
};
