import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminSystemSettingsPage: React.FC = () => {
  const [cityName, setCityName] = useState('ঢাকা উত্তর সিটি কর্পোরেশন (DNCC)');
  const [smsGateway, setSmsGateway] = useState('Govt BD SMS Teletalk Gateway');
  const [gisLayer, setGisLayer] = useState('OpenStreetMap Standard Tile Layer');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              সিস্টেম কনফিগারেশন
            </span>
            <span className="text-xs text-[var(--muted)]">গেটওয়ে ও জিআইএস প্যারামিটার</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            সিস্টেম সেটিংস ও ইন্টিগ্রেশন (System Configuration)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            সিটি কর্পোরেশন তথ্য, গেটওয়ে ও জিআইএস প্যারামিটার সেটিংস
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--line)]/20 transition"
          >
            ← অ্যাডমিন কনসোলে ফিরুন
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="civic-card rounded-xl p-6 space-y-5 text-xs">
        <div>
          <label className="block font-bold text-[var(--ink)] mb-1.5">সিটি কর্পোরেশনের নাম ও শিরোনাম:</label>
          <input
            type="text"
            value={cityName}
            onChange={e => setCityName(e.target.value)}
            className="w-full p-2.5 bg-[var(--bg)] rounded-lg border border-[var(--line)] text-[var(--ink)] focus:outline-hidden focus:border-[var(--accent)] font-semibold"
          />
        </div>

        <div>
          <label className="block font-bold text-[var(--ink)] mb-1.5">এসএমএস গেটওয়ে সার্ভিস:</label>
          <input
            type="text"
            value={smsGateway}
            onChange={e => setSmsGateway(e.target.value)}
            className="w-full p-2.5 bg-[var(--bg)] rounded-lg border border-[var(--line)] text-[var(--ink)] focus:outline-hidden focus:border-[var(--accent)] font-mono"
          />
        </div>

        <div>
          <label className="block font-bold text-[var(--ink)] mb-1.5">জিআইএস মানচিত্র লেয়ার:</label>
          <input
            type="text"
            value={gisLayer}
            onChange={e => setGisLayer(e.target.value)}
            className="w-full p-2.5 bg-[var(--bg)] rounded-lg border border-[var(--line)] text-[var(--ink)] focus:outline-hidden focus:border-[var(--accent)] font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
          {isSaved ? (
            <span className="text-xs text-[var(--green)] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> সেটিংস সফলভাবে সংরক্ষিত হয়েছে
            </span>
          ) : <span />}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--green)] hover:opacity-90 text-white font-bold rounded-lg transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
};
