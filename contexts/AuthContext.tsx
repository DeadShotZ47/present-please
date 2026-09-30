import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrStudentId: string, pass: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    studentId?: string;
    role: UserRole;
    password: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.warn('Error loading current auth', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentAuth();
  }, []);

  const login = async (emailOrStudentId: string, pass: string) => {
    const res = await api.login(emailOrStudentId, pass);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  };

  const register = async (data: {
    name: string;
    email: string;
    studentId?: string;
    role: UserRole;
    password: string;
  }) => {
    const res = await api.register(data);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    await loadCurrentAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
