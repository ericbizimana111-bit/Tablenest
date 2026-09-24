import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'tn.token';
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export const http = axios.create({ baseURL: BASE, timeout: 20000 });

let unauthorized: (() => void) | null = null;
export const onUnauthorized = (fn: (() => void) | null) => {
  unauthorized = fn;
};

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode) — session lives in memory only */
    }
  },
};

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const url = error.config?.url || '';
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken && !/\/auth\/(login|register)/.test(url)) unauthorized?.();
    return Promise.reject(error);
  },
);

/** A human-readable message from any API error (validation lists are joined). */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'We could not reach TableNest. Check your connection and try again.';
    const msg = (err.response.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(msg)) return msg[0] ?? fallback;
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}

export const statusOf = (err: unknown) => (axios.isAxiosError(err) ? err.response?.status : undefined);

/** Uploaded images are served by the API; make relative URLs work when the API is on another origin. */
const ASSET_ORIGIN = BASE.startsWith('http') ? new URL(BASE).origin : '';
export const assetUrl = (url: string | null | undefined) => (!url ? null : url.startsWith('/uploads/') ? ASSET_ORIGIN + url : url);
