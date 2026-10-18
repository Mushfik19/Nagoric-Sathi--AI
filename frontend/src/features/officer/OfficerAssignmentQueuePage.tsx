import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber, formatBanglaDate, calculateSlaCountdown } from '../../utils/formatters';
import { OfficerAssignmentRecommendationModal } from './OfficerAssignmentRecommendationModal';
import {
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';

export const OfficerAssignmentQueuePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoDispatching, setAutoDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  // Recommendation modal state
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<{ id: string; title: string; ward?: number } | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.tasks.getWaitingQueue(currentUser?.departmentId);
      setQueueItems(data);
    } catch (err: any) {
      setError(err.message || 'অপেক্ষার কিউ লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [currentUser?.departmentId]);

  const handleAutoDispatch = async () => {
    try {
      setAutoDispatching(true);
      setDispatchResult(null);
      const res = await apiClient.tasks.autoDispatch(currentUser?.departmentId);
      setDispatchResult(res);
      await fetchQueue();
    } catch (err: any) {
      alert(err.message || 'স্বয়ংক্রিয় প্রেরণ প্রক্রিয়া ব্যর্থ হয়েছে।');
    } finally {
      setAutoDispatching(false);
    }
  };

  const activeQueue = queueItems.filter(item => item.status === 'queued' || item.status === 'blocked');

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#343d34]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-mono tracking-widest text-[#d4c19a] bg-[#1b221c] px-3.5 py-1 rounded-full border border-[#343d34] uppercase font-semibold">
              {currentUser?.departmentName || 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ'}
            </span>
            <span className="text-xs font-mono text-[#a7b0a8] bg-[#0d100e] px-2.5 py-1 rounded-md border border-[#343d34]">
              Persistent DB Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#eeeee6] tracking-tight">
            অ্যাসাইনমেন্ট অপেক্ষার কিউ (Task Assignment Waiting Queue)
          </h1>
          <p className="text-sm text-[#a7b0a8] mt-1.5">
            কর্মকর্তার প্রাপ্যতা ঘাটতি বা পূর্বশর্তের কারণে অপেক্ষারত কাজের শৃঙ্খলাবদ্ধ অগ্রাধিকার তালিকা।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutoDispatch}
            disabled={autoDispatching || activeQueue.length === 0}
            className="flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-xl bg-[#d4c19a] hover:bg-[#ebd8b1] text-[#0d100e] shadow-lg disabled:opacity-40 transition cursor-pointer active:scale-95"
          >
            <Zap className={`w-4.5 h-4.5 text-[#0d100e] ${autoDispatching ? 'animate-spin' : ''}`} />
            <span>{autoDispatching ? 'প্রেরণ চলছে...' : 'স্বয়ংক্রিয় প্রেরণ (Auto-Dispatch Now)'}</span>
          </button>
          <button
            type="button"
            onClick={fetchQueue}
            disabled={loading}
            className="p-3 text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] hover:bg-[var(--green-light)] rounded-xl transition cursor-pointer shadow-sm"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4.5 h-4.5 text-[var(--gold)] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Auto-Dispatch Feedback Alert */}
      {dispatchResult && (
        <div className="p-4 rounded-xl bg-[#1c2b20] border border-[#295e42] text-sm space-y-1.5 shadow-lg text-[#a8e6cf] animate-in fade-in">
          <div className="flex items-center gap-2.5 font-bold text-[#a8e6cf]">
            <CheckCircle2 className="w-5 h-5 text-[#4b9e78]" />
            <span>স্বয়ংক্রিয় প্রেরণ প্রক্রিয়াকরণ সম্পন্ন!</span>
          </div>
          <p className="text-[#a7b0a8] text-sm">
            {dispatchResult.message || 'যোগ্য কর্মকর্তাদের অনুকূলে স্বয়ংক্রিয়ভাবে টাস্ক প্রেরণ করা হয়েছে।'}
          </p>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-lg">
          <span className="text-sm font-bold text-[#a7b0a8]">সক্রিয় অপেক্ষারত (Queued)</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#d4c19a] mt-2">
            {toBanglaNumber(activeQueue.filter(i => i.status === 'queued').length)}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-lg">
          <span className="text-sm font-bold text-[#a7b0a8]">মোট কিউ হিস্ট্রি</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#eeeee6] mt-2">
            {toBanglaNumber(queueItems.length)}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-lg">
          <span className="text-sm font-bold text-[#a7b0a8]">পূর্বশর্তে অবরুদ্ধ</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#d8a155] mt-2">
            {toBanglaNumber(activeQueue.filter(i => i.status === 'blocked').length)}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-lg">
          <span className="text-sm font-bold text-[#a7b0a8]">সক্ষমতা ঘাটতিতে অপেক্ষমাণ</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#4b9e78] mt-2">
            {toBanglaNumber(activeQueue.filter(i => i.status === 'queued' && i.eligibility_state === 'ready').length)}
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-bold text-[#eeeee6] px-1">
          <span>অপেক্ষার ক্রম তালিকা (অগ্রাধিকার ও এসএলএ ঝুঁকি অনুযায়ী সাজানো):</span>
          <span className="text-[#d4c19a] font-mono">{toBanglaNumber(activeQueue.length)} টি টাস্ক অপেক্ষমাণ</span>
        </div>

        {loading ? (
          <div className="p-14 text-center text-[#a7b0a8] rounded-2xl bg-[#151a16] border border-[#343d34] space-y-3">
            <div className="w-9 h-9 border-2 border-[#d4c19a] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">কিউ তালিকা লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-[#382326] border border-[#71434a] text-[#e8b6b8] rounded-xl text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#e8b6b8] shrink-0" />
            <span>{error}</span>
          </div>
        ) : activeQueue.length === 0 ? (
          <div className="p-14 text-center text-[#a7b0a8] rounded-2xl bg-[#151a16] border border-[#343d34] space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#4b9e78] mx-auto opacity-75" />
            <h3 className="text-lg font-bold text-[#eeeee6]">বর্তমানে কোনো টাস্ক অপেক্ষার কিউতে নেই</h3>
            <p className="text-sm text-[#a7b0a8]">সকল অনুমোদিত কাজ যথাসময়ে উপযুক্ত কর্মকর্তার অনুকূলে বরাদ্দ রয়েছে।</p>
          </div>
        ) : (
          activeQueue.map((item, idx) => {
            const isPrereqBlocked = item.status === 'blocked';
            const isEmergency = item.priority === 'emergency';

            return (
              <div
                key={item.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#151a16] border border-[#343d34] hover:border-[#4b9e78]/80 transition shadow-xl space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242c24]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#0d100e] text-[#d4c19a] border border-[#343d34] font-mono text-sm font-bold flex items-center justify-center shrink-0">
                      {toBanglaNumber(idx + 1)}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#d4c19a] bg-[#0d100e] px-3 py-1 rounded-lg border border-[#343d34]">
                      টাস্ক #{item.task_id}
                    </span>
                    <span className="text-sm font-bold text-[#eeeee6]">
                      {item.ward_name_bn || 'ওয়ার্ড ৩ (মিরপুর)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      isEmergency
                        ? 'bg-[#382326] text-[#e8b6b8] border-[#71434a]'
                        : item.priority === 'high'
                        ? 'bg-[#373224] text-[#d4c19a] border-[#6b5c3e]'
                        : 'bg-[#1b221c] text-[#a7b0a8] border-[#343d34]'
                    }`}>
                      {item.priority_bn || item.priority}
                    </span>
                    <span className="text-sm text-[#4b9e78] flex items-center gap-1.5 font-bold font-mono">
                      <Clock className="w-4 h-4" />
                      <span>{item.sla_remaining_bn || 'এসএলএ বাকি'}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-lg font-bold text-[#eeeee6]">
                    {item.task_title_bn || `টাস্ক #${item.task_id}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-5 mt-2 text-sm text-[#a7b0a8]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#d4c19a]" />
                      কেস: <strong className="text-[#eeeee6] font-mono">#{item.case_id}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#4b9e78]" />
                      কিউতে অপেক্ষার সময়: {toBanglaNumber(item.waiting_hours || 1.5)} ঘণ্টা
                    </span>
                    <span className="text-[#708379] font-mono text-xs">
                      এসএলএ ঝুঁকি: <span className="text-[#d8a155] uppercase font-bold">{item.sla_breach_risk || 'Normal'}</span>
                    </span>
                  </div>
                </div>

                {/* Waiting reason & status */}
                <div className="p-4 bg-[#0d100e] rounded-xl border border-[#2e372e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5">
                    {isPrereqBlocked ? (
                      <span className="flex items-center gap-1.5 text-[#d8a155] font-semibold bg-[#373224] px-3 py-1 rounded-lg border border-[#6b5c3e] text-xs">
                        <Lock className="w-4 h-4" />
                        পূর্বশর্ত অপূর্ণ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#a8e6cf] font-semibold bg-[#1c2b20] px-3 py-1 rounded-lg border border-[#295e42] text-xs">
                        <UserCheck className="w-4 h-4" />
                        কর্মকর্তা বরাদ্দ অপেক্ষমাণ
                      </span>
                    )}
                    <span className="text-[#c8d1c9] text-sm">{item.waiting_reason_bn || 'কোনো যোগ্য কর্মকর্তা খালি নেই'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTaskForAssign({ id: item.task_id, title: item.task_title_bn || item.task_id, ward: 3 })}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4c19a] hover:bg-[#ebd8b1] text-[#0d100e] font-bold text-sm transition cursor-pointer shadow-md active:scale-95 shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-[#0d100e]" />
                    <span>ম্যানুয়াল বরাদ্দ (Assign)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recommendation & Assignment Modal */}
      {selectedTaskForAssign && (
        <OfficerAssignmentRecommendationModal
          isOpen={true}
          taskId={selectedTaskForAssign.id}
          taskTitle={selectedTaskForAssign.title}
          wardNumber={selectedTaskForAssign.ward}
          onClose={() => setSelectedTaskForAssign(null)}
          onAssigned={() => {
            setSelectedTaskForAssign(null);
            fetchQueue();
          }}
        />
      )}
    </div>
  );
};
