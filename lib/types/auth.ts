/**
 * Types for authentication layer
 */
export type AuthRole = 'admin';

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: AuthRole;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
}

export interface AuthErrorPayload {
  code: 'INVALID_CREDENTIALS' | 'MISSING_CREDENTIALS' | 'UNKNOWN_ERROR';
  message: string;
  hint?: string;
}
