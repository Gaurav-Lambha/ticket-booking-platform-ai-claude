import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import type { AuthResponse, LoginRequest, RegisterRequest } from '@repo/types';

import { apiClient } from '@/lib/api/client.ts';
import { useAuthStore } from './authStore.ts';

interface AuthContextValue {
  login: (dto: LoginRequest) => Promise<void>;
  register: (dto: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setTokens, logout: clearAuth, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  // Restore session on mount
  useEffect(() => {
    if (refreshToken) {
      apiClient
        .post<{ data: AuthResponse['tokens'] }>('/auth/refresh', { refreshToken })
        .then(({ data }) => {
          setTokens(data.data.accessToken, data.data.refreshToken);
          return apiClient.get<{ data: AuthResponse['user'] }>('/auth/me');
        })
        .then(({ data }) => setUser(data.data))
        .catch(() => clearAuth());
    }
  }, []);

  const login = async (dto: LoginRequest): Promise<void> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>('/auth/login', dto);
    setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
    setUser(data.data.user);
  };

  const register = async (dto: RegisterRequest): Promise<void> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>('/auth/register', dto);
    setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
    setUser(data.data.user);
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuth();
      void navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
