import React, { createContext, useContext, useState, useEffect } from 'react';
import { Case, DepartmentTask, TaskStatus, MediaAttachment } from '../types';
import { caseService } from '../services/caseService';
import { taskService } from '../services/taskService';
import { resetAllDemoData } from '../services/storage';
import { useToast } from './ToastContext';

interface CaseContextType {
  cases: Case[];
  activeCase: Case | null;
  loading: boolean;
  refreshCases: () => Promise<void>;
  getCase: (id: string) => Case | undefined;
  createNewCase: (caseData: Omit<Case, 'id' | 'trackingNumber' | 'status' | 'submittedAt' | 'updatedAt' | 'tasks' | 'timeline'>) => Promise<Case>;
  verifyCaseResponsibility: (
    caseId: string,
    verifierName: string,
    departmentId: string,
    departmentName: string,
    isOverridden: boolean,
    overrideReason?: string
  ) => Promise<void>;
  approveSequence: (caseId: string, coordinatorName: string, tasks: DepartmentTask[]) => Promise<void>;
  updateTask: (caseId: string, taskId: string, status: TaskStatus, officerName: string, waitingReason?: string) => Promise<void>;
  submitProof: (caseId: string, taskId: string, officerName: string, evidence: MediaAttachment[], notes: string) => Promise<void>;
  submitObjection: (caseId: string, reasons: string[], notes?: string, photoUrl?: string) => Promise<void>;
  acceptResolution: (caseId: string, rating: number, feedback?: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showSuccess, showError, showInfo } = useToast();

  const refreshCases = async () => {
    try {
      setLoading(true);
      const data = await caseService.getAllCases();
      setCases(data);
    } catch {
      showError('ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCases();
  }, []);

  const getCase = (id: string) => {
    return cases.find(c => c.id === id || c.trackingNumber === id);
  };

  const createNewCase = async (
    caseData: Omit<Case, 'id' | 'trackingNumber' | 'status' | 'submittedAt' | 'updatedAt' | 'tasks' | 'timeline'>
  ): Promise<Case> => {
    const created = await caseService.createCase(caseData);
    await refreshCases();
    showSuccess('অভিযোগ সফলভাবে নিবন্ধিত হয়েছে', `কেস আইডি: ${created.id}`);
    return created;
  };

  const verifyCaseResponsibility = async (
    caseId: string,
    verifierName: string,
    departmentId: string,
    departmentName: string,
    isOverridden: boolean,
    overrideReason?: string
  ) => {
    await caseService.verifyResponsibility(caseId, verifierName, departmentId, departmentName, isOverridden, overrideReason);
    await refreshCases();
    showSuccess(
      isOverridden ? 'দায়িত্ব ওভাররাইড সফল হয়েছে' : 'দায়িত্ব নিশ্চিত করা হয়েছে',
      `${departmentName} কে দায়িত্ব প্রদান করা হয়েছে`
    );
  };

  const approveSequence = async (caseId: string, coordinatorName: string, tasks: DepartmentTask[]) => {
    await caseService.approveMultiDeptSequence(caseId, coordinatorName, tasks);
    await refreshCases();
    showSuccess('বহু-বিভাগীয় কার্য-অনুক্রম অনুমোদিত', `${tasks.length}টি ধারাবাহিক টাস্কের ওয়ার্ক-অর্ডার সক্রিয়`);
  };

  const updateTask = async (
    caseId: string,
    taskId: string,
    status: TaskStatus,
    officerName: string,
    waitingReason?: string
  ) => {
    await taskService.updateTaskStatus(caseId, taskId, status, officerName, waitingReason);
    await refreshCases();
    showInfo('টাস্ক স্ট্যাটাস আপডেট হয়েছে', waitingReason ? `কারণ: ${waitingReason}` : `নতুন অবস্থা: ${status}`);
  };

  const submitProof = async (
    caseId: string,
    taskId: string,
    officerName: string,
    evidence: MediaAttachment[],
    notes: string
  ) => {
    await taskService.submitTaskResolutionEvidence(caseId, taskId, officerName, evidence, notes);
    await refreshCases();
    showSuccess('সমাধান প্রমাণ সফলভাবে আপলোড হয়েছে', 'পরবর্তী ডিপেন্ডেন্ট টাস্ক বা নাগরিক মতামতের জন্য উন্মুক্ত');
  };

  const submitObjection = async (caseId: string, reasons: string[], notes?: string, photoUrl?: string) => {
    await caseService.submitCitizenObjection(caseId, reasons, notes, photoUrl);
    await refreshCases();
    showSuccess('আপনার আপত্তি গৃহীত হয়েছে', 'কেসটি পুনরায় তদন্ত ও পর্যালোচনার জন্য সংশ্লিষ্ট বিভাগে পাঠানো হয়েছে');
  };

  const acceptResolution = async (caseId: string, rating: number, feedback?: string) => {
    await caseService.acceptResolutionAndClose(caseId, rating, feedback);
    await refreshCases();
    showSuccess('ধন্যবাদ! আপনার মতামত গৃহীত হয়েছে', 'কেসটি সফলভাবে চূড়ান্ত সমাপ্ত হিসেবে বন্ধ করা হলো');
  };

  const resetDemoData = async () => {
    resetAllDemoData();
    await refreshCases();
    showInfo('ডেমো ডেটা রিসেট হয়েছে', 'প্রাথমিক স্ট্যান্ডার্ড অবস্থায় ফিরে এসেছে');
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        activeCase,
        loading,
        refreshCases,
        getCase,
        createNewCase,
        verifyCaseResponsibility,
        approveSequence,
        updateTask,
        submitProof,
        submitObjection,
        acceptResolution,
        resetDemoData
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCases = (): CaseContextType => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
};
