import React from 'react';
import { PriorityLevel, CaseStatus, TaskStatus } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../constants';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  showIcon?: boolean;
}

const LIGHT_PRIORITY_STYLES: Record<PriorityLevel, { color: string; bg: string; border: string }> = {
  emergency: { color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
  high: { color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  medium: { color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  low: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  const style = LIGHT_PRIORITY_STYLES[priority] || LIGHT_PRIORITY_STYLES.low;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        borderColor: style.border
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: CaseStatus | TaskStatus;
}

const LIGHT_STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  submitted: { label: 'রিপোর্ট জমা হয়েছে', color: '#374151', bg: '#f3f4f6', border: '#e5e7eb' },
  verified: { label: 'দায়িত্ব যাচাই সম্পন্ন', color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  under_inspection: { label: 'মাঠ পর্যায়ে পরিদর্শন চলছে', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  in_progress: { label: 'কাজ চলছে', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  resolved_pending_citizen: { label: 'সমাধান হয়েছে (প্রমাণ আপলোডকৃত)', color: '#15803d', bg: '#ecfdf5', border: '#a7f3d0' },
  closed: { label: 'চূড়ান্তভাবে বন্ধ', color: '#1f2937', bg: '#f3f4f6', border: '#d1d5db' },
  reopened: { label: 'পুনরায় তদন্তে প্রেরিত', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
  merged: { label: 'সংযুক্ত (ডুপ্লিকেট)', color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' },
  // Task status
  pending_dependency: { label: 'পূর্বশর্ত অপেক্ষমাণ', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  ready: { label: 'কাজের জন্য প্রস্তুত', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  in_inspection: { label: 'পরিদর্শনে', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  resolved: { label: 'কাজ সম্পন্ন', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  rejected: { label: 'বাতিলকৃত', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isCaseStatus = status in STATUS_CONFIG;
  const label = isCaseStatus ? STATUS_CONFIG[status as CaseStatus]?.label : status;
  const styleConf = LIGHT_STATUS_STYLES[status] || {
    label: label || status,
    color: '#374151',
    bg: '#f3f4f6',
    border: '#e5e7eb'
  };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-xs"
      style={{
        backgroundColor: styleConf.bg,
        color: styleConf.color,
        borderColor: styleConf.border
      }}
    >
      {styleConf.label || label}
    </span>
  );
};
