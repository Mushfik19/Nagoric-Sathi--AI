// Authoritative Types for Nagorik Sathi AI

export type UserRole = 'citizen' | 'ward_desk' | 'field_officer' | 'coordinator' | 'admin';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  wardId?: number;
  wardName?: string;
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  avatarUrl?: string;
  isMfaEnabled?: boolean;
}

export type PriorityLevel = 'emergency' | 'high' | 'medium' | 'low';

export type CaseStatus =
  | 'submitted'                // জমা হয়েছে
  | 'verified'                 // যাচাই হয়েছে
  | 'under_inspection'        // মাঠ পর্যায়ে পরিদর্শন চলছে
  | 'in_progress'             // কাজ চলছে
  | 'resolved_pending_citizen'// সমাধান হয়েছে - প্রমাণ আপলোডকৃত
  | 'closed'                  // চূড়ান্ত বন্ধ
  | 'reopened'                // পুনরায় খোলা হয়েছে (আপত্তির কারণে)
  | 'merged';                 // ডুপ্লিকেট হিসেবে সংযুক্ত

export type ProblemCategory =
  | 'drainage'         // ড্রেনেজ ও পয়ঃনিষ্কাশন
  | 'waste'            // বর্জ্য ব্যবস্থাপনা
  | 'road_engineering' // সড়ক ও অবকাঠামো
  | 'lighting'         // সড়ক বাতি ও বিদ্যুৎ
  | 'water_supply'     // পানি সরবরাহ
  | 'encroachment'     // অবৈধ দখল ও ফুটপাত
  | 'vector_control';  // মশা ও রোগ নিয়ন্ত্রণ

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  wardId: number;
  wardName: string;
  landmark?: string;
}

export interface MediaAttachment {
  id: string;
  type: 'photo' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  uploadedAt: string;
  uploaderRole: UserRole;
  isPrivacyMasked?: boolean;
  fileSizeBytes?: number;
  geoLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: string;
    address?: string;
  };
}

export interface AiExtractedDetail {
  category: ProblemCategory;
  categoryLabel: string;
  problemSummary: string;
  confidenceScore: number; // 0 to 100
  proposedPriority: PriorityLevel;
  priorityReason: string;
  proposedDepartmentId: string;
  proposedDepartmentName: string;
  ruleReference: string; // e.g., "R-12: Drain Segment Asset Owner"
  assetId?: string;
  assetName?: string;
  requiresHumanVerification: boolean;
  uncertaintyReason?: string;
  signals: string[];
}

export type TaskStatus = 'pending_dependency' | 'ready' | 'in_inspection' | 'in_progress' | 'resolved' | 'rejected';

export interface DepartmentTask {
  id: string;
  caseId: string;
  sequenceOrder: number; // 1, 2, 3
  departmentId: string;
  departmentName: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerPhone?: string;
  prerequisiteTaskId?: string; // Task ID that must finish before this can start
  prerequisiteDeptName?: string;
  waitingReason?: string;
  slaTargetHours: number;
  slaDeadline: string;
  isOverdue?: boolean;
  startedAt?: string;
  resolvedAt?: string;
  resolutionEvidence?: MediaAttachment[];
  resolutionNotes?: string;
}

export interface CaseLifecycleEvent {
  id: string;
  caseId: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionTitle: string;
  actionDescription: string;
  stage: CaseStatus;
  badgeType?: 'info' | 'success' | 'warning' | 'danger';
  media?: MediaAttachment[];
}

export interface CitizenObjection {
  id: string;
  caseId: string;
  submittedAt: string;
  reasons: string[]; // e.g. ["কাজ সম্পূর্ণ হয়নি", "আবার একই সমস্যা হয়েছে"]
  notes?: string;
  evidencePhotoUrl?: string;
  status: 'pending_review' | 'acknowledged' | 'addressed';
}

export interface Case {
  id: string; // e.g., "NS-2026-000184"
  trackingNumber: string;
  citizenId: string;
  citizenName?: string; // Privacy protected on public/officer views
  citizenPhone?: string;
  title: string;
  description: string;
  audioRecordingUrl?: string;
  location: GeoLocation;
  category: ProblemCategory;
  priority: PriorityLevel;
  priorityOverrideReason?: string;
  status: CaseStatus;
  submittedAt: string;
  updatedAt: string;
  estimatedResolutionDays: number;
  initialEvidence: MediaAttachment[];
  aiAnalysis: AiExtractedDetail;
  humanVerification?: {
    verifiedBy: string;
    verifiedAt: string;
    isOverridden: boolean;
    overrideReason?: string;
    confirmedDepartmentId: string;
    confirmedDepartmentName: string;
  };
  tasks: DepartmentTask[];
  timeline: CaseLifecycleEvent[];
  objection?: CitizenObjection;
  mergedIntoCaseId?: string;
  duplicateCases?: string[];
  hotspotZoneId?: string;
  citizenSatisfactionRating?: number; // 1 to 5 stars
  citizenFeedback?: string;
}

export interface DuplicateCandidate {
  primaryCaseId: string;
  duplicateCaseId: string;
  similarityScore: number; // 0 to 100
  distanceMeters: number;
  category: ProblemCategory;
  detectedAt: string;
  status: 'pending_review' | 'merged' | 'rejected_distinct';
}

export interface HotspotZone {
  id: string;
  name: string;
  wardId: number;
  wardName: string;
  category: ProblemCategory;
  incidentCount: number;
  severity: 'critical' | 'high' | 'moderate';
  recurrentAsset: string;
  geoCenter: [number, number];
  polygonCoordinates: [number, number][];
  aiSuggestion: string;
  lastIncidentDate: string;
  status: 'active_monitoring' | 'remediation_planned' | 'resolved';
}

export interface VerifiedServiceKnowledge {
  id: string;
  code: string;
  title: string;
  titleEn: string;
  category: string;
  department: string;
  targetCitizens: string;
  requiredDocuments: {
    id: string;
    name: string;
    mandatory: boolean;
    description: string;
  }[];
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    estimatedDays: number;
  }[];
  officialFee: string;
  officialSource: string;
  officialPortalUrl: string;
  lastVerifiedDate: string;
  isOnlineAvailable: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: 'case' | 'task' | 'rule' | 'ai_gate' | 'user' | 'duplicate';
  resourceId: string;
  details: string;
  ipAddress: string;
  isImmutableVerified: boolean;
}

export interface AppNotification {
  id: string;
  userId?: string;
  targetRole?: UserRole;
  caseId?: string;
  title: string;
  message: string;
  type: 'status_update' | 'action_required' | 'sla_warning' | 'evidence_submitted' | 'objection_filed';
  createdAt: string;
  isRead: boolean;
  actionLink?: string;
}

export interface AiGateConfiguration {
  confidenceThresholdPercent: number; // Default 80
  alwaysRequireHumanVerificationOnEmergency: boolean;
  alwaysRequireHumanVerificationOnMultiDept: boolean;
  version: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ResponsibilityRule {
  id: string;
  ruleCode: string; // e.g. "R-12"
  title: string;
  assetType: string;
  wardId?: number;
  primaryDepartmentId: string;
  primaryDepartmentName: string;
  secondaryDepartmentId?: string;
  secondaryDepartmentName?: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  effectiveDate: string;
}
