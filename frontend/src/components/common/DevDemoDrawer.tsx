import React from 'react';
import { useAuth, ROLE_SAMPLE_USERS } from '../../context/AuthContext';
import { useCases } from '../../context/CaseContext';
import { DEMO_ROLES } from '../../constants';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Code, X, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DevDemoDrawer: React.FC = () => {
  const { isDevDemoDrawerOpen, setDevDemoDrawerOpen, activeRole, loginAsRole } = useAuth();
  const { resetDemoData } = useCases();
  const navigate = useNavigate();

  if (!import.meta.env.DEV || !isDevDemoDrawerOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    loginAsRole(role);
    setDevDemoDrawerOpen(false);

    if (role === 'citizen') navigate('/');
    else if (role === 'ward_desk') navigate('/ward');
    else if (role === 'field_officer') navigate('/officer');
    else if (role === 'coordinator') navigate('/coordinator');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 text-slate-100 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-800">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Developer Demo Mode</h3>
                <span className="text-[10px] text-slate-400">অভ্যন্তরীণ ডেভেলপার ও কিউএ টুলিং</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDevDemoDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl my-4 text-xs text-amber-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>ডেভেলপমেন্ট টুলিং নোটিশ</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-normal">
              এই সুইচারটি শুধুমাত্র লোকাল টেস্টের জন্য। সাধারণ ভিজিটররা পাবলিক হোমপেজ ও লগইন ফ্লো দিয়ে প্রবেশ করবেন।
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              সরাসরি রোল টেস্টে প্রবেশ করুন:
            </span>
            {DEMO_ROLES.map(r => {
              const isActive = activeRole === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRoleSelect(r.role)}
                  className={`w-full flex items-start justify-between p-3 rounded-xl border text-left transition ${
                    isActive
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div>
                    <strong className="text-xs font-bold block text-white">{r.title}</strong>
                    <span className="text-[11px] text-slate-400">{r.subtitle}</span>
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => resetDemoData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ডেমো ডেটা রিসেট</span>
          </button>

          <button
            type="button"
            onClick={() => setDevDemoDrawerOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
