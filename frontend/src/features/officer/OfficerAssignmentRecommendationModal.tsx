import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { toBanglaNumber } from '../../utils/formatters';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Shield,
  Clock,
  MapPin,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface OfficerAssignmentRecommendationModalProps {
  taskId: string;
  taskTitle?: string;
  wardNumber?: number | string;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export const OfficerAssignmentRecommendationModal: React.FC<OfficerAssignmentRecommendationModalProps> = ({
  taskId,
  taskTitle,
  wardNumber,
  isOpen,
  onClose,
  onAssigned
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (isOpen && taskId) {
      loadRecommendations();
    }
  }, [isOpen, taskId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.tasks.getRecommendations(taskId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'সুপারিশ তালিকা লোড করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (officerId: string) => {
    try {
      setAssigningId(officerId);
      await apiClient.tasks.assign(taskId, officerId, 'manual', customNote || 'সুপারিশভিত্তিক কর্মকর্তা নির্ধারণ');
      onAssigned();
      onClose();
    } catch (err: any) {
      alert(err.message || 'অ্যাসাইনমেন্ট সম্পন্ন করা যায়নি।');
    } finally {
      setAssigningId(null);
    }
  };

  if (!isOpen) return null;

  const recommendations = data?.recommendations || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--paper)] text-[var(--ink)] rounded-2xl max-w-2xl w-full shadow-2xl border border-[var(--line)] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[var(--bg)] text-[var(--ink)] flex items-center justify-between border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--green-light)] text-[var(--green)] rounded-xl border border-[var(--line)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <span>এআই-সহায়তাপ্রাপ্ত কর্মকর্তা বরাদ্দ সুপারিশ</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[var(--paper)] text-[var(--gold)] border border-[var(--line)] font-semibold">
                  Explainable Model
                </span>
              </h2>
              <p className="text-sm text-[var(--muted)] mt-1">
                কাজের চাপ, ওয়ার্ড উপস্থিতি ও এসএলএ ঝুঁকিভিত্তিক স্বয়ংক্রিয় স্কোরিং
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--muted)] hover:text-[var(--ink)] rounded-xl hover:bg-[var(--green-light)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Context Strip */}
        <div className="px-6 py-3.5 bg-[var(--bg)] border-b border-[var(--line)] flex flex-wrap items-center justify-between text-sm gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--muted)]">টাস্ক:</span>
            <span className="font-semibold text-[var(--ink)] line-clamp-1">{taskTitle || taskId}</span>
          </div>
          {wardNumber && (
            <div className="flex items-center gap-1.5 text-[#a7b0a8]">
              <MapPin className="w-4 h-4 text-[#4b9e78]" />
              <span>ওয়ার্ড: <strong className="text-[#eeeee6] font-mono">{toBanglaNumber(wardNumber)}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Note Input */}
          <div>
            <label className="block text-sm font-semibold text-[#eeeee6] mb-2">
              অ্যাসাইনমেন্ট রেফারেন্স নোট (ঐচ্ছিক):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="যেমন: ওয়ার্ডের জরুরি কাজের জন্য বিশেষ বিবেচনায় বরাদ্দ..."
              className="w-full px-4 py-3 text-sm bg-[#0d100e] text-[#eeeee6] placeholder-[#708379] border border-[#343d34] rounded-xl focus:outline-none focus:border-[#d4c19a]"
            />
          </div>

          {/* Model Formula Explanation Box */}
          <div className="p-4 bg-[#1b221c] border border-[#343d34] rounded-xl text-sm text-[#a7b0a8] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#d4c19a]">
              <Cpu className="w-4.5 h-4.5 text-[#d4c19a]" />
              <span>বরাদ্দ স্কোরিং অ্যালগরিদম কাঠামো:</span>
            </div>
            <div className="font-mono text-xs text-[#eeeee6] bg-[#0d100e] p-3 rounded-lg border border-[#242c24]">
              Score = (0.45 × সক্ষমতা মার্জিন) + (0.35 × ওয়ার্ড মিল) + (0.20 × এসএলএ জরুরি স্কোর)
            </div>
          </div>

          {loading ? (
            <div className="py-14 text-center text-[#a7b0a8] space-y-3">
              <div className="w-9 h-9 border-2 border-[#d4c19a] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">উপযুক্ত ও উপলব্ধ কর্মকর্তা খোঁজা হচ্ছে...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-[#382326] border border-[#71434a] text-[#e8b6b8] rounded-xl text-sm flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-8 text-center bg-[#373224]/30 border border-[#6b5c3e] rounded-xl space-y-3.5">
              <AlertTriangle className="w-9 h-9 text-[#d4c19a] mx-auto" />
              <h3 className="text-base font-bold text-[#eeeee6]">
                বর্তমানে কোনো কর্মকর্তা দায়িত্ব গ্রহণের জন্য উপলব্ধ নেই
              </h3>
              <p className="text-sm text-[#a7b0a8] max-w-md mx-auto leading-relaxed">
                বিভাগের সকল কর্মকর্তার নির্ধারিত কাজের সক্ষমতা পূর্ণ রয়েছে অথবা তারা ছুটিতে আছেন।
                টাস্কটি অপেক্ষারত কিউতে (Waiting Queue) অন্তর্ভুক্ত থাকবে এবং কোনো কর্মকর্তা উপলব্ধ হওয়া মাত্র স্বয়ংক্রিয়ভাবে বরাদ্দ হবে।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#eeeee6] flex items-center justify-between">
                <span>উপযুক্ত কর্মকর্তা তালিকা ({toBanglaNumber(recommendations.length)} জন পাওয়া গেছে):</span>
                <span className="text-[#a7b0a8] text-xs font-normal">র‌্যাঙ্ক অনুযায়ী সাজানো</span>
              </div>

              {recommendations.map((rec: any, index: number) => {
                const scorePercent = Math.round(rec.score * 100);
                const isTopPick = index === 0;

                return (
                  <div
                    key={rec.officer_id}
                    className={`p-5 rounded-2xl border transition ${
                      isTopPick
                        ? 'border-[#4b9e78] bg-[#1b221c] shadow-lg'
                        : 'border-[#343d34] bg-[#151a16] hover:border-[#4b9e78]/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-bold text-base text-[#eeeee6]">
                            {rec.officer_name || `কর্মকর্তা #${rec.officer_id}`}
                          </span>
                          {isTopPick && (
                            <span className="text-xs font-bold bg-[#1c2b20] text-[#a8e6cf] px-2.5 py-0.5 rounded-full border border-[#295e42]">
                              শীর্ষ পছন্দ (#১)
                            </span>
                          )}
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#0d100e] text-[#d4c19a] border border-[#242c24]">
                            স্কোর: {toBanglaNumber(scorePercent)}%
                          </span>
                        </div>

                        {/* Capacity meter */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#a7b0a8]">
                          <span className="flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-[#4b9e78]" />
                            <span>চলতি কাজ: <strong className="text-[#eeeee6] font-mono">{toBanglaNumber(rec.active_tasks)}/{toBanglaNumber(rec.max_tasks)}</strong></span>
                          </span>
                          <span className="text-[#343d34]">|</span>
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-[#d4c19a]" />
                            <span>অবশিষ্ট সক্ষমতা: <strong className="text-[#eeeee6] font-mono">{toBanglaNumber(rec.capacity_margin)}</strong></span>
                          </span>
                          <span className="text-[#343d34]">|</span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${
                            rec.ward_match ? 'bg-[#1c2b20] text-[#4b9e78] border-[#295e42]' : 'bg-[#151a16] text-[#a7b0a8] border-[#343d34]'
                          }`}>
                            {rec.ward_match ? 'ওয়ার্ড কভারেজ মিল' : 'সাধারণ কভারেজ'}
                          </span>
                        </div>

                        {/* Explanation Reason */}
                        <p className="text-sm text-[#c8d1c9] bg-[#0d100e] p-3 rounded-xl border border-[#242c24] leading-relaxed">
                          {rec.reason_bn || 'উপযুক্ত কাজের চাপ ও সেবা এলাকার ভিত্তিতে প্রস্তাবিত।'}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleAssign(rec.officer_id)}
                        disabled={assigningId !== null}
                        className={`px-5 py-3 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md active:scale-95 ${
                          isTopPick
                            ? 'bg-[var(--green)] hover:bg-[var(--green-dark)] text-white'
                            : 'bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] border border-[var(--line)]'
                        }`}
                      >
                        {assigningId === rec.officer_id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#0d100e] border-t-transparent rounded-full animate-spin" />
                            <span>বরাদ্দ হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>কর্মকর্তা নির্ধারণ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0d100e] border-t border-[#343d34] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#a7b0a8] hover:text-[#eeeee6] bg-[#151a16] border border-[#343d34] hover:border-[#d4c19a] rounded-xl transition cursor-pointer"
          >
            বাতিল করুন
          </button>
        </div>
      </div>
    </div>
  );
};
