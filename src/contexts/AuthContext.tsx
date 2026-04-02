import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:7777' : '');

type User = { _id: string; username?: string; avatar?: string; rank?: string; balance?: number };

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    if (t) localStorage.setItem('admin_token', t);
    else localStorage.removeItem('admin_token');
    setTokenState(t);
  }, []);

  const fetchUser = useCallback(async (t: string) => {
    const res = await fetch(`${API}/auth/me`, { headers: { 'x-auth-token': t } });
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    if (data.user?.rank !== 'admin') throw new Error('Admin only');
    setUser(data.user);
  }, []);

  useEffect(() => {
    if (!token) { setUser(null); setLoading(false); return; }
    fetchUser(token).catch(() => setToken(null)).finally(() => setLoading(false));
  }, [token, fetchUser, setToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Login failed');
    setToken(data.token);
    setUser(data.user);
  }, [setToken]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await fetch(`${API}/auth/credentials/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, captcha: '00000000-0000-0000-0000-000000000001' }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Register failed');
    setToken(data.token);
    setUser(data.user);
  }, [setToken]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
