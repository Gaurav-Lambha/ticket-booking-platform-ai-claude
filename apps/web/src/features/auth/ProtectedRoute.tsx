import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import type { UserRole } from '@repo/types';
import { useAuthStore } from './authStore.ts';

interface ProtectedRouteProps {
  roles?: UserRole[];
  children?: ReactNode;
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
