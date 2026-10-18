import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber } from '../../utils/formatters';
import {
  UserCheck,
  Clock,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Shield,
  Sparkles
} from 'lucide-react';

export const OfficerAvailabilityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.officers.getAvailability(currentUser?.departmentId);
      setOfficers(res || []);
    } catch (err: any) {
      setError(err.message || 'কর্মকর্তাদের প্রাপ্যতা ও সক্ষমতা তথ্য লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [currentUser?.departmentId]);

  const handleStatusChange = async (officerId: string, newStatus: string, maxTasks: number) => {
    try {
      setUpdatingId(officerId);
      setError(null);
      await apiClient.officers.updateAvailability(officerId, { availability_status: newStatus, max_concurrent_tasks: maxTasks });
      setSuccessMsg('কর্মকর্তার প্রাপ্যতা সফলভাবে হালনাগাদ করা হয়েছে।');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCapacityChange = async (officerId: string, currentStatus: string, newCapacity: number) => {
    try {
      setUpdatingId(officerId);
      setError(null);
      await apiClient.officers.updateAvailability(officerId, { availability_status: currentStatus, max_concurrent_tasks: newCapacity });
      setSuccessMsg('সর্বোচ্চ সক্ষমতা সীমা সফলভাবে পরিবর্তিত হয়েছে।');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'সক্ষমতা আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1c2b20] text-[#4b9e78] border border-[#295e42]">
            উপলব্ধ (Available)
          </span>
        );
      case 'busy':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2f2f41] text-[#8f92b3] border border-[#52526e]">
            ব্যস্ত (At Capacity)
          </span>
        );
      case 'on_leave':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#373224] text-[#d4c19a] border-[#6b5c3e] border">
            ছুটিতে (On Leave)
          </span>
        );
      case 'offline':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#151a16] text-[#a7b0a8] border border-[#343d34]">
            অফলাইন (Offline)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#151a16] text-[#a7b0a8] border border-[#343d34]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#343d34]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b221c] border border-[#343d34] text-[#d4c19a] text-xs font-mono tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d4c19a]" />
            <span>{currentUser?.departmentName || 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#eeeee6]">
            কর্মকর্তার প্রাপ্যতা ও <strong className="font-semibold text-[#d4c19a]">সক্ষমতা নিয়ন্ত্রণ</strong>
          </h1>
          <p className="text-sm sm:text-base text-[#a7b0a8]">
            মাঠ পর্যায়ের কর্মকর্তাদের দায়িত্ব প্রাপ্তির স্থিতি এবং এককালীন সর্বোচ্চ কাজের সীমা নির্ধারণ।
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAvailability}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] border border-[var(--line)] transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--gold)] ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#1c2b20] border border-[#295e42] text-[#4b9e78] text-sm font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#4b9e78] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[#382326] border border-[#71434a] text-[#c66e60] text-sm font-semibold flex items-center gap-2.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-[#c66e60] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Policy Instruction Card */}
      <div className="p-6 rounded-2xl bg-[#151a16] border border-[#343d34] text-sm text-[#a7b0a8] space-y-2.5 shadow-md">
        <div className="flex items-center gap-2 font-bold text-base text-[#eeeee6]">
          <Shield className="w-5 h-5 text-[#4b9e78]" />
          <span>প্রাপ্যতা নীতি ও স্বয়ংক্রিয় রুলস:</span>
        </div>
        <p className="leading-relaxed">
          ১. কোনো কর্মকর্তার অ্যাকাউন্ট কেবল সক্রিয় থাকলেই তাকে স্বয়ংক্রিয়ভাবে উপলব্ধ হিসেবে বিবেচনা করা হবে না।
          প্রকৃত ডিউটি স্ট্যাটাস এবং সক্রিয় কাজের সীমা যাচাই বাধ্যতামূলক।
        </p>
        <p className="leading-relaxed">
          ২. চলতি সক্রিয় কাজ ও সর্বোচ্চ সীমার ব্যবধান (Margin) ০ হলে কর্মকর্তা স্বয়ংক্রিয়ভাবে 'ব্যস্ত' হিসেবে বিবেচিত হবেন।
        </p>
      </div>

      {/* Officers List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-[#a7b0a8] rounded-2xl bg-[#151a16] border border-[#343d34] space-y-3">
            <div className="w-9 h-9 border-2 border-[#d4c19a] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">প্রাপ্যতা তথ্য লোড হচ্ছে...</p>
          </div>
        ) : officers.length === 0 ? (
          <div className="p-16 text-center text-[#a7b0a8] rounded-2xl bg-[#151a16] border border-[#343d34]">
            <Users className="w-12 h-12 text-[#4b9e78] mx-auto mb-2 opacity-70" />
            <p className="text-base font-semibold text-[#eeeee6]">কোনো কর্মকর্তার তথ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          officers.map(officer => {
            const isUpdating = updatingId === officer.id;
            const currentTasks = officer.current_active_tasks || 0;
            const maxTasks = officer.max_concurrent_tasks || 3;
            const capacityPercent = Math.min(100, Math.round((currentTasks / maxTasks) * 100));

            return (
              <div
                key={officer.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#151a16] border border-[#343d34] hover:border-[#4b9e78] transition shadow-md space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg sm:text-xl font-bold text-[#eeeee6]">
                        {officer.name_bn || officer.id}
                      </h3>
                      {getStatusBadge(officer.availability_status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#a7b0a8]">
                      <span className="text-[#d4c19a] font-medium">
                        {officer.designation_bn || 'সহকারী প্রকৌশলী'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#4b9e78]" />
                        এখতিয়ার: {officer.ward_name_bn || 'ওয়ার্ড ৩'}
                      </span>
                      {officer.official_phone && (
                        <span className="flex items-center gap-1.5 font-mono text-[#a7b0a8]">
                          <Phone className="w-4 h-4 text-[#d4c19a]" />
                          {officer.official_phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Status Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#a7b0a8]">স্থিতি পরিবর্তন:</span>
                    <select
                      value={officer.availability_status}
                      disabled={isUpdating}
                      onChange={e => handleStatusChange(officer.id, e.target.value, maxTasks)}
                      className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#0d100e] text-[#eeeee6] border border-[#343d34] focus:border-[#d4c19a] focus:outline-none cursor-pointer"
                    >
                      <option value="available">উপলব্ধ (Available)</option>
                      <option value="busy">ব্যস্ত (At Capacity)</option>
                      <option value="on_leave">ছুটিতে (On Leave)</option>
                      <option value="offline">অফলাইন (Offline)</option>
                      <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                    </select>
                  </div>
                </div>

                {/* Capacity Progress Bar and Slider */}
                <div className="p-5 bg-[#0d100e] rounded-xl border border-[#242c24] space-y-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#eeeee6] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#4b9e78]" />
                      <span>চলতি কাজের চাপ ও সক্ষমতা ব্যবহার:</span>
                    </span>
                    <span className="font-bold text-[#d4c19a] font-mono text-base">
                      {toBanglaNumber(currentTasks)} / {toBanglaNumber(maxTasks)} টি কাজ ({toBanglaNumber(capacityPercent)}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#1b221c] rounded-full h-3 overflow-hidden border border-[#343d34]">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        capacityPercent >= 100
                          ? 'bg-[#c66e60]'
                          : capacityPercent >= 70
                          ? 'bg-[#d8a155]'
                          : 'bg-[#4b9e78]'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>

                  {/* Capacity Slider Control */}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="text-sm text-[#eeeee6] shrink-0 font-medium">
                      সর্বোচ্চ সক্ষমতা সীমা (Max Concurrent Tasks):
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={maxTasks}
                      disabled={isUpdating}
                      onChange={e => handleCapacityChange(officer.id, officer.availability_status, parseInt(e.target.value))}
                      className="w-56 accent-[#d4c19a] cursor-pointer"
                    />
                    <span className="text-sm font-bold text-[#d4c19a] font-mono w-8 text-center bg-[#151a16] py-1 rounded-lg border border-[#343d34]">
                      {toBanglaNumber(maxTasks)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
