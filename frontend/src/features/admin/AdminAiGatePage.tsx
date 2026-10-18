import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiGateService } from '../../services/aiGateService';
import { AiGateConfiguration } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Save, History } from 'lucide-react';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';

export const AdminAiGatePage: React.FC = () => {
  const [config, setConfig] = useState<AiGateConfiguration | null>(null);
  const { currentUser } = useAuth();
  const { showSuccess } = useToast();
  const [threshold, setThreshold] = useState<number>(80);
  const [emergencyVerify, setEmergencyVerify] = useState<boolean>(true);
  const [multiDeptVerify, setMultiDeptVerify] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    aiGateService.getConfig().then(data => {
      setConfig(data);
      setThreshold(data.confidenceThresholdPercent);
      setEmergencyVerify(data.alwaysRequireHumanVerificationOnEmergency);
      setMultiDeptVerify(data.alwaysRequireHumanVerificationOnMultiDept);
    });
  }, []);

  if (!config) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated: AiGateConfiguration = {
      ...config,
      confidenceThresholdPercent: threshold,
      alwaysRequireHumanVerificationOnEmergency: emergencyVerify,
      alwaysRequireHumanVerificationOnMultiDept: multiDeptVerify,
      version: `v2.${Date.now().toString().slice(-3)}`
    };
    await aiGateService.updateConfig(updated, currentUser.name);
    setConfig(updated);
    setIsSaving(false);
    showSuccess('এআই রাউটিং গেট কনফিগারেশন সংরক্ষিত ও অডিটে লিপিবদ্ধ হয়েছে');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--paper)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              M4/M10 এআই গভর্ন্যান্স
            </span>
            <span className="text-xs text-[var(--muted)]">স্বয়ংক্রিয় দায়িত্ব কাট-অফ ও সেফটি গেট</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
            এআই রাউটিং গেট কনফিগারেশন (AI Routing Gate Policy)
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            স্বয়ংক্রিয় দায়িত্ব প্রস্তাবনা এবং মানব যাচাইয়ের জন্য কনফিডেন্স কাট-অফ থ্রেশহোল্ড নির্ধারণ করুন
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

      {/* Critical Warning Notice */}
      <div className="civic-card rounded-xl p-4 bg-[var(--status-high-bg)] border border-[var(--status-high-border)] flex items-start gap-3 text-xs text-[var(--ink)]">
        <AlertTriangle className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-sm text-[var(--gold)]">গুরুত্বপূর্ণ গভর্ন্যান্স সতর্কবার্তা:</strong>
          <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
            এই থ্রেশহোল্ড পরিবর্তন করলে পুরো সিটি কর্পোরেশনের দায়িত্ব রাউটিং প্রভাবিত হবে। থ্রেশহোল্ডের নিচে থাকা প্রতিটি কেস স্বয়ংক্রিয়ভাবে ওয়ার্ড ডেস্কের মানব যাচাইয়ে পাঠানো হবে।
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="civic-card rounded-xl p-6 space-y-6">
        {/* Confidence Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--ink)]">
              এআই রাউটিং কনফিডেন্স কাট-অফ গেট (Confidence Threshold):
            </label>
            <span className="text-lg font-bold font-mono text-[var(--green)] bg-[var(--green-light)] px-3 py-1 rounded-lg border border-[var(--green)]/30">
              {toBanglaNumber(threshold)}%
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={95}
            step={1}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-[var(--paper-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--green)]"
          />

          <div className="flex justify-between text-[11px] text-[var(--muted)] font-mono">
            <span>৫০% (অধিক স্বয়ংক্রিয়)</span>
            <span className="text-[var(--gold)] font-bold font-bangla">স্ট্যান্ডার্ড সুপারিশ: ৮০%</span>
            <span>৯৫% (কঠোর মানব যাচাই)</span>
          </div>
        </div>

        {/* Critical Flags */}
        <div className="pt-4 border-t border-[var(--line)] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
            ক্রিটিক্যাল ফ্ল্যাগ ও সুরক্ষা পলিসি (Safety Fallbacks)
          </h3>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--paper-elevated)] cursor-pointer">
            <input
              type="checkbox"
              checked={emergencyVerify}
              onChange={e => setEmergencyVerify(e.target.checked)}
              className="mt-0.5 rounded text-[var(--green)] focus:ring-[var(--green)]"
            />
            <div className="text-xs">
              <strong className="text-[var(--ink)] block">জরুরি (Emergency) কেসে সর্বদা মানব যাচাই আবশ্যক</strong>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                কনফিডেন্স যত বেশিই হোক না কেন, জীবনের ঝুঁকি থাকলে ওয়ার্ড ডেস্ক বা কমান্ড অফিসার নিশ্চিত করবেন।
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--paper-elevated)] cursor-pointer">
            <input
              type="checkbox"
              checked={multiDeptVerify}
              onChange={e => setMultiDeptVerify(e.target.checked)}
              className="mt-0.5 rounded text-[var(--green)] focus:ring-[var(--green)]"
            />
            <div className="text-xs">
              <strong className="text-[var(--ink)] block">বহু-বিভাগীয় কেসে সমন্বয়কের সিকোয়েন্স অনুমোদন বাধ্যতামূলক</strong>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                একাধিক বিভাগের ডিপেন্ডেন্সি থাকলে সমন্বয়ক অনুমোদন ব্যতীত কাজ শুরু হবে না।
              </p>
            </div>
          </label>
        </div>

        {/* Version History Meta */}
        <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs flex flex-wrap items-center justify-between gap-2 text-[var(--muted)]">
          <div>
            <span>বর্তমান সক্রিয় সংস্করণ:</span>
            <strong className="text-[var(--gold)] ml-1 font-mono">{config.version}</strong>
          </div>
          <div>
            <span>সর্বশেষ পরিবর্তন:</span>
            <span className="text-[var(--ink)] ml-1 font-medium">{formatBanglaDate(config.updatedAt)}</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--green)] hover:opacity-90 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'গেটিং পলিসি সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
