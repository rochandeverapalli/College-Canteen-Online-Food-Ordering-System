import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { currentUser, userProfile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-sm font-medium text-stone-500">Checking authentication...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-red-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Admin Access Required</h2>
        <p className="text-stone-600 text-sm mb-6">
          This portal is restricted to college canteen administrators and kitchen staff.
        </p>
        <div className="flex flex-col gap-3">
          <Navigate to="/profile" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
