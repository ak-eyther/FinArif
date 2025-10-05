/**
 * Middleware for route protection
 * Ensures users are authenticated before accessing dashboard routes
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Matcher to protect all routes except login and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
