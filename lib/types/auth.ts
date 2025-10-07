export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  fullName: string;
  role: string;
  created_at: Date;
}

export interface AuthErrorPayload {
  code: string;
  message: string;
  hint?: string;
}

export type AuthRole = 'admin' | 'user';

export interface AuthUserRecord {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  role: AuthRole;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}
