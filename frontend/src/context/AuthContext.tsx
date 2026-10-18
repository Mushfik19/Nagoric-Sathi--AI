import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';

export const ROLE_SAMPLE_USERS: Record<UserRole, User> = {
  citizen: {
    id: 'cit_01',
    name: 'আব্দুল্লাহ আল মামুন',
    phone: '01712-345678',
    role: 'citizen',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  ward_desk: {
    id: 'ward_12_officer',
    name: 'কামরুল হাসান',
    role: 'ward_desk',
    wardId: 12,
    wardName: 'ওয়ার্ড ১২',
    designation: 'ওয়ার্ড সেবা কেন্দ্র ডেস্ক অফিসার',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
  },
  field_officer: {
    id: 'off_drain_01',
    name: 'প্রকৌশলী তানভীর আহমেদ',
    role: 'field_officer',
    departmentId: 'dept_drainage',
    departmentName: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
    designation: 'সহকারী প্রকৌশলী (ফিল্ড অপারেশন)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  coordinator: {
    id: 'coord_01',
    name: 'মাহমুদুল হক',
    role: 'coordinator',
    designation: 'প্রধান সমন্বয় কর্মকর্তা (সেন্ট্রাল কমান্ড)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  admin: {
    id: 'admin_01',
    name: 'মোছাঃ নাসরিন সুলতানা',
    role: 'admin',
    designation: 'সিস্টেম অ্যাডমিনিস্ট্রেটর ও সিটি গভর্ন্যান্স হেড',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User;
  activeRole: UserRole | null;
  loginAsRole: (role: UserRole, identifier?: string) => void;
  loginAs: (role: UserRole, identifier?: string) => void;
  setDemoRole: (role: UserRole) => void;
  logout: () => void;
  isDevDemoDrawerOpen: boolean;
  setDevDemoDrawerOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nagorik_sathi_session_v2';
const DEMO_MODE = import.meta.env.DEV;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = DEMO_MODE ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    return DEMO_MODE && !!saved;
  });

  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    const saved = DEMO_MODE ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    if (DEMO_MODE && saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.role || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = DEMO_MODE ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    if (DEMO_MODE && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user) return parsed.user;
      } catch {
        // fallback
      }
    }
    return ROLE_SAMPLE_USERS.citizen;
  });

  const [isDevDemoDrawerOpen, setDevDemoDrawerOpen] = useState(false);

  const loginAsRole = (role: UserRole, identifier?: string) => {
    if (!DEMO_MODE) return;
    const baseUser = { ...ROLE_SAMPLE_USERS[role] };
    if (identifier) {
      if (identifier.includes('@')) {
        baseUser.email = identifier;
      } else {
        baseUser.phone = identifier;
      }
    }

    setIsAuthenticated(true);
    setActiveRole(role);
    setCurrentUser(baseUser);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: true,
        role,
        user: baseUser,
        loggedInAt: new Date().toISOString()
      })
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveRole(null);
    setCurrentUser(ROLE_SAMPLE_USERS.citizen);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        activeRole,
        loginAsRole,
        loginAs: loginAsRole,
        setDemoRole: loginAsRole,
        logout,
        isDevDemoDrawerOpen,
        setDevDemoDrawerOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
