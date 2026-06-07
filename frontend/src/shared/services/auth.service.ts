import api from './api';
import type { LoginPayload, RegisterPayload, AuthResponse, ResetPasswordPayload, ChangePasswordPayload } from '../types/auth.types';

export const AuthService = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const res = await api.post('/auth/login', payload);
        return res.data;
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const res = await api.post('/auth/register', payload);
        return res.data;
    },

    getMe: async () => {
        const res = await api.get('/auth/me');
        return res.data;
    },

    forgotPassword: async (email: string) => {
        const res = await api.post('/auth/forgot-password', { email });
        return res.data;
    },

    resetPassword: async (payload: ResetPasswordPayload) => {
        const res = await api.post('/auth/reset-password', payload);
        return res.data;
    },

    changePassword: async (payload: ChangePasswordPayload) => {
        const res = await api.patch('/auth/change-password', payload);
        return res.data;
    },

    refreshToken: async (refreshToken: string) => {
        const res = await api.post('/auth/refresh', { refreshToken });
        return res.data;
    },
};

export default AuthService;