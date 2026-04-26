import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../services/apiClient';

export type BackendRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'INSTRUCTOR'
  | 'STUDENT'
  | 'TECHNICIAN'
  | 'USER';

export type UserRole = 'instructor' | 'student' | null;

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: BackendRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: UserRole;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'lms.auth';

const INSTRUCTOR_ROLES: BackendRole[] = ['SUPERADMIN', 'ADMIN', 'INSTRUCTOR', 'TECHNICIAN'];

function uiRoleFor(backend: BackendRole | undefined | null): UserRole {
  if (!backend) return null;
  return INSTRUCTOR_ROLES.includes(backend) ? 'instructor' : 'student';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await apiClient.post<{
      id: string;
      username: string;
      email: string;
      role: BackendRole;
      token: string;
    }>('/auth/login', { username: identifier, password });

    const next: AuthUser = {
      id: res.data.id,
      username: res.data.username,
      email: res.data.email,
      role: res.data.role,
    };
    setUser(next);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: next, token: res.data.token }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, role: uiRoleFor(user?.role), login, logout, loading }}>
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
