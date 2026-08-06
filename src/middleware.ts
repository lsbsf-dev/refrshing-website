import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    const session = request.cookies.get('session');
    if (!session) return NextResponse.redirect(new URL('/admin/login', request.url));
    return NextResponse.next();
  }

  // Public sections that require an event context
  const publicSections = [
    'about', 'announcements', 'booklet', 'contact', 'faq', 'gallery', 'ministers', 'programme', 'resources', 'search'
  ];

  if (pathname === '/' || publicSections.some(sec => pathname === `/${sec}` || pathname.startsWith(`/${sec}/`))) {
    // Note: This fallback is env-var-based and must be manually updated (and redeployed)
    // to match the Settings-page default when the active edition changes.
    const defaultEventId = request.cookies.get('currentEventId')?.value || process.env.NEXT_PUBLIC_DEFAULT_EVENT_ID || 'refreshing-2026';
    const redirectUrl = `/${defaultEventId}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.png).*)',
  ],
};
