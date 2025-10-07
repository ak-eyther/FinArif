import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

const authResponse = NextAuth(authConfig);

export const auth = authResponse.auth;
export const signIn = authResponse.signIn;
export const signOut = authResponse.signOut;
export const handlers = authResponse.handlers;
export const GET = authResponse.handlers.GET;
export const POST = authResponse.handlers.POST;
