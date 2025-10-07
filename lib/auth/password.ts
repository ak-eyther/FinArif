import bcrypt from 'bcryptjs';

/**
 * Bcrypt salt rounds for hashing admin credentials
 * Aligns with security requirements documented in PR6_SECURITY_UPDATE.md
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * @param password Plaintext password input
 * @returns Promise resolving to hashed string
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password is required for hashing');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a stored bcrypt hash.
 * Uses bcrypt.compare which is already timing-attack resistant.
 * @param password Plaintext password input
 * @param hash Stored bcrypt hash
 * @returns Promise resolving to comparison result
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}
