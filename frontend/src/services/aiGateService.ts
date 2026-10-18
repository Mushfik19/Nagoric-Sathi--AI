import { AuditLogEntry, AppNotification, AiGateConfiguration, ResponsibilityRule } from '../types';
import {
  getStoredAuditLogs,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredAiGate,
  saveStoredAiGate,
  getStoredRules,
  saveStoredRules,
  appendAuditLog
} from './storage';

export const auditService = {
  getLogs: async (): Promise<AuditLogEntry[]> => {
    return getStoredAuditLogs();
  }
};

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    return getStoredNotifications();
  },

  markAsRead: async (notifId: string): Promise<void> => {
    const notifs = getStoredNotifications();
    const updated = notifs.map(n => (n.id === notifId ? { ...n, isRead: true } : n));
    saveStoredNotifications(updated);
  },

  markAllAsRead: async (): Promise<void> => {
    const notifs = getStoredNotifications();
    const updated = notifs.map(n => ({ ...n, isRead: true }));
    saveStoredNotifications(updated);
  }
};

export const aiGateService = {
  getConfig: async (): Promise<AiGateConfiguration> => {
    return getStoredAiGate();
  },

  updateConfig: async (newConfig: AiGateConfiguration, adminName: string): Promise<void> => {
    const configWithMeta: AiGateConfiguration = {
      ...newConfig,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName
    };
    saveStoredAiGate(configWithMeta);
    appendAuditLog({
      actorId: 'admin_user',
      actorName: adminName,
      actorRole: 'admin',
      action: 'AI_GATE_THRESHOLD_CHANGED',
      resourceType: 'ai_gate',
      resourceId: 'gate_global_01',
      details: `এআই রাউটিং থ্রেশহোল্ড পরিবর্তিত: ${newConfig.confidenceThresholdPercent}%`,
      ipAddress: '192.168.1.1'
    });
  },

  getRules: async (): Promise<ResponsibilityRule[]> => {
    return getStoredRules();
  },

  saveRules: async (rules: ResponsibilityRule[], adminName: string): Promise<void> => {
    saveStoredRules(rules);
    appendAuditLog({
      actorId: 'admin_user',
      actorName: adminName,
      actorRole: 'admin',
      action: 'RESPONSIBILITY_RULES_UPDATED',
      resourceType: 'rule',
      resourceId: 'rules_set',
      details: `দায়িত্ব নীতিমালা আপডেট ও সংস্করণ সংরক্ষণ`,
      ipAddress: '192.168.1.1'
    });
  }
};
