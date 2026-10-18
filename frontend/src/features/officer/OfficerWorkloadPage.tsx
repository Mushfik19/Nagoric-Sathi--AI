import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { toBanglaNumber } from '../../utils/formatters';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Layers,
  Inbox,
  Sliders,
  RefreshCw,
  UserCheck,
  Moon,
  Coffee,
  Activity,
  ShieldCheck,
  BarChart2
} from 'lucide-react';

export const OfficerWorkloadPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkload = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.officers.getWorkloadSummary(currentUser.departmentId);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'কাজের চাপ ও সক্ষমতার বিবরণ লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, [currentUser.departmentId]);

  const officers = summary?.officers || [];
  const totalOfficers = summary?.total_officers || officers.length;
  const availableOfficers = summary?.available_officers || officers.filter((o: any) => o.availability_status === 'available').length;
  const busyOfficers = summary?.busy_or_at_capacity || officers.filter((o: any) => o.availability_status === 'busy').length;
  const leaveOfficers = officers.filter((o: any) => o.availability_status === 'on_leave' || o.availability_status === 'offline').length;

  const totalMaxCapacity = officers.reduce((acc: number, o: any) => acc + (o.max_tasks || 3), 0);
  const totalActiveTasks = officers.reduce((acc: number, o: any) => acc + (o.active_tasks || 0), 0);
  const avgUtilization = totalMaxCapacity > 0 ? Math.round((totalActiveTasks / totalMaxCapacity) * 100) : 0;

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#343d34]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4c19a] bg-[#1b221c] px-3 py-1 rounded-lg border border-[#343d34]">
              {currentUser.departmentName || 'দাপ্তরিক ওয়ার্কস্পেস'}
            </span>
            <span className="text-xs font-mono text-[#a7b0a8] bg-[#151a16] px-2.5 py-1 rounded-lg border border-[#242c24]">
              Workload & Capacity Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#eeeee6]">
            বিভাগীয় কাজের চাপ ও <strong className="font-semibold text-[#d4c19a]">সক্ষমতা বিশ্লেষণ</strong>
          </h1>
          <p className="text-sm sm:text-base text-[#a7b0a8]">
            মাঠ পর্যায়ের জনবলের বর্তমান কাজের বণ্টন, মোট সক্ষমতা এবং বিতরণ ভারসাম্যতা পর্যবেক্ষণ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/officer/requests"
            className="px-4 py-2.5 text-sm font-semibold text-[#eeeee6] bg-[#151a16] border border-[#343d34] hover:border-[#d4c19a] rounded-xl transition shadow-xs"
          >
            নতুন অনুরোধ কিউ
          </Link>
          <Link
            to="/officer/assignment-queue"
            className="px-4 py-2.5 text-sm font-semibold text-[#eeeee6] bg-[#151a16] border border-[#343d34] hover:border-[#d4c19a] rounded-xl transition shadow-xs"
          >
            অপেক্ষারত কিউ
          </Link>
          <button
            onClick={fetchWorkload}
            disabled={loading}
            className="p-2.5 text-[#a7b0a8] hover:text-[#eeeee6] bg-[#151a16] border border-[#343d34] hover:border-[#d4c19a] rounded-xl transition cursor-pointer shadow-xs"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#d4c19a]' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#382326] border border-[#71434a] text-[#c66e60] rounded-xl text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a7b0a8] block">মোট কর্মকর্তা</span>
          <div className="text-3xl sm:text-4xl font-light text-[#eeeee6] font-mono mt-1.5">{toBanglaNumber(totalOfficers)}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4b9e78] block">উপলব্ধ (Available)</span>
          <div className="text-3xl sm:text-4xl font-light text-[#4b9e78] font-mono mt-1.5">{toBanglaNumber(availableOfficers)}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8f92b3] block">ব্যস্ত (Busy)</span>
          <div className="text-3xl sm:text-4xl font-light text-[#8f92b3] font-mono mt-1.5">{toBanglaNumber(busyOfficers)}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-[#d4c19a] block">ছুটি / অফলাইন</span>
          <div className="text-3xl sm:text-4xl font-light text-[#d4c19a] font-mono mt-1.5">{toBanglaNumber(leaveOfficers)}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-md col-span-2 sm:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a7b0a8] block">গড় সক্ষমতা ব্যবহার</span>
          <div className="text-3xl sm:text-4xl font-light text-[#eeeee6] font-mono mt-1.5">{toBanglaNumber(avgUtilization)}%</div>
        </div>
      </div>

      {/* Capacity Utilization Distribution */}
      <div className="rounded-2xl bg-[#151a16] border border-[#343d34] p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-[#242c24]">
          <h2 className="text-base sm:text-lg font-semibold text-[#eeeee6] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4c19a]" />
            <span>কর্মকর্তাভিত্তিক কাজের চাপ বণ্টন তালিকা</span>
          </h2>
          <Link
            to="/officer/availability"
            className="text-sm font-semibold text-[#d4c19a] hover:underline flex items-center gap-1.5 transition"
          >
            <span>সক্ষমতা নিয়ন্ত্রণ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#a7b0a8] space-y-3">
            <div className="w-9 h-9 border-2 border-[#d4c19a] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">কাজের চাপের বিবরণ লোড হচ্ছে...</p>
          </div>
        ) : officers.length === 0 ? (
          <div className="p-12 text-center text-[#a7b0a8]">
            <Users className="w-10 h-10 mx-auto text-[#708379] mb-2" />
            <p className="text-base font-semibold text-[#eeeee6]">কোনো কর্মকর্তার তালিকা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="divide-y divide-[#242c24]">
            {officers.map((officer: any) => {
              const active = officer.active_tasks || 0;
              const max = officer.max_tasks || 3;
              const pct = Math.min(100, Math.round((active / max) * 100));

              return (
                <div key={officer.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base sm:text-lg text-[#eeeee6]">{officer.name_bn || officer.id}</span>
                      <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                        officer.availability_status === 'available'
                          ? 'bg-[#1c2b20] text-[#4b9e78] border-[#295e42]'
                          : officer.availability_status === 'busy'
                          ? 'bg-[#2f2f41] text-[#8f92b3] border-[#52526e]'
                          : 'bg-[#373224] text-[#d4c19a] border-[#6b5c3e]'
                      }`}>
                        {officer.availability_status === 'available' ? 'উপলব্ধ' : officer.availability_status === 'busy' ? 'ব্যস্ত' : 'ছুটি/অফলাইন'}
                      </span>
                    </div>
                    <div className="text-sm text-[#a7b0a8] flex flex-wrap items-center gap-4">
                      <span>ওয়ার্ড: <strong className="text-[#eeeee6]">{officer.ward ? toBanglaNumber(officer.ward) : 'সকল'}</strong></span>
                      <span>•</span>
                      <span>পদবি: <strong className="text-[#eeeee6]">{officer.designation || 'মাঠ কর্মকর্তা'}</strong></span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="flex items-center gap-4 w-full sm:w-96">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm text-[#a7b0a8] mb-2">
                        <span>সক্ষমতা ব্যবহার:</span>
                        <strong className="font-mono text-[#eeeee6] text-base">{toBanglaNumber(active)}/{toBanglaNumber(max)} ({toBanglaNumber(pct)}%)</strong>
                      </div>
                      <div className="w-full bg-[#0d100e] border border-[#242c24] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            pct >= 100 ? 'bg-[#c66e60]' : pct >= 70 ? 'bg-[#d8a155]' : 'bg-[#4b9e78]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/officer/requests"
          className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] hover:border-[#d4c19a] transition flex items-center justify-between group cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1b221c] border border-[#343d34] flex items-center justify-center text-[#d4c19a] group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#eeeee6] group-hover:text-[#d4c19a] transition">নতুন অনুরোধ কিউ</h3>
              <p className="text-xs text-[#a7b0a8] mt-0.5">অনুমোদনের জন্য আগত কাজ</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#a7b0a8] group-hover:text-[#d4c19a] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/officer/assignment-queue"
          className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] hover:border-[#4b9e78] transition flex items-center justify-between group cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1b221c] border border-[#343d34] flex items-center justify-center text-[#4b9e78] group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#eeeee6] group-hover:text-[#4b9e78] transition">অপেক্ষারত কিউ</h3>
              <p className="text-xs text-[#a7b0a8] mt-0.5">প্রেরণ ও অগ্রাধিকার তালিকা</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#a7b0a8] group-hover:text-[#4b9e78] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/officer/availability"
          className="p-5 rounded-2xl bg-[#151a16] border border-[#343d34] hover:border-[#d4c19a] transition flex items-center justify-between group cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1b221c] border border-[#343d34] flex items-center justify-center text-[#d4c19a] group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#eeeee6] group-hover:text-[#d4c19a] transition">প্রাপ্যতা ও সক্ষমতা</h3>
              <p className="text-xs text-[#a7b0a8] mt-0.5">ডিউটি ও সর্বোচ্চ কাজের সীমা</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#a7b0a8] group-hover:text-[#d4c19a] group-hover:translate-x-1 transition" />
        </Link>
      </div>
    </div>
  );
};
