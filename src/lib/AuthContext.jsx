import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '@/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/login';
  }, []);

  // Always attempts /auth/me, even with no local access token — a returning
  // visitor may have nothing in localStorage (it was never here, or the
  // previous 15-minute access token already expired) but still hold a
  // valid httpOnly refresh cookie. api/client.js's request() transparently
  // retries once via /auth/refresh on a 401, so this either resolves to a
  // logged-in user or a clean "not authenticated" — no separate code path
  // needed here for the "no token yet" case.
  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const me = await api.auth.me();
      setUser(me);
      setAuthError(null);
    } catch {
      setUser(null);
      setAuthError({ type: 'auth_required' });
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
    navigateToLogin();
  }, [navigateToLogin]);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoadingAuth,
    // No separate "public settings" fetch in this stack (that was a Base44
    // concept) — always resolved so App.jsx's loading gate isn't stuck.
    isLoadingPublicSettings: false,
    authChecked,
    authError,
    checkUserAuth,
    navigateToLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
