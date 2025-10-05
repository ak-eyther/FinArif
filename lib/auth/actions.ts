'use server';

/**
 * Server actions for authentication
 * Handles sign out and other auth-related server actions
 */

import { signOut } from '@/auth';

export async function handleSignOut() {
  await signOut({ redirectTo: '/login' });
}
