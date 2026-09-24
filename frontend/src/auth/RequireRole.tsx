import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '@/lib/types';
import { homeFor } from './AuthProvider';
import { useAuth } from './useAuth';
import { PageLoader } from '@/ui/Loader';

/** Gate for signed-in areas. Unknown visitors go to sign-in and come back afterwards. */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
