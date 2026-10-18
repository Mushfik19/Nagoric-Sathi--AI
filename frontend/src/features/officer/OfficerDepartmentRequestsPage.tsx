import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber } from '../../utils/formatters';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, Inbox, Sparkles, MapPin } from 'lucide-react';

export const OfficerDepartmentRequestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskForReject, setSelectedTaskForReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.tasks.getDepartmentRequests(currentUser?.departmentId);
      setRequests(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'দাপ্তরিক অনুরোধ তালিকা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser?.departmentId]);

  const handleAccept = async (taskId: string) => {
    try {
      await apiClient.tasks.accept(taskId);
      setActionSuccessMessage('টাস্কের দায়িত্ব সফলভাবে গৃহীত হয়েছে।');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'টাস্ক গ্রহণ করা সম্ভব হয়নি।');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForReject || !rejectionReason.trim()) return;

    try {
      await apiClient.tasks.reject(selectedTaskForReject.id, rejectionReason.trim());
      setSelectedTaskForReject(null);
      setRejectionReason('');
      setActionSuccessMessage('টাস্ক প্রত্যাখ্যান সম্পন্ন এবং পর্যালোচনার জন্য সমন্বয়কের নিকট প্রেরিত হয়েছে।');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'টাস্ক প্রত্যাখ্যান ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#343d34]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b221c] border border-[#343d34] text-[#d4c19a] text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#d4c19a]" />
            <span>{currentUser?.departmentName || 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#eeeee6] tracking-tight mt-2.5">
            আগত দাপ্তরিক কাজের অনুরোধ ও দায়িত্ব গ্রহণ
          </h1>
          <p className="text-sm text-[#a7b0a8] mt-1.5">
            এআই ও ওয়ার্ড সমন্বয়কারী কর্তৃক নির্ধারিত কাজের পর্যালোচনা ও আনুষ্ঠানিক স্বীকৃতি গেট।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/officer/tasks"
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] border border-[var(--line)] transition cursor-pointer shadow-sm"
          >
            আমার চলতি কাজ
          </Link>
          <Link
            to="/officer/assignment-queue"
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] border border-[var(--line)] transition cursor-pointer shadow-sm"
          >
            অপেক্ষারত কিউ
          </Link>
        </div>
      </div>

      {/* Action Success Notification */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-[#1c2b20] border border-[#295e42] text-[#a8e6cf] text-sm font-semibold flex items-center gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#4b9e78] shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-[#382326] border border-[#71434a] text-[#e8b6b8] text-sm font-semibold flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-[#e8b6b8] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Request Cards */}
      {loading ? (
        <div className="p-14 text-center text-[#a7b0a8] text-sm rounded-2xl bg-[#151a16] border border-[#343d34]">
          দাপ্তরিক অনুরোধ কিউ লোড হচ্ছে...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-14 text-center text-[#a7b0a8] rounded-2xl bg-[#151a16] border border-[#343d34] space-y-3.5">
          <Inbox className="w-14 h-14 text-[#4b9e78] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-[#eeeee6]">কোনো নতুন কাজের অনুরোধ অমীমাংসিত নেই</h3>
          <p className="text-sm text-[#a7b0a8]">এই মুহূর্তে আপনার দপ্তরের জন্য কোনো নতুন টাস্ক অপেক্ষারত নেই।</p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((req) => {
            const isAccepted = req.acceptance_status === 'accepted';
            const isRejected = req.acceptance_status === 'rejected';

            return (
              <div
                key={req.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#151a16] border border-[#343d34] hover:border-[#4b9e78]/80 transition-all shadow-xl space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#242c24]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#d4c19a] bg-[#0d100e] px-3 py-1 rounded-lg border border-[#343d34]">
                        #{req.case_id || req.id}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        req.priority === 'emergency' ? 'bg-[#382326] text-[#e8b6b8] border-[#71434a]' :
                        req.priority === 'high' ? 'bg-[#373224] text-[#d4c19a] border-[#6b5c3e]' :
                        'bg-[#1b221c] text-[#a7b0a8] border-[#343d34]'
                      }`}>
                        {req.priority === 'emergency' ? 'জরুরি (Emergency)' :
                         req.priority === 'high' ? 'উচ্চ অগ্রাধিকার' : 'সাধারণ'}
                      </span>
                      <span className="text-sm text-[#a7b0a8] flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-[#d4c19a]" />
                        <span>{req.ward_name_bn || 'ওয়ার্ড ৩'}</span>
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#eeeee6] leading-snug pt-1">
                      {req.title_bn}
                    </h3>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2.5 shrink-0">
                    <span className="text-sm text-[#4b9e78] font-bold flex items-center gap-1.5 font-mono">
                      <Clock className="w-4 h-4" />
                      <span>{req.sla_remaining_bn || 'এসএলএ বাকি'}</span>
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                      isAccepted ? 'bg-[#1c2b20] text-[#a8e6cf] border-[#295e42]' :
                      isRejected ? 'bg-[#382326] text-[#e8b6b8] border-[#71434a]' :
                      'bg-[#172535] text-[#93c5fd] border-[#1e3a5f]'
                    }`}>
                      {isAccepted ? '✓ গৃহীত (Accepted)' :
                       isRejected ? '✕ প্রত্যাখ্যাত' : 'পর্যালোচনা অপেক্ষারত'}
                    </span>
                  </div>
                </div>

                {/* AI Routing Rationale */}
                {req.ai_routing_rationale && (
                  <div className="p-4 rounded-xl bg-[#0d100e] border border-[#2e372e] text-sm text-[#c8d1c9] flex items-start gap-3">
                    <Sparkles className="w-4.5 h-4.5 text-[#d4c19a] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#eeeee6] block mb-1 text-sm font-semibold">এআই দায়িত্ব নির্ধারণ ও এখতিয়ার ব্যাখ্যা:</strong>
                      <span className="leading-relaxed">{req.ai_routing_rationale}</span>
                    </div>
                  </div>
                )}

                {/* Prerequisite status notice */}
                {req.prerequisite_note && (
                  <div className="p-4 rounded-xl bg-[#1b221c] border border-[#343d34] text-sm text-[#eeeee6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-[#4b9e78] shrink-0" />
                      <span className="leading-relaxed">{req.prerequisite_note}</span>
                    </div>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-md border shrink-0 ${
                      req.prerequisites_completed
                        ? 'bg-[#1c2b20] text-[#a8e6cf] border-[#295e42]'
                        : 'bg-[#373224] text-[#d4c19a] border-[#6b5c3e]'
                    }`}>
                      {req.prerequisites_completed ? 'পূর্বশর্ত প্রস্তুত' : 'অপেক্ষমাণ'}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#242c24]/50">
                  <div className="text-sm text-[#708379]">
                    দাখিল তারিখ: <span className="text-[#a7b0a8] font-mono">{req.created_at ? new Date(req.created_at).toLocaleDateString('bn-BD') : 'আজ'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isAccepted && !isRejected && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedTaskForReject(req)}
                          className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#e8b6b8] bg-[#382326] hover:bg-[#4d2f33] border border-[#71434a] transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>প্রত্যাখ্যান (Reject)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(req.id)}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#0d100e] bg-[#d4c19a] hover:bg-[#ebd8b1] shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>দায়িত্ব গ্রহণ করুন (Accept)</span>
                        </button>
                      </>
                    )}
                    <Link
                      to={`/officer/tasks/${req.id}`}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--green-light)] border border-[var(--line)] transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>বিস্তারিত</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mandatory Reason Rejection Modal */}
      {selectedTaskForReject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="civic-card-elevated rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-[#71434a] bg-[var(--paper)] shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-[var(--ink)]">
                  টাস্ক প্রত্যাখ্যানের কারণ প্রদান করুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForReject(null)}
                className="text-[var(--muted)] hover:text-[var(--ink)] p-1.5 cursor-pointer rounded-lg hover:bg-[var(--green-light)]"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#a7b0a8] leading-relaxed">
              সিটি কর্পোরেশন নীতিমালার অধীনে দাপ্তরিক প্রত্যাখ্যানের জন্য বাধ্যতামূলক কারণ উল্লেখ করা আবশ্যক। এটি কেস হিস্ট্রিতে অপরিবর্তনীয়ভাবে লিপিবদ্ধ থাকবে এবং সমন্বয়কের নিকট পর্যালোচনায় প্রেরিত হবে।
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#eeeee6] mb-2">
                  প্রত্যাখ্যানের কারণ (বাংলায় লিখুন):
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="যেমন: সড়কটি বর্তমানে অন্য সংস্থার খনন কাজের আওতাভুক্ত থাকায় ড্রেনেজ কাজ পরিচালনা সম্ভব হচ্ছে না..."
                  className="w-full bg-[#0d100e] text-[#eeeee6] placeholder-[#708379] p-3.5 rounded-xl border border-[#343d34] focus:outline-none focus:border-[#d4c19a] text-sm leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForReject(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#a7b0a8] hover:text-[#eeeee6] bg-[#0d100e] border border-[#343d34] transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!rejectionReason.trim()}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#e8b6b8] bg-[#382326] hover:bg-[#4d2f33] border border-[#71434a] transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  প্রত্যাখ্যান নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
