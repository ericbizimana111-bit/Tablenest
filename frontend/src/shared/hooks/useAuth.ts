import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types/auth.types';

export function useAuth() {
    const navigate = useNavigate();
    const { user, token, isAuthenticated, isLoading, login, register, logout } = useAuthStore();

    const requireAuth = useCallback((redirectTo = '/login') => {
        if (!isAuthenticated) {
            navigate(redirectTo);
            return false;
        }
        return true;
    }, [isAuthenticated, navigate]);

    const requireRole = useCallback((roles: UserRole[]) => {
        if (!isAuthenticated) { navigate('/login'); return false; }
        if (!user || !roles.includes(user.role)) {
            if (user?.role === 'super_admin') navigate('/admin');
            else if (user?.role === 'owner') navigate('/owner');
            else navigate('/home');
            return false;
        }
        return true;
    }, [isAuthenticated, user, navigate]);

    const redirectByRole = useCallback(() => {
        if (!user) { navigate('/login'); return; }
        if (user.role === 'super_admin') navigate('/admin');
        else if (user.role === 'owner') navigate('/owner');
        else navigate('/home');
    }, [user, navigate]);

    const isAdmin = user?.role === 'super_admin';
    const isOwner = user?.role === 'owner';
    const isCustomer = user?.role === 'customer';

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        isAdmin,
        isOwner,
        isCustomer,
        login,
        register,
        logout,
        requireAuth,
        requireRole,
        redirectByRole,
    };
}