import React from 'react';
import { CaseStatus } from '../../types';

interface StatusPillProps {
  status: CaseStatus | string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  submitted: {
    label: 'জমা হয়েছে',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  verified: {
    label: 'যাচাই হয়েছে',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  under_inspection: {
    label: 'পরিদর্শন চলছে',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  in_progress: {
    label: 'কাজ চলছে',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  resolved_pending_citizen: {
    label: 'সমাধান - প্রমাণ আপলোডকৃত',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-300',
  },
  closed: {
    label: 'চূড়ান্ত বন্ধ (Closed)',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
  },
  reopened: {
    label: 'পুনরায় খোলা (Objection)',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-300',
  },
  merged: {
    label: 'ডুপ্লিকেট মার্জড',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-semibold';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
};
