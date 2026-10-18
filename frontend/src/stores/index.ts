import {
  getStoredCases,
  saveStoredCases,
  getStoredServices,
  getStoredHotspots,
  getStoredDuplicates,
  getStoredAuditLogs,
  getStoredNotifications,
  getStoredAiGate,
  saveStoredAiGate,
  getStoredRules,
  saveStoredRules,
  resetAllDemoData,
} from '../services/storage';

export const appStore = {
  getCases: getStoredCases,
  saveCases: saveStoredCases,
  getServices: getStoredServices,
  getHotspots: getStoredHotspots,
  getDuplicates: getStoredDuplicates,
  getAuditLogs: getStoredAuditLogs,
  getNotifications: getStoredNotifications,
  getAiGate: getStoredAiGate,
  saveAiGate: saveStoredAiGate,
  getRules: getStoredRules,
  saveRules: saveStoredRules,
  resetDemoData: resetAllDemoData,
};

export default appStore;
