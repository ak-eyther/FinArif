import type { AuthErrorPayload } from '@/lib/types/auth';

export class MissingCredentialsError extends Error {
  public readonly payload: AuthErrorPayload = {
    code: 'MISSING_CREDENTIALS',
    message: 'Please provide both email and password.',
    hint: 'Ensure fields are not empty and try again.',
  };

  constructor() {
    super('Missing credentials');
    this.name = 'MissingCredentialsError';
  }
}

export class InvalidCredentialsError extends Error {
  public readonly payload: AuthErrorPayload = {
    code: 'INVALID_CREDENTIALS',
    message: 'The email or password you entered is incorrect.',
    hint: 'Check your credentials and try again.',
  };

  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export function normalizeAuthError(error: unknown): AuthErrorPayload {
  if (error instanceof MissingCredentialsError) {
    return error.payload;
  }

  if (error instanceof InvalidCredentialsError) {
    return error.payload;
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong while signing you in.',
    hint: 'Please retry in a few moments or contact support.',
  };
}
