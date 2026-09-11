import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string, role?: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => Promise<void>;
  switchAccount: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const token = localStorage.getItem('tracex_auth_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        if (data && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('tracex_auth_token');
          setUser(null);
        }
      } catch (err) {
        console.warn('Session validation failed; clearing token.');
        localStorage.removeItem('tracex_auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, pass: string, role?: string): Promise<User> => {
    const data = await api.login(email, pass, role);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: any): Promise<User> => {
    const data = await api.register(payload);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('tracex_auth_token');
      setUser(null);
    }
  };

  // 1-click role switcher for authorized environment demonstration
  const switchAccount = async (role: UserRole) => {
    let email = 'senior@trace-x.local';
    let roleParam = 'SENIOR_ANALYST';
    if (role === 'ADMIN') {
      email = 'admin@trace-x.local';
      roleParam = 'ADMIN';
    } else if (role === 'ANALYST') {
      email = 'analyst@trace-x.local';
      roleParam = 'ANALYST';
    } else if (role === 'PERSONAL_INVESTIGATOR') {
      email = 'investigator@personal.io';
      roleParam = 'PERSONAL_INVESTIGATOR';
    }

    try {
      const data = await api.login(email, 'TraceX@2026', roleParam);
      setUser(data.user);
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
