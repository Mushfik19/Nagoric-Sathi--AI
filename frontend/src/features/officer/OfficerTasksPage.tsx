import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { calculateSlaCountdown, toBanglaNumber } from '../../utils/formatters';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  Search,
  Layers,
  Inbox,
  ListTodo
} from 'lucide-react';

export const OfficerTasksPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all department tasks
  const allTasks = cases.flatMap(c =>
    c.tasks.map(t => ({
      ...t,
      caseTitle: c.title,
      caseLocation: c.location,
      casePriority: c.priority
    }))
  );

  const myDeptTasks = allTasks.filter(
    t => !currentUser.departmentId || t.departmentId === currentUser.departmentId
  );

  const filteredTasks = myDeptTasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.caseLocation?.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'ready') return task.status === 'ready';
    if (filterStatus === 'in_inspection') return task.status === 'in_inspection';
    if (filterStatus === 'in_progress') return task.status === 'in_progress';
    if (filterStatus === 'pending_dependency') return task.status === 'pending_dependency';
    if (filterStatus === 'resolved') return task.status === 'resolved';

    return true;
  });

  const countByStatus = {
    all: myDeptTasks.length,
    ready: myDeptTasks.filter(t => t.status === 'ready').length,
    in_inspection: myDeptTasks.filter(t => t.status === 'in_inspection').length,
    in_progress: myDeptTasks.filter(t => t.status === 'in_progress').length,
    pending_dependency: myDeptTasks.filter(t => t.status === 'pending_dependency').length,
    resolved: myDeptTasks.filter(t => t.status === 'resolved').length
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-3 py-1 rounded-lg border border-[var(--line)]">
              {currentUser.departmentName || 'মাঠ পর্যায় ওয়ার্কবেঞ্চ'}
            </span>
            <span className="text-xs font-mono text-[var(--muted)] bg-[var(--bg)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
              Field Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[var(--ink)]">
            আমার নির্ধারিত কাজ ও <strong className="font-semibold text-[var(--gold)]">বাস্তবায়ন স্থিতি</strong>
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)]">
            মাঠ পর্যায়ের কার্যসম্পাদন, পূর্বশর্ত পর্যবেক্ষণ এবং সমাধান অগ্রগতির সার্বিক বিবরণ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/officer/requests"
            className="px-4 py-2.5 text-sm font-semibold text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--gold)] hover:bg-[var(--green-light)] rounded-xl transition shadow-xs"
          >
            নতুন অনুরোধ কিউ
          </Link>
          <Link
            to="/officer/assignment-queue"
            className="px-4 py-2.5 text-sm font-semibold text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--gold)] hover:bg-[var(--green-light)] rounded-xl transition shadow-xs"
          >
            অপেক্ষারত কিউ
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--paper)] p-5 rounded-2xl border border-[var(--line)] shadow-md">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-5 h-5 text-[var(--muted)] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="কেস আইডি, কাজের শিরোনাম বা এলাকা দিয়ে অনুসন্ধান করুন..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--muted)] border border-[var(--line)] rounded-xl focus:outline-hidden focus:border-[var(--gold)] transition"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'সব কাজ', count: countByStatus.all },
            { id: 'ready', label: 'প্রস্তুত', count: countByStatus.ready },
            { id: 'in_inspection', label: 'পরিদর্শনে', count: countByStatus.in_inspection },
            { id: 'in_progress', label: 'চলমান', count: countByStatus.in_progress },
            { id: 'pending_dependency', label: 'পূর্বশর্ত অপেক্ষমাণ', count: countByStatus.pending_dependency },
            { id: 'resolved', label: 'সম্পন্ন', count: countByStatus.resolved }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer border ${
                filterStatus === tab.id
                  ? 'bg-[var(--green-light)] text-[var(--green)] border-[var(--green)] font-bold shadow-xs'
                  : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:bg-[var(--green-light)]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                filterStatus === tab.id
                  ? 'bg-[var(--green)] text-white'
                  : 'bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]'
              }`}>
                {toBanglaNumber(tab.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-16 text-center text-[var(--muted)] shadow-md">
            <Layers className="w-12 h-12 mx-auto text-[var(--muted)] mb-3" />
            <p className="text-base font-semibold text-[var(--ink)]">কোনো কাজের রেকর্ড পাওয়া যায়নি</p>
            <p className="text-sm text-[var(--muted)] mt-1">নির্বাচিত ফিল্টার বা অনুসন্ধানের জন্য কোনো টাস্ক নেই</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isBlocked = task.status === 'pending_dependency';
            const sla = calculateSlaCountdown(task.slaDeadline);

            return (
              <div
                key={task.id}
                className={`rounded-2xl p-6 sm:p-7 transition border bg-[var(--paper)] hover:bg-[var(--green-light)] cursor-pointer shadow-md space-y-4 ${
                  isBlocked
                    ? 'border-amber-200 dark:border-[#6b5c3e]/50 opacity-90'
                    : 'border-[var(--line)] hover:border-[var(--gold)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[var(--gold)] bg-[var(--bg)] px-3 py-1 rounded-lg border border-[var(--line)]">
                      {task.caseId}
                    </span>
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      ধাপ {toBanglaNumber(task.sequenceOrder)}: {task.departmentName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={task.status} />
                    <span className="text-sm text-[var(--gold)] flex items-center gap-1.5 font-medium bg-[var(--bg)] px-3 py-1 rounded-lg border border-[var(--line)]">
                      <Clock className="w-4 h-4 text-[var(--gold)]" />
                      <span>{sla.text}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--ink)] leading-snug">{task.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{task.description}</p>
                </div>

                <div className="pt-3 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-[var(--muted)]">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--green)] shrink-0" />
                    <span className="text-[var(--ink)]">{task.caseLocation?.address || 'ঠিকানা অনুপস্থিত'}</span>
                  </span>

                  {isBlocked ? (
                    <span className="flex items-center gap-2 text-amber-800 dark:text-[#d4c19a] font-semibold bg-amber-50 dark:bg-[#373224] px-4 py-2 rounded-xl border border-amber-200 dark:border-[#6b5c3e] text-xs sm:text-sm">
                      <Lock className="w-4 h-4" />
                      <span>পূর্ববর্তী বিভাগের কাজ সম্পন্ন হওয়ার অপেক্ষায়</span>
                    </span>
                  ) : (
                    <Link
                      to={`/officer/tasks/${task.id}`}
                      state={{ caseId: task.caseId }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-sm font-bold shadow transition cursor-pointer"
                    >
                      <span>কার্যক্রম ও সমাধান প্রমাণ</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
