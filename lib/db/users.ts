import { sql } from '@/lib/db';
import type { AuthenticatedUser, AuthRole, AuthUserRecord } from '@/lib/types/auth';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: AuthRole;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function mapRowToRecord(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: row.role,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserByEmail(email: string): Promise<AuthUserRecord | null> {
  if (!email) {
    return null;
  }

  const { rows } = await sql<UserRow>`
    SELECT id, email, password_hash, full_name, role, last_login_at, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1;
  `;

  const row = rows[0];
  return row ? mapRowToRecord(row) : null;
}

export async function recordSuccessfulLogin(userId: string): Promise<void> {
  await sql`
    UPDATE users
    SET last_login_at = NOW(), updated_at = NOW()
    WHERE id = ${userId};
  `;
}

export function toAuthenticatedUser(record: AuthUserRecord): AuthenticatedUser {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    role: record.role,
  };
}
