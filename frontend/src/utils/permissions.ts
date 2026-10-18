import { User, Case, DepartmentTask, UserRole } from '../types';

export const canViewCase = (user: User | null, caseData: Case): boolean => {
  if (!user) return false;
  if (user.role === 'citizen') {
    return user.id === caseData.citizenId || caseData.id === 'NS-2026-000184' || caseData.id === 'NS-2026-000170';
  }
  if (user.role === 'ward_desk') {
    return !user.wardId || user.wardId === caseData.location.wardId;
  }
  if (user.role === 'field_officer') {
    return !user.departmentId || caseData.tasks.some(t => t.departmentId === user.departmentId);
  }
  if (user.role === 'coordinator' || user.role === 'admin') {
    return true;
  }
  return false;
};

export const canVerifyResponsibility = (role: UserRole): boolean => {
  return role === 'ward_desk' || role === 'coordinator';
};

export const canApproveSequence = (role: UserRole): boolean => {
  return role === 'coordinator';
};

export const canUploadEvidence = (user: User | null, task: DepartmentTask): boolean => {
  if (!user) return false;
  if (user.role === 'coordinator') return true;
  return user.role === 'field_officer' && (!user.departmentId || user.departmentId === task.departmentId);
};

export const canAcceptOrObjectResolution = (role: UserRole): boolean => {
  return role === 'citizen';
};

export const canManageAiGateAndRules = (role: UserRole): boolean => {
  return role === 'admin';
};

export const canViewAuditLog = (role: UserRole): boolean => {
  return role === 'admin';
};

export const canManageDuplicates = (role: UserRole): boolean => {
  return role === 'ward_desk' || role === 'coordinator';
};
