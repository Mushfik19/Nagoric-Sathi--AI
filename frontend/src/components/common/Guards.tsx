import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // When a citizen tries to access a protected action (like /report or /cases),
    // redirect them directly to Citizen Login, NOT the internal admin role grid!
    return <Navigate to="/login/citizen" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, activeRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!activeRole || !allowedRoles.includes(activeRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
