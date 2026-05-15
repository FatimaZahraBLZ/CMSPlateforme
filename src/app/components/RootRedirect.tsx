import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth restore
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">
          Restoring session...
        </div>
      </div>
    );
  }

  // Logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not logged in
  return <Navigate to="/login" replace />;
};