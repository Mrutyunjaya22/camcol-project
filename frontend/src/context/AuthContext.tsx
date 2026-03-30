import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../api/api';
import type { User } from '../types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('camcol_user') ?? 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('camcol_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('camcol_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('camcol_token');
      localStorage.removeItem('camcol_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('camcol_token', data.token);
    localStorage.setItem('camcol_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (payload: Partial<User> & { password: string }) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('camcol_token', data.token);
    localStorage.setItem('camcol_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('camcol_token');
    localStorage.removeItem('camcol_user');
    setUser(null);
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('camcol_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 