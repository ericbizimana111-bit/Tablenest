import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { authAPI } from '../services/api';
import { setAuthToken, setUnauthorizedHandler } from '../services/axios';
import type { RegisterPayload, User } from '../types/auth.types';
import {
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
    clearAuthStorage,
} from '../utils/auth.utils';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isSubmitting: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (data: RegisterPayload) => Promise<User>;
    logout: () => void;
    setUser: (user: User) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
    try {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        return raw ? (JSON.parse(raw) as User) : null;
    } catch {
        return null;
    }
}

function persistAuth(user: User, accessToken: string): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    setAuthToken(accessToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isHydrating, setIsHydrating] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const clearAuth = useCallback(() => {
        clearAuthStorage();
        setAuthToken(null);
        setUserState(null);
        setTokenState(null);
    }, []);

    const logout = useCallback(() => {
        clearAuth();
        window.location.href = '/login';
    }, [clearAuth]);

    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = readStoredUser();

        if (storedToken && storedUser) {
            setAuthToken(storedToken);
            setTokenState(storedToken);
            setUserState(storedUser);
        } else {
            clearAuthStorage();
            setAuthToken(null);
        }

        setIsHydrating(false);
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearAuth();
            window.location.href = '/login';
        });

        return () => setUnauthorizedHandler(null);
    }, [clearAuth]);

    const applySession = useCallback((nextUser: User, accessToken: string) => {
        persistAuth(nextUser, accessToken);
        setUserState(nextUser);
        setTokenState(accessToken);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsActionLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            const { user: nextUser, accessToken } = res.data;
            applySession(nextUser, accessToken);
            return nextUser;
        } finally {
            setIsActionLoading(false);
        }
    }, [applySession]);

    const register = useCallback(async (data: RegisterPayload) => {
        setIsActionLoading(true);
        try {
            const res = await authAPI.register(data);
            const { user: nextUser, accessToken } = res.data;
            applySession(nextUser, accessToken);
            return nextUser;
        } finally {
            setIsActionLoading(false);
        }
    }, [applySession]);

    const setUser = useCallback((nextUser: User) => {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        setUserState(nextUser);
    }, []);

    const refreshUser = useCallback(async () => {
        const res = await authAPI.getMe();
        setUser(res.data);
    }, [setUser]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        token,
        isLoading: isHydrating,
        isSubmitting: isActionLoading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        setUser,
        refreshUser,
    }), [user, token, isHydrating, isActionLoading, login, register, logout, setUser, refreshUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
