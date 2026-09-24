import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, type AuthResponse, type RegisterBody } from '@/lib/api';
import { onUnauthorized, tokenStore } from '@/lib/http';
import type { Role, User } from '@/lib/types';

export interface AuthValue {
  user: User | null;
  /** True until a stored token has been checked against the API. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (body: RegisterBody, as?: 'customer' | 'owner') => Promise<User>;
  signOut: () => void;
  setUser: (user: User) => void;
  refresh: () => Promise<User | null>;
  /** Replace the token after a password change (other sessions were revoked server-side). */
  replaceToken: (token: string) => void;
}

export const AuthContext = createContext<AuthValue | null>(null);

export const homeFor = (role: Role) => (role === 'owner' ? '/owner' : role === 'admin' ? '/admin' : '/home');

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  const clear = useCallback(() => {
    tokenStore.set(null);
    setUserState(null);
    qc.clear();
  }, [qc]);

  // Validate a stored token on load; the server decides whether it is still good.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then(setUserState)
      .catch(() => tokenStore.set(null))
      .finally(() => setLoading(false));
  }, []);

  // Any 401 (expired, revoked, deactivated) ends the session everywhere in the app.
  useEffect(() => {
    onUnauthorized(() => {
      clear();
      if (!location.pathname.startsWith('/login')) {
        location.assign(`/login?next=${encodeURIComponent(location.pathname + location.search)}&expired=1`);
      }
    });
    return () => onUnauthorized(null);
  }, [clear]);

  const accept = useCallback(
    (res: AuthResponse) => {
      tokenStore.set(res.accessToken);
      qc.clear();
      setUserState(res.user);
      return res.user;
    },
    [qc],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      signIn: (email, password) => authApi.login(email, password).then(accept),
      signUp: (body, as = 'customer') => (as === 'owner' ? authApi.registerOwner(body) : authApi.register(body)).then(accept),
      signOut: clear,
      setUser: setUserState,
      refresh: () =>
        authApi.me().then(
          (u) => (setUserState(u), u),
          () => null,
        ),
      replaceToken: (token) => tokenStore.set(token),
    }),
    [user, loading, accept, clear],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
