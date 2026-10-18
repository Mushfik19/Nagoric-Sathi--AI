import { VerifiedServiceKnowledge } from '../types';
import { getStoredServices } from './storage';

export const serviceKnowledgeService = {
  getAllServices: async (): Promise<VerifiedServiceKnowledge[]> => {
    return getStoredServices();
  },

  getServiceById: async (id: string): Promise<VerifiedServiceKnowledge | undefined> => {
    const services = getStoredServices();
    return services.find(s => s.id === id || s.code === id);
  },

  evaluateApplicationReadiness: (
    service: VerifiedServiceKnowledge,
    uploadedDocIds: string[]
  ): {
    isReady: boolean;
    percentage: number;
    mandatoryMissing: string[];
    optionalMissing: string[];
  } => {
    const mandatoryDocs = service.requiredDocuments.filter(d => d.mandatory);
    const optionalDocs = service.requiredDocuments.filter(d => !d.mandatory);

    const mandatoryMissing = mandatoryDocs
      .filter(d => !uploadedDocIds.includes(d.id))
      .map(d => d.name);

    const optionalMissing = optionalDocs
      .filter(d => !uploadedDocIds.includes(d.id))
      .map(d => d.name);

    const totalCount = service.requiredDocuments.length;
    const uploadedCount = uploadedDocIds.length;
    const percentage = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 100;

    return {
      isReady: mandatoryMissing.length === 0,
      percentage: Math.min(percentage, 100),
      mandatoryMissing,
      optionalMissing
    };
  }
};
