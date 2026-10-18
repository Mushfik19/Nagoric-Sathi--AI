import React from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { calculateSlaCountdown, toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  Inbox,
  ListTodo,
  UserCheck,
  BarChart2,
  Layers,
  ChevronRight
} from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();

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

  const readyTasks = myDeptTasks.filter(t => t.status === 'ready' || t.status === 'in_inspection' || t.status === 'in_progress');
  const blockedTasks = myDeptTasks.filter(t => t.status === 'pending_dependency');
  const resolvedTasks = myDeptTasks.filter(t => t.status === 'resolved');

  const officerNavCards = [
    {
      title: 'দাপ্তরিক অনুরোধ',
      desc: 'নতুন আগত টাস্ক গ্রহণ বা সুনির্দিষ্ট কারণসহ প্রত্যাখ্যান',
      path: '/officer/requests',
      icon: <Inbox className="w-5 h-5 text-[#d4c19a]" />,
      badge: 'দায়িত্ব নির্ধারণ'
    },
    {
      title: 'অ্যাসাইনমেন্ট কিউ ও রিকমেন্ডার',
      desc: 'এআই বহু-ফ্যাক্টর স্কোরে শীর্ষ কর্মকর্তা নির্বাচন ও কিউ ডিসপ্যাচ',
      path: '/officer/assignment-queue',
      icon: <ListTodo className="w-5 h-5 text-[#4b9e78]" />,
      badge: 'ক্যাপাসিটি গেট'
    },
    {
      title: 'উপস্থিতি ও ক্যাপাসিটি',
      desc: 'উপস্থিতি স্ট্যাটাস (Available/Busy/Leave) ও সর্বোচ্চ টাস্ক সীমা',
      path: '/officer/availability',
      icon: <UserCheck className="w-5 h-5 text-[#d4c19a]" />,
      badge: 'স্টাফ প্রোফাইল'
    },
    {
      title: 'বিভাগীয় ওয়ার্কলোড',
      desc: 'দপ্তরের মোট সক্রিয় ভার, কর্মকর্তাভিত্তিক বণ্টন ও হটস্পট লোড',
      path: '/officer/workload',
      icon: <BarChart2 className="w-5 h-5 text-[#4b9e78]" />,
      badge: 'অ্যানালিটিক্স'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--green-light)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {currentUser.departmentName || 'মাঠ পর্যায় ওয়ার্কবেঞ্চ'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-[var(--ink)]">
            দপ্তর কর্মকর্তা <strong className="font-semibold text-[var(--gold)]">কমান্ড ও টাস্ক ড্যাশবোর্ড</strong>
          </h1>
        </div>

        <Link
          to="/officer/requests"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold transition shadow cursor-pointer"
        >
          <Inbox className="w-4 h-4" />
          <span>দাপ্তরিক অনুরোধ কিউ</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="civic-card rounded-xl p-4 bg-[var(--paper)] border border-[var(--line)]">
          <div className="text-xs font-semibold text-[var(--muted)] mb-1">প্রস্তুত / চলমান কাজ</div>
          <div className="text-2xl sm:text-3xl font-light text-[var(--green)]">{toBanglaNumber(readyTasks.length)}</div>
        </div>
        <div className="civic-card rounded-xl p-4 bg-[var(--paper)] border border-[var(--line)]">
          <div className="text-xs font-semibold text-[var(--muted)] mb-1">প্রাক-শর্তের অপেক্ষায় (Blocker)</div>
          <div className="text-2xl sm:text-3xl font-light text-[var(--gold)]">{toBanglaNumber(blockedTasks.length)}</div>
        </div>
        <div className="civic-card rounded-xl p-4 bg-[var(--paper)] border border-[var(--line)]">
          <div className="text-xs font-semibold text-[var(--muted)] mb-1">সমাধান সম্পন্ন (Resolved)</div>
          <div className="text-2xl sm:text-3xl font-light text-[var(--ink)]">{toBanglaNumber(resolvedTasks.length)}</div>
        </div>
      </div>

      {/* Operations Quick Access Navigation Cards */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
          দাপ্তরিক অপারেশনাল মডিউলসমূহ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {officerNavCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.path}
              className="civic-card rounded-xl p-4 bg-[var(--paper)] border border-[var(--line)] hover:border-[var(--gold)] hover:bg-[var(--green-light)] transition flex flex-col justify-between gap-3 group cursor-pointer shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--gold)] transition">
                  {card.title}
                </h3>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <div className="flex items-center justify-end text-xs font-semibold text-[var(--gold)] pt-1">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3 pt-4 border-t border-[var(--line)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
            আমার নির্ধারিত টাস্কসমূহ
          </h2>
          <span className="text-xs text-[var(--muted)]">
            মোট {toBanglaNumber(myDeptTasks.length)} টি টাস্ক
          </span>
        </div>

        {myDeptTasks.length === 0 ? (
          <div className="civic-card rounded-xl p-8 text-center text-[var(--muted)] bg-[var(--paper)] border border-[var(--line)]">
            <Wrench className="w-8 h-8 mx-auto text-[var(--muted)] mb-2" />
            <p className="text-xs font-semibold">বর্তমানে আপনার বিভাগে কোনো অনিষ্পন্ন কাজ নেই</p>
          </div>
        ) : (
          myDeptTasks.map(task => {
            const isBlocked = task.status === 'pending_dependency';
            const sla = calculateSlaCountdown(task.slaDeadline);

            return (
              <div
                key={task.id}
                className={`civic-card rounded-xl p-4 sm:p-5 transition border bg-[var(--paper)] hover:bg-[var(--green-light)] cursor-pointer ${
                  isBlocked
                    ? 'border-[var(--line)] opacity-85'
                    : 'border-[var(--line)] hover:border-[var(--gold)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--gold)]">
                        {task.caseTitle}
                      </span>
                      <StatusBadge status={task.status} />
                    </div>

                    <h3 className="text-sm font-semibold text-[var(--ink)]">
                      {task.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--green)]" />
                        <span>{task.caseLocation.wardName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[var(--gold)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sla.text}</span>
                      </span>
                    </div>

                    {isBlocked && (
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-[#373224] border border-amber-200 dark:border-[#6b5c3e] text-amber-800 dark:text-[#d4c19a] text-xs flex items-center gap-2 mt-2">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>{task.waitingReason || 'পূর্ববর্তী বিভাগের কাজ সম্পন্ন হওয়ার জন্য অপেক্ষমাণ'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      to={`/officer/tasks/${task.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-semibold transition shadow-xs"
                    >
                      <span>বিবরণ ও সমাধান প্রমাণ</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
