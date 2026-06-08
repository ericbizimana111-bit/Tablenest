import { create } from 'zustand';
import { authAPI } from '../services/api';

type NotificationPrefs = Record<string, unknown>;

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: 'super_admin' | 'owner' | 'customer';
    avatar?: string;
    phone?: string;
    address?: string;
    restaurantId?: string;
    activePlan?: string;
    notificationPrefs?: NotificationPrefs;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: Record<string, unknown>) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: (() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    })(),
    token: localStorage.getItem('token'),
    isLoading: false,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await authAPI.login({ email, password });
            const { user, accessToken } = res.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (e) {
            set({ isLoading: false });
            throw e;
        }
    },

    register: async (data: Record<string, unknown>) => {
        set({ isLoading: true });
        try {
            const res = await authAPI.register(data);
            const { user, accessToken } = res.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (e) {
            set({ isLoading: false });
            throw e;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/login';
    },

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },

    refreshUser: async () => {
        try {
            const res = await authAPI.getMe();
            const user = res.data;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user });
        } catch { }
    },
}));