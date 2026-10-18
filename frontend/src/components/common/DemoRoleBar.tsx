import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCases } from '../../context/CaseContext';
import { DEMO_ROLES } from '../../constants';
import { UserRole } from '../../types';
import { UserCheck, RefreshCw, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoRoleBar: React.FC = () => {
  const { activeRole, setDemoRole, currentUser } = useAuth();
  const { resetDemoData } = useCases();
  const navigate = useNavigate();

  const handleRoleChange = (role: UserRole) => {
    setDemoRole(role);
    if (role === 'citizen') navigate('/');
    else if (role === 'ward_desk') navigate('/ward');
    else if (role === 'field_officer') navigate('/officer');
    else if (role === 'coordinator') navigate('/coordinator');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 sticky top-0 z-[100] px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            ডেমো মোড (Interactive Demo)
          </span>
          <span className="hidden md:inline text-slate-400">
            বর্তমান সক্রিয় ভূমিকা: <strong className="text-white font-medium">{currentUser.name}</strong> ({currentUser.designation || currentUser.role})
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-400 hidden sm:inline mr-1">রোল পরিবর্তন:</span>
          {DEMO_ROLES.map(r => {
            const isActive = activeRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => handleRoleChange(r.role)}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={r.subtitle}
              >
                {r.title.split(' ')[0]}
              </button>
            );
          })}

          <button
            onClick={() => resetDemoData()}
            className="flex items-center gap-1 ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition border border-slate-700"
            title="ডেমো ডেটা রিসেট করুন"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline">রিসেট ডেটা</span>
          </button>
        </div>
      </div>
    </div>
  );
};
