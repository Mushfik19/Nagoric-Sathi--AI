import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { MediaUploader } from '../../components/media/MediaUploader';
import { VoiceRecorder } from '../../components/media/VoiceRecorder';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap';
import { AiProposalCard } from '../../components/ai/AiProposalCard';
import { MediaAttachment, GeoLocation, AiExtractedDetail } from '../../types';
import {
  FileText,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  HelpCircle,
  Mic
} from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

export const ReportProblemWizard: React.FC = () => {
  const navigate = useNavigate();
  const { createNewCase } = useCases();
  const { currentUser } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [description, setDescription] = useState('');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [location, setLocation] = useState<GeoLocation>({
    lat: 23.8759,
    lng: 90.3795,
    address: 'রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা',
    wardId: 12,
    wardName: 'ওয়ার্ড ১২ (উত্তরা পশ্চিম)',
    landmark: 'রবীন্দ্র সরণি মোড়'
  });

  // Simulated AI Proposal State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiProposal, setAiProposal] = useState<AiExtractedDetail>({
    category: 'drainage',
    categoryLabel: 'পানি ও ড্রেনেজ সমস্যা',
    problemSummary: 'ড্রেন ব্লকেজ ও জমাট বাঁধা পানি নিষ্কাশন সংকট',
    confidenceScore: 92,
    proposedPriority: 'high',
    priorityReason: 'ডেঙ্গু ঝুঁকি ও জনস্বাস্থ্য বিপর্যয় প্রতিরোধে অগ্রাধিকার',
    proposedDepartmentId: 'dept_drainage',
    proposedDepartmentName: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
    ruleReference: 'R-12: Drain Segment Asset Owner',
    assetName: 'সেক্টর ৭ উত্তর ড্রেন লাইন',
    assetId: 'AST-DRN-0012',
    requiresHumanVerification: false,
    signals: ['ড্রেনেজ_জলাবদ্ধতা', 'উত্তরা_সেক্টর_৭', 'জরুরি_মেরামত']
  });

  const [createdCaseId, setCreatedCaseId] = useState<string>('');
  const [showInlineMap, setShowInlineMap] = useState<boolean>(false);
  const [gpsDetectedFromCamera, setGpsDetectedFromCamera] = useState<boolean>(false);

  const handleStep1Next = () => {
    if (!description.trim() && attachments.length === 0 && !voiceAudioUrl) {
      alert('অনুগ্রহ করে সমস্যার বিবরণ লিখুন, অডিও রেকর্ড করুন অথবা অন্তত একটি ছবি আপলোড করুন');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    setCurrentStep(3);
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
    }, 1200);
  };

  const handleFinalSubmit = async () => {
    const created = await createNewCase({
      citizenId: currentUser.id,
      title: description.slice(0, 50) || 'নাগরিক সেবা রিপোর্ট',
      description: description || 'ভয়েস ও ছবির মাধ্যমে দায়েরকৃত নাগরিক অভিযোগ',
      audioRecordingUrl: voiceAudioUrl || undefined,
      category: aiProposal.category,
      priority: aiProposal.proposedPriority,
      estimatedResolutionDays: 3,
      location: location,
      initialEvidence: attachments,
      aiAnalysis: aiProposal
    });

    setCreatedCaseId(created.id);
    setCurrentStep(4);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Wizard Progress Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
          <span className={currentStep >= 1 ? 'text-[var(--gold)] font-bold' : ''}>১. সমস্যার বিবরণ ও প্রমাণ</span>
          <span className={currentStep >= 2 ? 'text-[var(--gold)] font-bold' : ''}>২. মানচিত্রে অবস্থান</span>
          <span className={currentStep >= 3 ? 'text-[var(--gold)] font-bold' : ''}>৩. এআই বিশ্লেষণ</span>
          <span className={currentStep >= 4 ? 'text-[var(--green)] font-bold' : ''}>৪. নিশ্চিতকরণ</span>
        </div>
        <div className="w-full bg-[var(--bg)] border border-[var(--line)] h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--green)] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Multimodal Intake */}
      {currentStep === 1 && (
        <div className="rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-light text-[var(--ink)]">কী সমস্যা হয়েছে? <strong className="font-semibold text-[var(--gold)]">(What happened?)</strong></h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              সাধারণ বাংলায় লিখুন, মুখে বলুন অথবা ক্যামেরা দিয়ে ছবি ও ভিডিও তুলে দিন। ছবি তুললে স্বয়ংক্রিয়ভাবে লাইভ জিপিএস লোকেশন যুক্ত হবে।
            </p>
          </div>

          {/* Text Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              সমস্যার বিবরণ (Bangla Text Description):
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="যেমন: রাস্তার পাশের ড্রেনটি কয়েকদিন ধরে বন্ধ। বৃষ্টির পানি জমে যাচ্ছে..."
              className="w-full p-3.5 text-sm bg-[var(--bg)] text-[var(--ink)] placeholder-[var(--muted)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:border-[var(--green)] transition"
            />
          </div>

          {/* Voice Note Recorder */}
          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              ভয়েস রেকর্ডার (মুখে বলুন):
            </label>
            <VoiceRecorder onRecordingComplete={url => setVoiceAudioUrl(url)} />
          </div>

          {/* Photo/Video Upload */}
          <div>
            <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              ছবি বা ভিডিও প্রমাণ সংযুক্ত করুন (ক্যামেরা ও লাইভ লোকেশন):
            </label>
            <MediaUploader
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              uploaderRole="citizen"
              currentLocation={location}
              onLocationDetected={loc => {
                setLocation(prev => ({
                  ...prev,
                  lat: loc.lat ?? prev.lat,
                  lng: loc.lng ?? prev.lng,
                  address: loc.address ?? prev.address
                }));
                setGpsDetectedFromCamera(true);
              }}
              onOpenMapPicker={() => setShowInlineMap(!showInlineMap)}
            />
          </div>

          {/* Live GPS Detected Banner / Quick Map Access */}
          {gpsDetectedFromCamera && (
            <div className="p-3.5 bg-[var(--green-light)] border border-[var(--line)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-[var(--ink)]">
                <MapPin className="w-4 h-4 text-[var(--green)] shrink-0" />
                <span>
                  ক্যামেরা থেকে লাইভ অবস্থান গৃহীত হয়েছে: <strong>{location.address}</strong> (অক্ষাংশ: {location.lat}, দ্রাঘিমাংশ: {location.lng})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineMap(!showInlineMap)}
                className="px-3 py-1.5 rounded-lg bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] hover:text-[var(--green)] font-semibold text-xs transition cursor-pointer shadow-xs shrink-0"
              >
                {showInlineMap ? 'মানচিত্র লুকান' : 'মানচিত্রে অবস্থান যাচাই/পরিবর্তন'}
              </button>
            </div>
          )}

          {/* Inline Map Picker (if toggled in Step 1) */}
          {showInlineMap && (
            <div className="p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[var(--green)]" />
                  Google Map / মানচিত্রে অবস্থান পিন করুন
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlineMap(false)}
                  className="text-[11px] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                >
                  বন্ধ করুন ✕
                </button>
              </div>
              <LocationPickerMap
                location={location}
                onChangeLocation={setLocation}
                height="320px"
              />
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--line)]">
            <span className="text-xs text-[var(--muted)]">
              {attachments.length > 0 ? `সংযুক্ত ফাইল: ${attachments.length} টি` : 'ফাইল বা বিবরণ যোগ করুন'}
            </span>
            <button
              type="button"
              onClick={handleStep1Next}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
            >
              <span>পরবর্তী: অবস্থান নিশ্চিতকরণ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location Confirmation */}
      {currentStep === 2 && (
        <div className="rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-light text-[var(--ink)]">সমস্যাটি কি এই জায়গায়? <strong className="font-semibold text-[var(--gold)]">(Location Confirmation)</strong></h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              মানচিত্রে পিন টেনে সঠিক জায়গা চিহ্নিত করুন, Google Map-এ দেখুন অথবা &apos;বর্তমান GPS অবস্থান&apos; বাটন চাপুন।
            </p>
          </div>

          <LocationPickerMap
            location={location}
            onChangeLocation={setLocation}
            height="380px"
          />

          <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--line)] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">নির্দিষ্ট ঠিকানা:</span>
              <strong className="text-[var(--ink)]">{location.address}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">ওয়ার্ড নম্বর:</span>
              <strong className="text-[var(--green)]">{location.wardName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">নিকটবর্তী ল্যান্ডমার্ক:</span>
              <span className="text-[var(--gold)]">{location.landmark}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">কোঅর্ডিনেট (GPS):</span>
              <span className="font-mono text-[var(--ink)]">{location.lat}, {location.lng}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)] text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>আগের ধাপ</span>
            </button>

            <button
              type="button"
              onClick={handleStep2Next}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
            >
              <span>অবস্থান নিশ্চিত ও এআই বিশ্লেষণ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI Analysis Proposal Review */}
      {currentStep === 3 && (
        <div className="rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-light text-[var(--ink)]">এআই প্রস্তাবিত <strong className="font-semibold text-[var(--gold)]">তথ্য পর্যালোচনা</strong></h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              আমাদের এআই সিস্টেম আপনার বিবরণ, ছবি ও ভৌগোলিক অবস্থান বিশ্লেষণ করে নিচের তথ্যগুলো প্রস্তাব করেছে। তথ্যগুলো ঠিক থাকলে সাবমিট করুন।
            </p>
          </div>

          {isAiAnalyzing ? (
            <div className="p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[var(--gold)] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[var(--ink)]">এআই বহু-মাধ্যম বিশ্লেষণ চলছে...</p>
            </div>
          ) : (
            <AiProposalCard proposal={aiProposal} />
          )}

          <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--line)] text-xs flex items-center justify-between">
            <span className="text-[var(--muted)]">এই তথ্যগুলো কি ঠিক আছে?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--paper)] text-xs transition cursor-pointer"
              >
                তথ্য পরিবর্তন করুন
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)] text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পেছনে</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>সব ঠিক আছে, অভিযোগ জমা দিন</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Submission Confirmation */}
      {currentStep === 4 && (
        <div className="rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[var(--green-light)] border border-[var(--line)] text-[var(--green)] flex items-center justify-center mx-auto shadow">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-light text-[var(--ink)]">অভিযোগ <strong className="font-semibold text-[var(--green)]">সফলভাবে জমা হয়েছে</strong></h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              আপনার অভিযোগটি সংশ্লিষ্ট ওয়ার্ড সেবা কেন্দ্র ও দায়িত্বপ্রাপ্ত বিভাগে পৌঁছানো হয়েছে।
            </p>
          </div>

          <div className="max-w-md mx-auto bg-[var(--bg)] rounded-2xl p-5 border border-[var(--line)] text-left space-y-2.5 text-xs">
            <div className="flex justify-between pb-2 border-b border-[var(--line-subtle)]">
              <span className="text-[var(--muted)]">কেস ট্র্যাকিং আইডি (Case ID):</span>
              <strong className="font-mono text-[var(--gold)] font-bold text-sm">{createdCaseId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">সমস্যার ধরন:</span>
              <span className="font-semibold text-[var(--ink)]">{aiProposal.categoryLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">স্থান:</span>
              <span className="text-[var(--ink)]">{location.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">অগ্রাধিকার:</span>
              <span className="font-semibold text-[var(--gold)]">উচ্চ (High)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">বর্তমান অবস্থা:</span>
              <span className="px-2 py-0.5 rounded bg-[var(--green-light)] text-[var(--green)] font-semibold border border-[var(--line)]">
                ওয়ার্ড ডেস্ক যাচাইয়ের অপেক্ষায়
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/cases/${createdCaseId}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
            >
              অভিযোগের অগ্রগতি দেখুন (Live Tracking)
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--paper)] hover:bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] text-xs font-semibold transition cursor-pointer"
            >
              হোমে ফিরুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
