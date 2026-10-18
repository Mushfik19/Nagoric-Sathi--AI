import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { DependencySequenceDiagram } from '../../components/cases/DependencySequenceDiagram';
import { BeforeAfterViewer } from '../../components/cases/BeforeAfterViewer';
import { CaseLifecycleTimeline } from '../../components/cases/CaseLifecycleTimeline';
import { CaseReportPackageModal } from '../../components/cases/CaseReportPackageModal';
import { DepartmentTask } from '../../types';
import {
  ArrowLeft,
  GitMerge,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowDown,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  FileEdit,
  Send,
  FileText
} from 'lucide-react';
import { formatBanglaDate, toBanglaNumber } from '../../utils/formatters';

export const MultiDepartmentCaseViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCase, approveSequence, acceptResolution, updateTask } = useCases();
  const { currentUser } = useAuth();

  const caseData = getCase(id || 'NS-2026-000184');

  const [tasksList, setTasksList] = useState<DepartmentTask[]>(caseData?.tasks || []);
  const [isApproving, setIsApproving] = useState(false);
  const [reworkReason, setReworkReason] = useState('');
  const [showReworkInput, setShowReworkInput] = useState(false);
  const [addendumText, setAddendumText] = useState('');
  const [addendumSubmitted, setAddendumSubmitted] = useState(false);
  const [isReportPackageOpen, setIsReportPackageOpen] = useState(false);

  const resolutionEvidence = caseData?.tasks.find(t => t.resolutionEvidence && t.resolutionEvidence.length > 0)?.resolutionEvidence;

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">কেসটি পাওয়া যায়নি</h2>
        <Link to="/coordinator" className="text-xs text-emerald-700 font-semibold mt-2 inline-block">
          ← সমন্বয়ক ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>
    );
  }

  const handleApproveSequence = async () => {
    setIsApproving(true);
    await approveSequence(caseData.id, currentUser.name, tasksList);
    setIsApproving(false);
  };

  const handleFinalClose = async () => {
    await acceptResolution(caseData.id, 5, 'সমন্বয়ক কর্তৃক চূড়ান্ত প্রমাণ পর্যালোচনা ও কেস সমাপ্তি নিশ্চিত');
    navigate('/coordinator');
  };

  const handleRequestRework = async () => {
    if (!reworkReason.trim()) {
      alert('পুনরায় কাজের যৌক্তিক কারণ উল্লেখ করুন');
      return;
    }
    const lastTask = caseData.tasks[caseData.tasks.length - 1];
    if (lastTask) {
      await updateTask(caseData.id, lastTask.id, 'in_progress', currentUser.name, `পুনরায় কাজের নির্দেশ: ${reworkReason}`);
    }
    setShowReworkInput(false);
    setReworkReason('');
  };

  const handleAddAddendum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addendumText.trim()) return;
    setAddendumSubmitted(true);
    setAddendumText('');
  };

  return (
    <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-3">
          <Link
            to="/coordinator"
            className="p-2.5 rounded-lg bg-[var(--paper-elevated)] hover:bg-[var(--line)]/20 text-[var(--ink)] border border-[var(--line)] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--gold)] bg-[var(--paper-elevated)] px-2.5 py-0.5 rounded border border-[var(--line)]">
                {caseData.id}
              </span>
              <PriorityBadge priority={caseData.priority} />
              <StatusBadge status={caseData.status} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--ink)] mt-1.5">
              বহু-বিভাগীয় কার্যপরিকল্পনা ও অনুক্রম অনুমোদন
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsReportPackageOpen(true)}
            className="px-3.5 py-2 bg-[var(--paper-elevated)] hover:bg-[var(--line)]/30 text-[var(--ink)] rounded-lg text-xs font-semibold border border-[var(--line)] transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>কেস রিপোর্ট প্যাকেজ</span>
          </button>

          {caseData.status === 'resolved_pending_citizen' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReworkInput(!showReworkInput)}
                className="px-3.5 py-2 bg-[var(--status-high-bg)] hover:opacity-90 text-[var(--gold)] border border-[var(--status-high-border)] rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>পুনরায় কাজের নির্দেশ</span>
              </button>
              <button
                type="button"
                onClick={handleFinalClose}
                className="px-4 py-2 bg-[var(--green)] hover:opacity-90 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>কেস চূড়ান্ত বন্ধ অনুমোদন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rework Reason Box */}
      {showReworkInput && (
        <div className="civic-card rounded-xl p-4 bg-[var(--status-high-bg)] border border-[var(--status-high-border)] space-y-3 text-xs animate-fade-in">
          <div className="flex items-center gap-1.5 font-bold text-[var(--gold)]">
            <AlertTriangle className="w-4 h-4 text-[var(--gold)]" />
            <span>মাঠ দলকে পুনরায় কাজের নির্দেশ পাঠান:</span>
          </div>
          <textarea
            rows={2}
            value={reworkReason}
            onChange={e => setReworkReason(e.target.value)}
            placeholder="প্রমাণ পর্যালোচনায় কী ঘাটতি রয়েছে তা বিস্তারিত লিখুন..."
            className="w-full p-2.5 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] focus:outline-hidden focus:border-[var(--accent)]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReworkInput(false)}
              className="px-3 py-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-elevated)]"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleRequestRework}
              className="px-4 py-1.5 rounded-lg bg-[var(--gold)] text-black font-bold hover:opacity-90 transition"
            >
              রি-ওয়ার্ক ওয়ার্ক-অর্ডার ইস্যু করুন
            </button>
          </div>
        </div>
      )}

      {/* Case Overview Card */}
      <div className="civic-card rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-[var(--ink)]">{caseData.title}</h2>
        <p className="text-xs text-[var(--muted)] bg-[var(--bg)] p-3 rounded-lg border border-[var(--line)] leading-relaxed">
          {caseData.description}
        </p>
        <div className="text-xs text-[var(--muted)] flex items-center justify-between">
          <span>স্থান: <strong className="text-[var(--ink)]">{caseData.location.address}</strong> ({caseData.location.wardName})</span>
          <span>দাখিল: <strong className="text-[var(--ink)]">{formatBanglaDate(caseData.submittedAt)}</strong></span>
        </div>
      </div>

      {/* Interactive Dependency Sequencer */}
      <DependencySequenceDiagram tasks={tasksList} />

      {/* Sequence Confirmation Actions */}
      <div className="civic-card rounded-xl p-5 bg-[var(--paper-elevated)] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div>
          <strong className="text-[var(--ink)] block font-bold">ডিপেন্ডেন্সি পরিকল্পনা যাচাই</strong>
          <p className="text-[var(--muted)] text-[11px] mt-0.5">
            অনুমোদন করলে ১ম ধাপের (বর্জ্য ব্যবস্থাপনা) ওয়ার্ক-অর্ডার জারি হবে এবং পরবর্তী ধাপগুলো পূর্বশর্ত পূরণ সাপেক্ষে স্বয়ংক্রিয়ভাবে আনলক হবে।
          </p>
        </div>

        <button
          type="button"
          onClick={handleApproveSequence}
          disabled={isApproving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--green)] hover:opacity-90 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
        >
          {isApproving ? 'অনুমোদন হচ্ছে...' : 'কার্যক্রমের অনুক্রম অনুমোদন করুন'}
        </button>
      </div>

      {/* Evidence Viewer if Evidence is present */}
      {resolutionEvidence && (
        <BeforeAfterViewer
          initialEvidence={caseData.initialEvidence}
          resolutionEvidence={resolutionEvidence}
          onAccept={() => handleFinalClose()}
          onObject={(_reasons, notes) => {
            setReworkReason(notes || 'সমন্বয়ক কর্তৃক আপত্তি');
            handleRequestRework();
          }}
          canVerify={true}
          status={caseData.status}
        />
      )}

      {/* Closed Case Official Addendum (R&D Section 6.I) */}
      {caseData.status === 'closed' && (
        <div className="civic-card rounded-xl p-5 space-y-3 bg-[var(--paper-elevated)] border border-[var(--line)] text-xs">
          <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
            <FileEdit className="w-4 h-4 text-[var(--green)]" />
            <span>ক্লোজড কেস অফিসিয়াল পরিশিষ্ট / সংযোজনী (Official Addendum)</span>
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            মূল নিষ্পত্তির ইতিহাস অপরিবর্তিত রেখে কোনো প্রশাসনিক মন্তব্য বা ফলো-আপ তথ্য যুক্ত করতে পারেন।
          </p>

          <form onSubmit={handleAddAddendum} className="space-y-2">
            <input
              type="text"
              value={addendumText}
              onChange={e => setAddendumText(e.target.value)}
              placeholder="পরিশিষ্ট মন্তব্য লিখুন (যেমন: সড়ক সংস্কারের পর পরিদর্শন সম্পন্ন হয়েছে)..."
              className="w-full p-2.5 text-xs bg-[var(--bg)] text-[var(--ink)] rounded-lg border border-[var(--line)] focus:outline-hidden focus:border-[var(--accent)]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--green)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>সংযোজনী লিপিবদ্ধ করুন</span>
              </button>
            </div>
          </form>

          {addendumSubmitted && (
            <div className="p-2.5 bg-[var(--green-light)] text-[var(--green)] rounded-lg border border-[var(--green)]/30 text-xs font-semibold">
              ✓ অফিসিয়াল পরিশিষ্ট সফলভাবে কেস ইতিহাসে স্থায়ীভাবে সংযুক্ত হয়েছে।
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <CaseLifecycleTimeline timeline={caseData.timeline} currentStatus={caseData.status} />

      {/* Official Case Report Package Modal (M7 / Open311) */}
      <CaseReportPackageModal
        caseData={caseData}
        isOpen={isReportPackageOpen}
        onClose={() => setIsReportPackageOpen(false)}
      />
    </div>
  );
};
