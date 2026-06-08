import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth.types';
import { getRoleHomePath } from '../../utils/auth.utils';
import { Spinner } from '../ui/index';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
    children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#FAF7F5',
            }}>
                <Spinner />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getRoleHomePath(user.role)} replace />;
    }

    if (children) {
        return <>{children}</>;
    }

    return <Outlet />;
}
