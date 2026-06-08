import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../hooks/useAuthContext';
import type { UserRole } from '../types/auth.types';
import { getRoleHomePath } from '../utils/auth.utils';

export function useAuth() {
    const navigate = useNavigate();
    const auth = useAuthContext();

    const requireAuth = useCallback((redirectTo = '/login') => {
        if (auth.isLoading) {
            return false;
        }
        if (!auth.isAuthenticated) {
            navigate(redirectTo);
            return false;
        }
        return true;
    }, [auth.isAuthenticated, auth.isLoading, navigate]);

    const requireRole = useCallback((roles: UserRole[]) => {
        if (auth.isLoading) {
            return false;
        }
        if (!auth.isAuthenticated || !auth.user) {
            navigate('/login');
            return false;
        }
        if (!roles.includes(auth.user.role)) {
            navigate(getRoleHomePath(auth.user.role));
            return false;
        }
        return true;
    }, [auth.isAuthenticated, auth.isLoading, auth.user, navigate]);

    const redirectByRole = useCallback(() => {
        if (!auth.user) {
            navigate('/login');
            return;
        }
        navigate(getRoleHomePath(auth.user.role));
    }, [auth.user, navigate]);

    const isAdmin = auth.user?.role === 'super_admin';
    const isOwner = auth.user?.role === 'owner';
    const isCustomer = auth.user?.role === 'customer';

    return {
        ...auth,
        isAdmin,
        isOwner,
        isCustomer,
        requireAuth,
        requireRole,
        redirectByRole,
    };
}
