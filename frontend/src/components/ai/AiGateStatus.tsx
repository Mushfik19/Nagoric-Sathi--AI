import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface AiGateStatusProps {
  confidence: number;
  threshold?: number;
}

export const AiGateStatus: React.FC<AiGateStatusProps> = ({ confidence, threshold = 80 }) => {
  const passed = confidence >= threshold;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
        passed
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : 'bg-amber-50 text-amber-800 border-amber-300'
      }`}
    >
      {passed ? (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>গেটিং পাশ ({confidence}% ≥ {threshold}%)</span>
        </>
      ) : (
        <>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>মানব যাচাই আবশ্যক ({confidence}% &lt; {threshold}%)</span>
        </>
      )}
    </div>
  );
};
