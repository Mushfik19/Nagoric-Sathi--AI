import {
  Case,
  VerifiedServiceKnowledge,
  HotspotZone,
  DuplicateCandidate,
  AuditLogEntry,
  AppNotification,
  AiGateConfiguration,
  ResponsibilityRule
} from '../types';
import {
  INITIAL_CASES,
  INITIAL_SERVICES,
  INITIAL_HOTSPOTS,
  INITIAL_DUPLICATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_GATE,
  INITIAL_RULES
} from '../mocks/initialData';

const STORAGE_KEYS = {
  CASES: 'nagorik_sathi_cases_v1',
  SERVICES: 'nagorik_sathi_services_v1',
  HOTSPOTS: 'nagorik_sathi_hotspots_v1',
  DUPLICATES: 'nagorik_sathi_duplicates_v1',
  AUDIT_LOGS: 'nagorik_sathi_audit_logs_v1',
  NOTIFICATIONS: 'nagorik_sathi_notifications_v1',
  AI_GATE: 'nagorik_sathi_ai_gate_v1',
  RULES: 'nagorik_sathi_rules_v1',
  ACTIVE_ROLE: 'nagorik_sathi_active_role_v1'
};

export const getStoredCases = (): Case[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CASES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    return INITIAL_CASES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CASES;
  }
};

export const saveStoredCases = (cases: Case[]): void => {
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
};

export const getStoredServices = (): VerifiedServiceKnowledge[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SERVICES;
  }
};

export const getStoredHotspots = (): HotspotZone[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HOTSPOTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(INITIAL_HOTSPOTS));
    return INITIAL_HOTSPOTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_HOTSPOTS;
  }
};

export const getStoredDuplicates = (): DuplicateCandidate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DUPLICATES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.DUPLICATES, JSON.stringify(INITIAL_DUPLICATES));
    return INITIAL_DUPLICATES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DUPLICATES;
  }
};

export const saveStoredDuplicates = (duplicates: DuplicateCandidate[]): void => {
  localStorage.setItem(STORAGE_KEYS.DUPLICATES, JSON.stringify(duplicates));
};

export const getStoredAuditLogs = (): AuditLogEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
};

export const appendAuditLog = (log: Omit<AuditLogEntry, 'id' | 'timestamp' | 'isImmutableVerified'>): void => {
  const logs = getStoredAuditLogs();
  const newEntry: AuditLogEntry = {
    ...log,
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    isImmutableVerified: true
  };
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newEntry, ...logs]));
};

export const getStoredNotifications = (): AppNotification[] => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveStoredNotifications = (notifs: AppNotification[]): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
};

export const getStoredAiGate = (): AiGateConfiguration => {
  const data = localStorage.getItem(STORAGE_KEYS.AI_GATE);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.AI_GATE, JSON.stringify(INITIAL_AI_GATE));
    return INITIAL_AI_GATE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_AI_GATE;
  }
};

export const saveStoredAiGate = (config: AiGateConfiguration): void => {
  localStorage.setItem(STORAGE_KEYS.AI_GATE, JSON.stringify(config));
};

export const getStoredRules = (): ResponsibilityRule[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RULES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(INITIAL_RULES));
    return INITIAL_RULES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_RULES;
  }
};

export const saveStoredRules = (rules: ResponsibilityRule[]): void => {
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
};

export const resetAllDemoData = (): void => {
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
  localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(INITIAL_HOTSPOTS));
  localStorage.setItem(STORAGE_KEYS.DUPLICATES, JSON.stringify(INITIAL_DUPLICATES));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.AI_GATE, JSON.stringify(INITIAL_AI_GATE));
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(INITIAL_RULES));
};
