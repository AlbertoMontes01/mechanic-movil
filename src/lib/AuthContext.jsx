import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, getToken, clearToken } from '@/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    if (!getToken()) {
      setUser(null);
      setAuthError({ type: 'auth_required' });
      setAuthChecked(true);
      setIsLoadingAuth(false);
      return;
    }
    try {
      const me = await api.auth.me();
      setUser(me);
      setAuthError(null);
    } catch {
      clearToken();
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

  const logout = useCallback(() => {
    clearToken();
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
