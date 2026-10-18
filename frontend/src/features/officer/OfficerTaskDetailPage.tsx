import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { MediaUploader } from '../../components/media/MediaUploader';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { MediaAttachment, TaskStatus } from '../../types';
import { calculateSlaCountdown, toBanglaNumber, formatBanglaDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  MapPin,
  FileText,
  ShieldCheck
} from 'lucide-react';

export const OfficerTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { cases, updateTask, submitProof } = useCases();
  const { currentUser } = useAuth();

  // Find parent case and task
  let parentCase = cases.find(c => c.tasks.some(t => t.id === id));
  if (!parentCase && location.state?.caseId) {
    parentCase = cases.find(c => c.id === location.state.caseId);
  }
  if (!parentCase) parentCase = cases[0];

  const task = parentCase?.tasks.find(t => t.id === id) || parentCase?.tasks[0];

  const [evidenceAttachments, setEvidenceAttachments] = useState<MediaAttachment[]>([
    {
      id: 'proof_sample_1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
      caption: 'সংস্কার সমাধান সম্পন্ন: বর্জ্য অপসারিত ও ড্রেন উন্মুক্ত',
      uploadedAt: new Date().toISOString(),
      uploaderRole: 'field_officer',
      isPrivacyMasked: true
    }
  ]);
  const [resolutionNotes, setResolutionNotes] = useState(
    'ড্রেনের মুখে জমে থাকা প্লাস্টিক ও কঠিন বর্জ্য পুরোপুরি অপসারণ করে ড্রেনের পানি চলাচল স্বাভাবিক করা হয়েছে।'
  );
  const [waitingReasonInput, setWaitingReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task || !parentCase) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">টাস্কটি খুঁজে পাওয়া যায়নি</h2>
        <Link to="/officer" className="text-xs text-emerald-700 font-semibold mt-2 inline-block">
          ← কার্য তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const sla = calculateSlaCountdown(task.slaDeadline);

  const handleStartInspection = async () => {
    await updateTask(parentCase.id, task.id, 'in_inspection', currentUser.name);
  };

  const handleMarkInProgress = async () => {
    await updateTask(parentCase.id, task.id, 'in_progress', currentUser.name);
  };

  const handleAddWaitingReason = async () => {
    if (!waitingReasonInput.trim()) return;
    await updateTask(parentCase.id, task.id, 'in_progress', currentUser.name, waitingReasonInput);
    setWaitingReasonInput('');
  };

  const handleSubmitResolutionProof = async () => {
    if (evidenceAttachments.length === 0) {
      alert('সমাধান প্রমাণের জন্য অন্তত একটি ছবি বা ভিডিও আপলোড করুন');
      return;
    }
    if (!resolutionNotes.trim()) {
      alert('সমাধানের বিবরণ লিখুন');
      return;
    }

    setIsSubmitting(true);
    await submitProof(parentCase.id, task.id, currentUser.name, evidenceAttachments, resolutionNotes);
    setIsSubmitting(false);
    navigate('/officer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Back and Title Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#343d34]">
        <Link
          to="/officer/tasks"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#a7b0a8] hover:text-[#eeeee6] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মাঠ কার্যতালিকা ড্যাশবোর্ডে ফিরুন</span>
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} />
          <span className="text-sm font-medium text-[#a7b0a8]">
            এসএলএ: <strong className="text-[#eeeee6] font-mono">{sla.text}</strong>
          </span>
        </div>
      </div>

      {/* Task Summary Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-[#d4c19a] bg-[#0d100e] px-3 py-1 rounded-lg border border-[#343d34]">
                #{parentCase.id}
              </span>
              <span className="text-sm font-bold text-[#4b9e78]">
                ধাপ {toBanglaNumber(task.sequenceOrder)}: {task.departmentName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#eeeee6] leading-snug">{task.title}</h1>
          </div>
        </div>

        <p className="text-sm text-[#eeeee6] bg-[#0d100e] p-4 rounded-xl border border-[#2e372e] leading-relaxed">
          {task.description}
        </p>

        {/* Location & Case Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#4b9e78] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#eeeee6] block text-sm font-semibold">{parentCase.location.address}</strong>
              <span className="text-xs text-[#a7b0a8]">{parentCase.location.wardName} ({parentCase.location.landmark})</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#d4c19a] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-[#a7b0a8] block">এসএলএ সময়সীমা:</span>
              <strong className="text-[#eeeee6] text-sm font-mono">{formatBanglaDate(task.slaDeadline)}</strong>
            </div>
          </div>
        </div>

        {/* Quick Progress Buttons for Field Staff */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--line)]">
          <span className="text-sm font-semibold text-[var(--muted)] mr-1">ফিল্ড স্ট্যাটাস আপডেট:</span>
          <button
            type="button"
            onClick={handleStartInspection}
            className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-[#373224] hover:bg-amber-100 dark:hover:bg-[#4d442c] text-amber-800 dark:text-[#d4c19a] border border-amber-300 dark:border-[#6b5c3e] text-sm font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            ১. পরিদর্শন শুরু করুন
          </button>
          <button
            type="button"
            onClick={handleMarkInProgress}
            className="px-4 py-2.5 rounded-xl bg-[var(--green-light)] hover:bg-[var(--green)] hover:text-white text-[var(--green)] border border-[var(--line)] text-sm font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            ২. সংস্কার কাজ চলমান
          </button>
        </div>
      </div>

      {/* Dependency Blocker / Waiting Reason Reporter */}
      <div className="p-6 rounded-2xl bg-[#2a2419] border border-[#6b5c3e] shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-[#d4c19a]">
          <AlertTriangle className="w-5 h-5 text-[#d4c19a] shrink-0" />
          <span>কাজের অগ্রগতি স্থবির হওয়ার কারণ যোগ করুন (Waiting Blocker):</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={waitingReasonInput}
            onChange={e => setWaitingReasonInput(e.target.value)}
            placeholder="যেমন: বৃষ্টিপাতের কারণে ড্রেনের পানি নিষ্কাশনে দেরি হচ্ছে..."
            className="flex-1 px-4 py-3 text-sm bg-[#0d100e] text-[#eeeee6] rounded-xl border border-[#343d34] focus:outline-none focus:border-[#d4c19a] placeholder-[#708379]"
          />
          <button
            type="button"
            onClick={handleAddWaitingReason}
            className="px-5 py-3 rounded-xl bg-[#d4c19a] hover:bg-[#ebd8b1] text-[#0d100e] text-sm font-bold shadow-md transition cursor-pointer active:scale-95 shrink-0"
          >
            স্থবির কারণ যোগ করুন
          </button>
        </div>
        {task.waitingReason && (
          <p className="text-xs text-[#d4c19a] font-medium pt-1">
            বর্তমান স্থবিরতা: <span className="underline">{task.waitingReason}</span>
          </p>
        )}
      </div>

      {/* Resolution Proof Uploader (M8 Evidence Verification) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#151a16] border border-[#343d34] shadow-xl space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#eeeee6] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#4b9e78]" />
            <span>সমাধানের প্রমাণ ও ছবি আপলোড (Resolution Evidence)</span>
          </h2>
          <p className="text-sm text-[#a7b0a8] mt-1">
            কাজ সম্পন্নের পর সুস্পষ্ট ছবি/ভিডিও আপলোড করুন যা নাগরিকের প্রাথমিক সমস্যার সাথে তুলনাযোগ্য
          </p>
        </div>

        {/* Media Uploader with simulated compression */}
        <MediaUploader
          attachments={evidenceAttachments}
          onAttachmentsChange={setEvidenceAttachments}
          uploaderRole="field_officer"
        />

        {/* Resolution Notes */}
        <div>
          <label className="block text-sm font-bold text-[#eeeee6] mb-2">
            মাঠ সমাধান নোট ও বিবরণ (Resolution Notes):
          </label>
          <textarea
            rows={3}
            value={resolutionNotes}
            onChange={e => setResolutionNotes(e.target.value)}
            placeholder="কাজের বিস্তারিত বিবরণ লিখুন..."
            className="w-full p-4 text-sm bg-[#0d100e] text-[#eeeee6] rounded-xl border border-[#343d34] focus:outline-none focus:border-[#4b9e78] leading-relaxed placeholder-[#708379]"
          />
        </div>

        {/* Submit Proof Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitResolutionProof}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#4b9e78] hover:bg-[#5db88e] text-[#0d100e] text-sm font-bold shadow-lg transition disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>সমাধান প্রমাণ জমা দিন ও টাস্ক সমাপ্ত করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
