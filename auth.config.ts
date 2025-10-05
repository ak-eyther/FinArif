/**
 * NextAuth configuration
 * Configures authentication providers and options
 */

import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/lib/types/auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      // Allow login page for everyone
      if (isOnLogin) {
        // Redirect logged-in users away from login
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Protect all other routes - require authentication
      if (!isLoggedIn) {
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
