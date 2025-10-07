/**
 * Unit tests for authentication helper utilities
 *
 * These tests target the password hashing helpers and auth error normalization logic.
 *
 * NOTE: Tests execute once a framework (Jest/Vitest) is configured.
 */

import { InvalidCredentialsError, MissingCredentialsError, normalizeAuthError } from '@/lib/auth/errors';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const it: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const expect: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const beforeAll: any;

let hashedPassword: string;

beforeAll(async () => {
  hashedPassword = await hashPassword('password123');
});

describe('hashPassword', () => {
  it('produces a bcrypt hash with expected prefix', () => {
    expect(hashedPassword).toMatch(/\$2[aby]\$/);
  });

  it('generates unique salt per invocation', async () => {
    const otherHash = await hashPassword('password123');
    expect(otherHash).not.toEqual(hashedPassword);
  });
});

describe('verifyPassword', () => {
  it('returns true for matching password', async () => {
    const isValid = await verifyPassword('password123', hashedPassword);
    expect(isValid).toBe(true);
  });

  it('returns false for mismatched password', async () => {
    const isValid = await verifyPassword('wrong-password', hashedPassword);
    expect(isValid).toBe(false);
  });

  it('handles missing inputs gracefully', async () => {
    const isValid = await verifyPassword('', hashedPassword);
    expect(isValid).toBe(false);
  });
});

describe('normalizeAuthError', () => {
  it('maps MissingCredentialsError', () => {
    const payload = normalizeAuthError(new MissingCredentialsError());
    expect(payload.code).toBe('MISSING_CREDENTIALS');
  });

  it('maps InvalidCredentialsError', () => {
    const payload = normalizeAuthError(new InvalidCredentialsError());
    expect(payload.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns UNKNOWN_ERROR by default', () => {
    const payload = normalizeAuthError(new Error('unexpected'));
    expect(payload.code).toBe('UNKNOWN_ERROR');
  });
});
