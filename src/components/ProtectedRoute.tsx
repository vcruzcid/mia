import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Check for demo authentication
  const isDemoAuth = localStorage.getItem('demo_auth') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Spinner size="lg" className="border-red-500" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated && !isDemoAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && (isAuthenticated || isDemoAuth)) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}