import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { normalizeAuthError, InvalidCredentialsError, MissingCredentialsError } from '@/lib/auth/errors';
import { verifyPassword } from '@/lib/auth/password';
import { getUserByEmail, recordSuccessfulLogin, toAuthenticatedUser } from '@/lib/db/users';
import type { AuthenticatedUser } from '@/lib/types/auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour sessions align with finance security requirements
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password?.trim();

        if (!email || !password) {
          throw new MissingCredentialsError();
        }

        const userRecord = await getUserByEmail(email);

        if (!userRecord) {
          throw new InvalidCredentialsError();
        }

        const isValid = await verifyPassword(password, userRecord.passwordHash);

        if (!isValid) {
          throw new InvalidCredentialsError();
        }

        await recordSuccessfulLogin(userRecord.id);

        const authUser = toAuthenticatedUser(userRecord);

        const user: AuthenticatedUser & { name: string } = {
          ...authUser,
          name: authUser.fullName,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as AuthenticatedUser).role;
        token.fullName = (user as AuthenticatedUser).fullName;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
      }

      return session;
    },
    authorized: async ({ auth, request }) => {
      // Allow public access to login + auth endpoints
      const publicPaths = ['/login'];
      const pathname = request.nextUrl.pathname;

      if (publicPaths.includes(pathname) || pathname.startsWith('/api/auth')) {
        return true;
      }

      return Boolean(auth?.user);
    },
  },
  events: {
    signIn: async ({ user }) => {
      console.info('[auth] user signed in', { email: user?.email });
    },
  },
  logger: {
    error: (code, metadata) => {
      const normalized = normalizeAuthError(metadata);
      console.error(`[auth] error: ${code}`, normalized);
    },
    warn: (code) => {
      console.warn(`[auth] warning: ${code}`);
    },
    debug: (code, metadata) => {
      console.debug(`[auth] debug: ${code}`, metadata);
    },
  },
};

export default authConfig;
