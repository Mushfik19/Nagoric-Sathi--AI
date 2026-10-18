import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-[#382326] border border-red-200 dark:border-[#71434a] text-red-600 dark:text-[#c66e60] flex items-center justify-center mx-auto shadow-xl">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-light text-[var(--ink)]">
          অননুমোদিত প্রবেশাধিকার <strong className="font-semibold text-red-600 dark:text-[#c66e60]">(Access Restricted)</strong>
        </h1>
        <p className="text-xs text-[var(--muted)]">
          বর্তমান ভূমিকা <strong className="text-[var(--gold)] font-mono">({currentUser?.role || 'অতিথি'})</strong> দিয়ে এই পেজটি ব্যবহারের অনুমতি নেই।
        </p>
      </div>

      <div className="p-4 bg-[var(--paper)] rounded-2xl border border-[var(--line)] text-xs text-[var(--muted)] leading-relaxed shadow-sm">
        সিস্টেমের উপরের মেন্যু থেকে উপযুক্ত রোল নির্বাচন করুন অথবা পাবলিক হোম পেজে ফিরে যান।
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow transition cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>হোম পেজে ফিরুন</span>
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] border border-[var(--line)] text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          <span>রোল পরিবর্তন করুন</span>
        </Link>
      </div>
    </div>
  );
};
