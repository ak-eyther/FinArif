/**
 * Mock user database
 * In production, replace with actual database (Prisma, MongoDB, etc.)
 */

import bcrypt from 'bcryptjs';
import type { User } from '@/lib/types/auth';

// Pre-hashed password for 'password123'
// Generated with: bcrypt.hashSync('password123', 10)
const HASHED_PASSWORD = '$2a$10$YQ98PzLGFJmEKkFmCrXYX.b5SvVf8qXKHr8FJYxXk5VDOxQXZVXqu';

// Mock users database (in-memory)
// Password for all users: password123
export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@finarif.com',
    password: HASHED_PASSWORD,
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    email: 'finance@finarif.com',
    password: HASHED_PASSWORD,
    name: 'Finance Manager',
    role: 'finance_manager',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '3',
    email: 'risk@finarif.com',
    password: HASHED_PASSWORD,
    name: 'Risk Analyst',
    role: 'risk_analyst',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '4',
    email: 'accountant@finarif.com',
    password: HASHED_PASSWORD,
    name: 'Senior Accountant',
    role: 'accountant',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '5',
    email: 'viewer@finarif.com',
    password: HASHED_PASSWORD,
    name: 'Board Member',
    role: 'viewer',
    status: 'active',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

/**
 * Find user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

/**
 * Find user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const user = MOCK_USERS.find((u) => u.id === id);
  return user || null;
}

/**
 * Verify user password
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (user) {
    user.lastLoginAt = new Date();
  }
}
