import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceKnowledgeService } from '../../services/serviceKnowledgeService';
import { VerifiedServiceKnowledge } from '../../types';
import { toBanglaNumber } from '../../utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  CheckSquare,
  Square,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<VerifiedServiceKnowledge | undefined>(undefined);
  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>(['doc_bc_nid']);

  useEffect(() => {
    serviceKnowledgeService.getServiceById(id || 'srv_birth_cert').then(setService);
  }, [id]);

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-[var(--paper)] rounded-2xl border border-[var(--line)] my-8">
        <h2 className="text-base font-semibold text-[var(--ink)]">সেবাটি খুঁজে পাওয়া যায়নি</h2>
        <Link to="/services" className="text-xs text-[var(--gold)] font-semibold mt-2 inline-block">
          ← সকল সেবার তালিকায় ফিরুন
        </Link>
      </div>
    );
  }

  const toggleDocumentCheck = (docId: string) => {
    if (uploadedDocIds.includes(docId)) {
      setUploadedDocIds(uploadedDocIds.filter(d => d !== docId));
    } else {
      setUploadedDocIds([...uploadedDocIds, docId]);
    }
  };

  const calculateReadiness = () => {
    const mandatoryDocs = service.requiredDocuments.filter((d: any) => d.mandatory);
    const completedMandatory = mandatoryDocs.filter((d: any) => uploadedDocIds.includes(d.id));
    const percentage = mandatoryDocs.length > 0 ? Math.round((completedMandatory.length / mandatoryDocs.length) * 100) : 100;
    return {
      percentage,
      isReady: percentage === 100,
      missingCount: mandatoryDocs.length - completedMandatory.length
    };
  };

  const readiness = calculateReadiness();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--gold)] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>সকল সেবার তালিকায় ফিরুন</span>
      </Link>

      {/* Service Header Card */}
      <div className="rounded-2xl p-6 bg-[var(--paper)] border border-[var(--line)] space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[var(--gold)] bg-[var(--bg)] px-2.5 py-0.5 rounded border border-[var(--line)]">
              {service.code}
            </span>
            <span className="text-xs font-semibold text-[var(--green)] bg-[var(--green-light)] px-2.5 py-0.5 rounded-full border border-[var(--line)] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              যাচাইকৃত সরকারি তথ্য
            </span>
          </div>

          <span className="text-xs text-[var(--muted)]">
            সর্বশেষ যাচাই: <strong className="text-[var(--ink)]">{service.lastVerifiedDate}</strong>
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-light text-[var(--ink)]">{service.title}</h1>
          <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{service.titleEn}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs">
          <div>
            <span className="text-[var(--muted)] block mb-0.5">দায়িত্বপ্রাপ্ত শাখা:</span>
            <strong className="text-[var(--ink)]">{service.department}</strong>
          </div>
          <div>
            <span className="text-[var(--muted)] block mb-0.5">সরকারি ফি:</span>
            <strong className="text-[var(--green)] font-bold">{service.officialFee}</strong>
          </div>
          <div>
            <span className="text-[var(--muted)] block mb-0.5">আবেদনের মাধ্যম:</span>
            <strong className="text-[var(--gold)]">{service.isOnlineAvailable ? 'অনলাইন ও ওয়ার্ড সেবা কেন্দ্র' : 'ওয়ার্ড অফিস'}</strong>
          </div>
        </div>
      </div>

      {/* Application Readiness Checker (M2 Feature) */}
      <div className="rounded-2xl p-6 space-y-5 border border-[var(--line)] bg-[var(--paper)] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" />
              <span>আবেদন প্রস্তুতি যাচাইকারক (Application Readiness Checker)</span>
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              আবেদন করার পূর্বে প্রয়োজনীয় ডকুমেন্টের চেকলিস্ট মিলিয়ে আপনার প্রস্তুতি যাচাই করুন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">প্রস্তুতি:</span>
            <span className="text-sm font-bold font-mono text-[var(--gold)]">{toBanglaNumber(readiness.percentage)}%</span>
            <div className="w-20 h-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  readiness.isReady ? 'bg-[var(--green)]' : 'bg-[var(--gold)]'
                }`}
                style={{ width: `${readiness.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Readiness Status Banner */}
        {readiness.isReady ? (
          <div className="p-4 rounded-xl bg-[var(--green-light)] border border-[var(--line)] flex items-start gap-3 text-xs text-[var(--ink)]">
            <CheckCircle2 className="w-5 h-5 text-[var(--green)] shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-sm text-[var(--green)]">আপনার আবেদন সম্পূর্ণ প্রস্তুত!</strong>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                সকল বাধ্যতামূলক কাগজপত্র সংযুক্ত হয়েছে। আপনি সরাসরি অফিসিয়াল পোর্টালে আবেদন সম্পন্ন করতে পারেন।
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-[var(--ink)]">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-sm text-amber-700 dark:text-amber-400">আপনার আবেদন এখনও প্রস্তুত নয়</strong>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                বাকি থাকা বাধ্যতামূলক ডকুমেন্টস প্রস্তুত করে চেকবক্সে টিক দিন।
              </p>
            </div>
          </div>
        )}

        {/* Documents Interactive Checklist */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-[var(--ink)] block">
            প্রয়োজনীয় কাগজপত্রের চেকলিস্ট (কাগজপত্র থাকলে টিক দিন):
          </span>

          {service.requiredDocuments.map((doc: any) => {
            const isChecked = uploadedDocIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => toggleDocumentCheck(doc.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                  isChecked
                    ? 'bg-[var(--green-light)] border-[var(--line)] text-[var(--ink)]'
                    : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:border-[var(--green)]'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-[var(--muted)] shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--ink)]">{doc.name}</span>
                    {doc.mandatory ? (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        বাধ্যতামূলক
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[var(--muted)] bg-[var(--paper)] px-2 py-0.5 rounded border border-[var(--line)]">
                        ঐচ্ছিক
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-1">{doc.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Action Portal Link */}
        <div className="pt-2 flex justify-end">
          <a
            href={service.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
          >
            <span>অফিসিয়াল সরকারি পোর্টালে আবেদন করুন</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Official Step-by-Step Procedure */}
      <div className="rounded-2xl p-6 bg-[var(--paper)] border border-[var(--line)] space-y-4 shadow-xs">
        <h2 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--green)]" />
          <span>আবেদন ও অনুমোদনের ধারাবাহিক ধাপসমূহ</span>
        </h2>

        <div className="space-y-3">
          {service.steps.map((step: any) => (
            <div
              key={step.stepNumber}
              className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs"
            >
              <span className="w-6 h-6 rounded-full bg-[var(--green)] text-white font-bold flex items-center justify-center shrink-0">
                {toBanglaNumber(step.stepNumber)}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[var(--ink)]">{step.title}</h4>
                  <span className="text-[11px] text-[var(--muted)]">আনুমানিক {toBanglaNumber(step.estimatedDays)} দিন</span>
                </div>
                <p className="text-[var(--muted)] mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] text-[11px] text-[var(--muted)]">
          <strong className="text-[var(--ink)]">সরকারি উৎস ও গ্যাজেট:</strong> {service.officialSource}
        </div>
      </div>
    </div>
  );
};
