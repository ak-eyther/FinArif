import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disabled auth middleware to allow dashboard access
// TODO: Re-enable after implementing login page
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon\.png|robots\.txt|sitemap\.xml).*)',
  ],
};
