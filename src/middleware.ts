import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const session = request.cookies.get('session');

    // Check session cookie for authentication
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Since we're in Edge middleware, we cannot use firebase-admin to verify the token.
    // The verification happens upon issuing the cookie (in /api/auth/login),
    // and Firebase Admin SDK is used inside Server Actions or API routes for deeper RBAC checks.
    // For middleware, checking the existence of the session cookie is the first boundary layer.
    
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
