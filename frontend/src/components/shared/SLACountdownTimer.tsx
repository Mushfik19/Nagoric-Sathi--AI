import React from 'react';
import { toBanglaNumber } from '../../utils/formatters';

interface SLACountdownTimerProps {
  deadline: string;
  isBreached?: boolean;
}

export const SLACountdownTimer: React.FC<SLACountdownTimerProps> = ({
  deadline,
  isBreached = false,
}) => {
  const targetDate = new Date(deadline).getTime();
  const now = new Date().getTime();
  const diffMs = targetDate - now;

  if (isBreached || diffMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        SLA লঙ্ঘন (Breached)
      </span>
    );
  }

  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const isWarning = hoursRemaining < 4;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isWarning
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
      />
      বাকি: {toBanglaNumber(hoursRemaining)} ঘণ্টা {toBanglaNumber(minutesRemaining)} মিনিট
    </span>
  );
};
