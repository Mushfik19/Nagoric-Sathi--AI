import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastItem = { id, type, title, message };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const showSuccess = (title: string, message?: string) => showToast('success', title, message);
  const showError = (title: string, message?: string) => showToast('error', title, message);
  const showWarning = (title: string, message?: string) => showToast('warning', title, message);
  const showInfo = (title: string, message?: string) => showToast('info', title, message);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          const config = {
            success: {
              borderClass: 'border-l-4 border-l-emerald-600 dark:border-l-emerald-400 border-[var(--line)]',
              badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
              icon: <CheckCircle2 className="w-5 h-5" />
            },
            warning: {
              borderClass: 'border-l-4 border-l-amber-500 dark:border-l-amber-400 border-[var(--line)]',
              badgeClass: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              icon: <AlertTriangle className="w-5 h-5" />
            },
            error: {
              borderClass: 'border-l-4 border-l-red-600 dark:border-l-red-400 border-[var(--line)]',
              badgeClass: 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
              icon: <AlertCircle className="w-5 h-5" />
            },
            info: {
              borderClass: 'border-l-4 border-l-[var(--green)] dark:border-l-[var(--green)] border-[var(--line)]',
              badgeClass: 'bg-[var(--green-light)] text-[var(--green)] border-[var(--line)]',
              icon: <Info className="w-5 h-5" />
            }
          };

          const current = config[toast.type];

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xl bg-[var(--paper)] text-[var(--ink)] backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${current.borderClass}`}
            >
              <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${current.badgeClass}`}>
                {current.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--ink)] leading-snug">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-[var(--muted)] font-medium mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)] p-1 rounded-lg transition cursor-pointer shrink-0"
                aria-label="বার্তা বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
