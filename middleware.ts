import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import { auth } from './auth';

const PUBLIC_ROUTES = ['/login'];

export default auth((request: NextRequest) => {
  const { nextUrl } = request;
  const isAuthenticated = Boolean(request.auth);
  const isAuthApiRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute =
    PUBLIC_ROUTES.includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/_next');

  if (isAuthApiRoute || nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && nextUrl.pathname === '/login') {
    const dashboardUrl = nextUrl.clone();
    dashboardUrl.pathname = '/';
    dashboardUrl.searchParams.delete('redirectTo');
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon\.png|robots\.txt|sitemap\.xml).*)',
  ],
};
