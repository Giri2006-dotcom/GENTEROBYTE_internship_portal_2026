'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: 'applicant' | 'recruiter' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('gentrobyte_auth_token') || sessionStorage.getItem('gentrobyte_applicant_token');
      const savedUser = localStorage.getItem('gentrobyte_auth_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else if (savedToken) {
        // Fetch profile from /api/auth/me
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.user) {
              setToken(savedToken);
              setUser(data.user);
              localStorage.setItem('gentrobyte_auth_user', JSON.stringify(data.user));
            } else {
              logout();
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
        return;
      }
    } catch (e) {
      console.warn('Auth restoration error:', e);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem('gentrobyte_auth_token', newToken);
      localStorage.setItem('gentrobyte_auth_user', JSON.stringify(newUser));
      sessionStorage.setItem('gentrobyte_applicant_token', newToken);
    } catch {}
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('gentrobyte_auth_token');
      localStorage.removeItem('gentrobyte_auth_user');
      sessionStorage.removeItem('gentrobyte_applicant_token');
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

