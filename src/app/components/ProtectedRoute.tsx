import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // Temporarily allow access for testing
  // if (!isAuthenticated || !user) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (!allowedRoles.includes(user.role)) {
  //   // Redirect to dashboard if not authorized
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <>{children}</>;
};