import { Case, CaseStatus, DepartmentTask, CitizenObjection, MediaAttachment } from '../types';
import { getStoredCases, saveStoredCases, appendAuditLog } from './storage';

export const caseService = {
  getAllCases: async (): Promise<Case[]> => {
    return getStoredCases();
  },

  getCaseById: async (id: string): Promise<Case | undefined> => {
    const cases = getStoredCases();
    return cases.find(c => c.id === id || c.trackingNumber === id);
  },

  createCase: async (newCaseData: Omit<Case, 'id' | 'trackingNumber' | 'status' | 'submittedAt' | 'updatedAt' | 'tasks' | 'timeline'>): Promise<Case> => {
    const cases = getStoredCases();
    const caseIndexNumber = cases.length + 185;
    const caseId = `NS-2026-${String(caseIndexNumber).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const createdCase: Case = {
      ...newCaseData,
      id: caseId,
      trackingNumber: caseId,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      tasks: [
        {
          id: `tsk_${Date.now()}_1`,
          caseId: caseId,
          sequenceOrder: 1,
          departmentId: newCaseData.aiAnalysis.proposedDepartmentId,
          departmentName: newCaseData.aiAnalysis.proposedDepartmentName,
          title: `${newCaseData.aiAnalysis.categoryLabel} জরুরি প্রাথমিক পরিদর্শন ও ব্যবস্থা`,
          description: newCaseData.aiAnalysis.problemSummary,
          status: 'ready',
          slaTargetHours: newCaseData.priority === 'emergency' ? 12 : newCaseData.priority === 'high' ? 24 : 48,
          slaDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
          isOverdue: false
        }
      ],
      timeline: [
        {
          id: `tl_${Date.now()}_1`,
          caseId: caseId,
          timestamp: now,
          actorName: 'নাগরিক অ্যাপ (অটোমেটেড)',
          actorRole: 'citizen',
          actionTitle: 'অভিযোগ দাখিল ও অবস্থান নিশ্চিতকরণ',
          actionDescription: `নাগরিক ${newCaseData.location.wardName} এর ${newCaseData.location.address} স্থানে সমস্যা রিপোর্ট করেছেন।`,
          stage: 'submitted',
          badgeType: 'info'
        },
        {
          id: `tl_${Date.now()}_2`,
          caseId: caseId,
          timestamp: now,
          actorName: 'AI Triage Engine (M4)',
          actorRole: 'ward_desk',
          actionTitle: 'এআই বিশ্লেষণ ও দায়িত্ব প্রস্তাব',
          actionDescription: `AI ${newCaseData.aiAnalysis.proposedDepartmentName} এবং ${newCaseData.aiAnalysis.proposedPriority} অগ্রাধিকার প্রস্তাব করেছে (কনফিডেন্স ${newCaseData.aiAnalysis.confidenceScore}%)।`,
          stage: 'submitted',
          badgeType: 'info'
        }
      ]
    };

    saveStoredCases([createdCase, ...cases]);
    appendAuditLog({
      actorId: newCaseData.citizenId,
      actorName: 'নাগরিক (টোকেন-এনক্রিপ্টেড)',
      actorRole: 'citizen',
      action: 'CASE_CREATED',
      resourceType: 'case',
      resourceId: caseId,
      details: `নতুন কেস নিবন্ধিত: ${newCaseData.title}`,
      ipAddress: '103.140.24.12'
    });

    return createdCase;
  },

  verifyResponsibility: async (
    caseId: string,
    verifierName: string,
    departmentId: string,
    departmentName: string,
    isOverridden: boolean,
    overrideReason?: string
  ): Promise<Case | undefined> => {
    const cases = getStoredCases();
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return undefined;

    const now = new Date().toISOString();
    targetCase.status = 'verified';
    targetCase.updatedAt = now;
    targetCase.humanVerification = {
      verifiedBy: verifierName,
      verifiedAt: now,
      isOverridden,
      overrideReason,
      confirmedDepartmentId: departmentId,
      confirmedDepartmentName: departmentName
    };

    targetCase.timeline.push({
      id: `tl_${Date.now()}`,
      caseId,
      timestamp: now,
      actorName: verifierName,
      actorRole: 'ward_desk',
      actionTitle: isOverridden ? 'দায়িত্ব পরিবর্তন (ওভাররাইড)' : 'দায়িত্ব যাচাই ও নিশ্চিতকরণ',
      actionDescription: isOverridden
        ? `ওয়ার্ড ডেস্ক দায়িত্ব পরিবর্তন করে ${departmentName} নির্ধারণ করেছে। কারণ: ${overrideReason}`
        : `ওয়ার্ড ডেস্ক কর্মকর্তা এআই সুপারিশ যাচাই করে ${departmentName} কে দায়িত্ব প্রদান করেছেন।`,
      stage: 'verified',
      badgeType: isOverridden ? 'warning' : 'success'
    });

    saveStoredCases(cases);
    appendAuditLog({
      actorId: 'ward_desk_user',
      actorName: verifierName,
      actorRole: 'ward_desk',
      action: isOverridden ? 'RESPONSIBILITY_OVERRIDDEN' : 'RESPONSIBILITY_VERIFIED',
      resourceType: 'case',
      resourceId: caseId,
      details: isOverridden ? `ওভাররাইড কারণ: ${overrideReason}` : 'সুপারিশ অনুমোদিত',
      ipAddress: '192.168.12.44'
    });

    return targetCase;
  },

  approveMultiDeptSequence: async (
    caseId: string,
    coordinatorName: string,
    updatedTasks: DepartmentTask[]
  ): Promise<Case | undefined> => {
    const cases = getStoredCases();
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return undefined;

    const now = new Date().toISOString();
    targetCase.tasks = updatedTasks;
    targetCase.status = 'under_inspection';
    targetCase.updatedAt = now;

    targetCase.timeline.push({
      id: `tl_${Date.now()}`,
      caseId,
      timestamp: now,
      actorName: coordinatorName,
      actorRole: 'coordinator',
      actionTitle: 'বহু-বিভাগীয় ডিপেন্ডেন্সি সিকোয়েন্স অনুমোদিত',
      actionDescription: `সমন্বয়ক কর্তৃক ${updatedTasks.length}টি ধারাবাহিক কাজের অনুক্রম ও সময়সীমা অনুমোদন করা হয়েছে।`,
      stage: 'under_inspection',
      badgeType: 'info'
    });

    saveStoredCases(cases);
    appendAuditLog({
      actorId: 'coord_user',
      actorName: coordinatorName,
      actorRole: 'coordinator',
      action: 'MULTI_DEPT_SEQUENCE_APPROVED',
      resourceType: 'case',
      resourceId: caseId,
      details: `${updatedTasks.length} বিভাগের ওয়ার্ক-অর্ডার জারি`,
      ipAddress: '192.168.10.15'
    });

    return targetCase;
  },

  submitCitizenObjection: async (
    caseId: string,
    reasons: string[],
    notes?: string,
    evidencePhotoUrl?: string
  ): Promise<Case | undefined> => {
    const cases = getStoredCases();
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return undefined;

    const now = new Date().toISOString();
    const objection: CitizenObjection = {
      id: `obj_${Date.now()}`,
      caseId,
      submittedAt: now,
      reasons,
      notes,
      evidencePhotoUrl,
      status: 'pending_review'
    };

    targetCase.objection = objection;
    targetCase.status = 'reopened';
    targetCase.updatedAt = now;

    targetCase.timeline.push({
      id: `tl_${Date.now()}`,
      caseId,
      timestamp: now,
      actorName: 'নাগরিক',
      actorRole: 'citizen',
      actionTitle: 'নাগরিক আপত্তি দাখিল (কেস পুনরায় তদন্তে)',
      actionDescription: `সমাধানে অসন্তোষ: "${reasons.join(', ')}"${notes ? ' - ' + notes : ''}`,
      stage: 'reopened',
      badgeType: 'danger'
    });

    saveStoredCases(cases);
    appendAuditLog({
      actorId: targetCase.citizenId,
      actorName: 'নাগরিক',
      actorRole: 'citizen',
      action: 'CITIZEN_OBJECTION_FILED',
      resourceType: 'case',
      resourceId: caseId,
      details: `আপত্তির কারণ: ${reasons.join(', ')}`,
      ipAddress: '103.140.24.12'
    });

    return targetCase;
  },

  acceptResolutionAndClose: async (
    caseId: string,
    rating: number,
    feedback?: string
  ): Promise<Case | undefined> => {
    const cases = getStoredCases();
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return undefined;

    const now = new Date().toISOString();
    targetCase.status = 'closed';
    targetCase.updatedAt = now;
    targetCase.citizenSatisfactionRating = rating;
    targetCase.citizenFeedback = feedback;

    targetCase.timeline.push({
      id: `tl_${Date.now()}`,
      caseId,
      timestamp: now,
      actorName: 'নাগরিক ও সমন্বয়ক',
      actorRole: 'citizen',
      actionTitle: 'নাগরিক সম্মতি ও কেস চূড়ান্ত বন্ধ',
      actionDescription: `নাগরিক কাজ দেখে সন্তুষ্টি প্রকাশ করেছেন (${rating}/৫ স্টার) এবং কেস আনুষ্ঠানিকভাবে সমাপ্ত হয়েছে।`,
      stage: 'closed',
      badgeType: 'success'
    });

    saveStoredCases(cases);
    appendAuditLog({
      actorId: targetCase.citizenId,
      actorName: 'নাগরিক',
      actorRole: 'citizen',
      action: 'CASE_CLOSED_SATISFIED',
      resourceType: 'case',
      resourceId: caseId,
      details: `রেটিং: ${rating}/5, মন্তব্য: ${feedback || 'নাই'}`,
      ipAddress: '103.140.24.12'
    });

    return targetCase;
  }
};
