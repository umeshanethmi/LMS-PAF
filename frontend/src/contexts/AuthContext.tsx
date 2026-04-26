// Adapter over the canonical singular AuthContext at ../context/AuthContext.
// Many pages were originally written against the plural shape (with `role`
// mapped to UI roles and a 2-arg login). Rather than churn every import site,
// this file exposes the same useAuth hook with the legacy shape, backed by
// the singular provider that App.tsx already mounts.

import { useAuth as useSingularAuth } from '../context/AuthContext';
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
  name?: string;
}

const INSTRUCTOR_ROLES: BackendRole[] = ['SUPERADMIN', 'ADMIN', 'INSTRUCTOR', 'TECHNICIAN'];

function uiRoleFor(backend: string | undefined | null): UserRole {
  if (!backend) return null;
  return INSTRUCTOR_ROLES.includes(backend.toUpperCase() as BackendRole)
    ? 'instructor'
    : 'student';
}

export function useAuth() {
  const ctx = useSingularAuth();

  const user: AuthUser | null = ctx.user
    ? {
        id: ctx.user.id,
        username: ctx.user.name || ctx.user.email?.split('@')[0] || 'user',
        email: ctx.user.email,
        role: (ctx.user.role?.toUpperCase() as BackendRole) || 'USER',
        name: ctx.user.name,
      }
    : null;

  const role = uiRoleFor(user?.role);

  const login = async (identifier: string, password: string) => {
    const res = await apiClient.post<{
      id: string;
      username: string;
      email: string;
      role: BackendRole;
      token: string;
    }>('/auth/login', { username: identifier, password });
    ctx.login(res.data.token);
  };

  return {
    user,
    token: ctx.token,
    role,
    isAuthenticated: ctx.isAuthenticated,
    loading: false,
    login,
    logout: ctx.logout,
    simulationRole: ctx.simulationRole,
    setSimulationRole: ctx.setSimulationRole,
  };
}

// Re-export the singular AuthProvider so existing imports of AuthProvider
// from this path keep working.
export { AuthProvider } from '../context/AuthContext';
