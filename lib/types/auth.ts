/**
 * Authentication types and role definitions
 * Defines user roles, permissions, and authentication interfaces
 */

export type UserRole = 'admin' | 'finance_manager' | 'risk_analyst' | 'accountant' | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  expires: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'transactions', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'risk', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'capital', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
  ],
  finance_manager: [
    { resource: 'dashboard', actions: ['read', 'update'] },
    { resource: 'transactions', actions: ['create', 'read', 'update'] },
    { resource: 'risk', actions: ['read', 'update'] },
    { resource: 'capital', actions: ['create', 'read', 'update'] },
    { resource: 'settings', actions: ['read'] },
  ],
  risk_analyst: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'transactions', actions: ['read'] },
    { resource: 'risk', actions: ['create', 'read', 'update'] },
    { resource: 'capital', actions: ['read'] },
  ],
  accountant: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'transactions', actions: ['create', 'read', 'update'] },
    { resource: 'risk', actions: ['read'] },
    { resource: 'capital', actions: ['create', 'read', 'update'] },
  ],
  viewer: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'transactions', actions: ['read'] },
    { resource: 'risk', actions: ['read'] },
    { resource: 'capital', actions: ['read'] },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  finance_manager: 'Finance Manager',
  risk_analyst: 'Risk Analyst',
  accountant: 'Accountant',
  viewer: 'Viewer',
};
