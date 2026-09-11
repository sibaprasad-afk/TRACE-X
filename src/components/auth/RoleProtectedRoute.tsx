import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { AccessDenied } from './AccessDenied';

interface RoleProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  children
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12 bg-[#060913]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
            Verifying Clearance...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied requiredRole={allowedRoles} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
