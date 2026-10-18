import React, { useEffect, useState } from 'react';
import { getStoredHotspots } from '../../services/storage';
import { HotspotZone } from '../../types';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { useCases } from '../../context/CaseContext';
import { toBanglaNumber } from '../../utils/formatters';
import { AlertTriangle, MapPin, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export const CoordinatorHotspotsPage: React.FC = () => {
  const [hotspots, setHotspots] = useState<HotspotZone[]>([]);
  const { cases } = useCases();

  useEffect(() => {
    setHotspots(getStoredHotspots());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M6 জিওস্পেশিয়াল অ্যানালিটিক্স
            </span>
            <span className="text-xs text-[var(--muted)]">পুনরাবৃত্ত ক্লাস্টার শনাক্তকরণ ও অবকাঠামো সমাধান</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            সিটি কর্পোরেশন পুনরাবৃত্ত হটস্পট মানচিত্র ও বিশ্লেষণ (Hotspot Analytics)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            যেসব অ্যাসেট ও অঞ্চলে বারবার নাগরিক সমস্যা তৈরি হচ্ছে তাদের ক্লাস্টার শনাক্তকরণ ও স্থায়ী সংস্কার প্রস্তাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)]">
            চিহ্নিত হটস্পট: <strong className="text-[var(--gold)]">{toBanglaNumber(hotspots.length)}টি অঞ্চল</strong>
          </span>
        </div>
      </div>

      {/* Geospatial Map with Hotspot Polygons */}
      <div className="rounded-xl overflow-hidden border border-[var(--line)] shadow-lg">
        <InteractiveMap cases={cases} hotspots={hotspots} height="440px" showHotspotsToggle={true} />
      </div>

      {/* Hotspots Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotspots.map(hs => (
          <div key={hs.id} className="civic-card rounded-xl p-5 space-y-3.5 border-[var(--line)] bg-[var(--paper)]">
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--gold)]" />
                <span className="font-bold text-[var(--ink)] text-sm">{hs.name}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[var(--status-high-bg)] text-[var(--gold)] border border-[var(--status-high-border)]">
                {toBanglaNumber(hs.incidentCount)}টি পুনরাবৃত্ত ঘটনা
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-[var(--muted)]">
              <div className="flex justify-between">
                <span>ওয়ার্ড:</span>
                <strong className="text-[var(--ink)]">{hs.wardName}</strong>
              </div>
              <div className="flex justify-between">
                <span>প্রভাবিত অ্যাসেট:</span>
                <strong className="text-[var(--green)]">{hs.recurrentAsset}</strong>
              </div>
            </div>

            {/* AI Suggestion Box */}
            <div className="p-3.5 rounded-xl bg-[var(--paper-elevated)] border border-[var(--line)] text-xs text-[var(--ink)]">
              <span className="flex items-center gap-1.5 font-bold text-[var(--gold)] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--green)]" />
                এআই দীর্ঘমেয়াদী সংস্কার সুপারিশ (AI Proposal):
              </span>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {hs.aiSuggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
