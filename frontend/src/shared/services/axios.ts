import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../utils/auth.utils';

const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

let inMemoryToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
    inMemoryToken = token;
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;
    }
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
    unauthorizedHandler = handler;
}

export function getStoredToken(): string | null {
    return inMemoryToken ?? localStorage.getItem(AUTH_TOKEN_KEY);
}

const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
if (initialToken) {
    setAuthToken(initialToken);
}

api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url ?? '';
        const isAuthRoute = /\/auth\/(login|register|forgot-password|reset-password)/.test(url);
        const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

        if (status === 401 && !isAuthRoute && hadAuthHeader && unauthorizedHandler) {
            unauthorizedHandler();
        }

        return Promise.reject(error);
    },
);

export default api;
