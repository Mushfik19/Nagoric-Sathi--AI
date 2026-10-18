import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, PlusCircle, FileText, MapPin, Layers, Wrench, Shield } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeRole } = useAuth();
  const location = useLocation();

  if (activeRole === 'admin') {
    return null; // Admin uses desktop sidebar primarily
  }

  const getMobileTabs = () => {
    switch (activeRole) {
      case 'ward_desk':
        return [
          { label: 'ড্যাশবোর্ড', path: '/ward', icon: <Layers className="w-5 h-5" /> },
          { label: 'যাচাই কিউ', path: '/ward/verification', icon: <Shield className="w-5 h-5" /> },
          { label: 'ম্যাপ', path: '/map', icon: <MapPin className="w-5 h-5" /> },
          { label: 'ডুপ্লিকেট', path: '/ward/duplicates', icon: <FileText className="w-5 h-5" /> }
        ];
      case 'field_officer':
        return [
          { label: 'আমার কাজ', path: '/officer', icon: <Wrench className="w-5 h-5" /> },
          { label: 'ম্যাপ', path: '/map', icon: <MapPin className="w-5 h-5" /> },
          { label: 'বিজ্ঞপ্তি', path: '/notifications', icon: <FileText className="w-5 h-5" /> }
        ];
      case 'coordinator':
        return [
          { label: 'কমান্ড', path: '/coordinator', icon: <Layers className="w-5 h-5" /> },
          { label: 'হটস্পট', path: '/coordinator/hotspots', icon: <MapPin className="w-5 h-5" /> },
          { label: 'এসএলএ', path: '/coordinator/escalations', icon: <Shield className="w-5 h-5" /> }
        ];
      default: // citizen
        return [
          { label: 'হোম', path: '/', icon: <Home className="w-5 h-5" /> },
          { label: 'অভিযোগ', path: '/cases', icon: <FileText className="w-5 h-5" /> },
          { label: 'সমস্যা জানান', path: '/report', icon: <PlusCircle className="w-6 h-6 text-emerald-600" />, isFab: true },
          { label: 'ম্যাপ', path: '/map', icon: <MapPin className="w-5 h-5" /> },
          { label: 'সেবাসমূহ', path: '/services', icon: <Layers className="w-5 h-5" /> }
        ];
    }
  };

  const tabs = getMobileTabs();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          if (tab.isFab) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg border-4 border-white transition transform active:scale-95">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 mt-0.5">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
