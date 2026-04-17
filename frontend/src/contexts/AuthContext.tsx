import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../services/apiClient';

type UserRole = 'user' | 'admin' | 'technician' | null;

interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (username: string, password: String) => Promise<boolean>;
  logout: () => void;
  setSimulationRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [simulationRole, setSimulationRole] = useState<UserRole>(null);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from local storage:', e);
      localStorage.removeItem('user');
      return null;
    }
  });

  const login = async (username: string, password: String) => {
    try {
      const response = await apiClient.post<User>('/auth/login', { username, password });
      const userData = response.data;
      
      // Update role format to lowercase for frontend consistency
      const formattedUser = {
        ...userData,
        role: userData.role?.toLowerCase() as UserRole
      };
      
      setUser(formattedUser);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      if (formattedUser.token) {
        localStorage.setItem('token', formattedUser.token);
      }
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setSimulationRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: simulationRole || user?.role || null, 
      isAuthenticated: !!user, 
      login, 
      logout,
      setSimulationRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
