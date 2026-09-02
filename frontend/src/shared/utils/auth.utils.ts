import type { UserRole } from '../types/auth.types';

export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

export function getRoleHomePath(role: UserRole): string {
    switch (role) {
        case 'owner':
            return '/owner/dashboard';
        case 'customer':
            return '/home';
        default:
            return '/login';
    }
}

export function clearAuthStorage(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}
