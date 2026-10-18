import { DepartmentTask, MediaAttachment, TaskStatus } from '../types';
import { getStoredCases, saveStoredCases, appendAuditLog } from './storage';

export const taskService = {
  getTasksForDepartment: async (departmentId?: string): Promise<DepartmentTask[]> => {
    const cases = getStoredCases();
    const allTasks: DepartmentTask[] = [];
    cases.forEach(c => {
      c.tasks.forEach(t => {
        if (!departmentId || t.departmentId === departmentId) {
          allTasks.push(t);
        }
      });
    });
    return allTasks;
  },

  updateTaskStatus: async (
    caseId: string,
    taskId: string,
    newStatus: TaskStatus,
    officerName: string,
    waitingReason?: string
  ): Promise<DepartmentTask | undefined> => {
    const cases = getStoredCases();
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return undefined;

    const task = targetCase.tasks.find(t => t.id === taskId);
    if (!task) return undefined;

    const now = new Date().toISOString();
    task.status = newStatus;
    if (waitingReason) task.waitingReason = waitingReason;
    if (newStatus === 'in_inspection' && !task.startedAt) task.startedAt = now;

    // Update overall case status if applicable
    if (newStatus === 'in_progress' && targetCase.status !== 'in_progress') {
      targetCase.status = 'in_progress';
    }

    targetCase.updatedAt = now;
    targetCase.timeline.push({
      id: `tl_${Date.now()}`,
      caseId,
      timestamp: now,
      actorName: officerName,
      actorRole: 'field_officer',
      actionTitle: `মাঠ টাস্ক আপডেট: ${task.title}`,
      actionDescription: waitingReason
        ? `কাজের অগ্রগতি স্থবির: ${waitingReason}`
        : `টাস্ক স্ট্যাটাস পরিবর্তিত: ${newStatus}`,
      stage: targetCase.status,
      badgeType: newStatus === 'in_progress' ? 'info' : 'warning'
    });

    saveStoredCases(cases);
    appendAuditLog({
      actorId: task.assignedOfficerId || 'officer',
      actorName: officerName,
      actorRole: 'field_officer',
      action: 'TASK_STATUS_UPDATED',
      resourceType: 'task',
      resourceId: taskId,
      details: `স্ট্যাটাস: ${newStatus}, কেস: ${caseId}`,
      ipAddress: '103.205.71.9'
    });

    return task;
  },

  submitTaskResolutionEvidence: async (
    caseId: string,
    taskId: string,
    officerName: string,
    evidence: MediaAttachment[],
    resolutionNotes: string
  ): Promise<DepartmentTask | undefined> => {
    const cases = getStoredCases();
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return undefined;

    const task = targetCase.tasks.find(t => t.id === taskId);
    if (!task) return undefined;

    const now = new Date().toISOString();
    task.status = 'resolved';
    task.resolvedAt = now;
    task.resolutionEvidence = evidence;
    task.resolutionNotes = resolutionNotes;
    delete task.waitingReason;

    // Check if subsequent dependent tasks can now be unlocked!
    targetCase.tasks.forEach(subsequentTask => {
      if (subsequentTask.prerequisiteTaskId === taskId && subsequentTask.status === 'pending_dependency') {
        subsequentTask.status = 'ready';
        delete subsequentTask.waitingReason;
      }
    });

    // If all tasks for the case are resolved, move case to resolved_pending_citizen!
    const allResolved = targetCase.tasks.every(t => t.status === 'resolved');
    if (allResolved) {
      targetCase.status = 'resolved_pending_citizen';
    }

    targetCase.updatedAt = now;
    targetCase.timeline.push({
      id: `tl_${Date.now()}`,
      caseId,
      timestamp: now,
      actorName: officerName,
      actorRole: 'field_officer',
      actionTitle: `মাঠ কাজ সম্পন্ন ও প্রমাণ আপলোড (${task.departmentName})`,
      actionDescription: `${resolutionNotes} (ছবি/ভিডিও প্রমাণ সংযুক্ত)।`,
      stage: targetCase.status,
      badgeType: 'success',
      media: evidence
    });

    saveStoredCases(cases);
    appendAuditLog({
      actorId: task.assignedOfficerId || 'officer',
      actorName: officerName,
      actorRole: 'field_officer',
      action: 'TASK_RESOLUTION_SUBMITTED',
      resourceType: 'task',
      resourceId: taskId,
      details: `সমাধান প্রমাণ জমা: ${resolutionNotes}`,
      ipAddress: '103.205.71.9'
    });

    return task;
  }
};
