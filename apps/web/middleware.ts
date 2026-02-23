import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Auth pages: redirect logged-in users to their dashboard ───
  if (pathname === '/login' || pathname === '/register') {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      const dest = token.tenantType === 'PROFESSIONAL' ? '/mi-perfil'
        : token.tenantType === 'TALENT_SEEKER' ? '/talento'
        : '/dashboard';
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // ─── Dashboard redirect for PROFESSIONAL tenant type ───
  if (pathname === '/dashboard') {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token?.tenantType === 'PROFESSIONAL') {
      return NextResponse.redirect(new URL('/mi-perfil', request.url));
    }
  }

  const response = NextResponse.next();

  const isDevelopment = process.env.NODE_ENV !== 'production';

  // API URL from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const apiDomain = new URL(apiUrl).origin;

  // Development localhost URLs for CSP
  const devHosts = isDevelopment
    ? 'http://localhost:3000 http://localhost:3001 http://127.0.0.1:3000 http://127.0.0.1:3001'
    : '';

  const devWebsockets = isDevelopment
    ? 'ws://localhost:3000 ws://localhost:3001 wss://localhost:3000 wss://localhost:3001'
    : '';

  // CSP directives - allowing API domain and Google services
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://translate.googleapis.com https://maps.google.com https://www.google.com https://sdk.mercadopago.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: blob: https: ${apiDomain} ${devHosts}`.trim(),
    `connect-src 'self' https: ${apiDomain} ${devHosts} ${devWebsockets}`.trim(),
    "media-src 'self' https: data: blob:",
    "object-src 'none'",
    "frame-src 'self' https://maps.google.com https://www.google.com https://www.mercadopago.com https://www.mercadopago.com.ar https:",
    "frame-ancestors 'self'",
  ];

  // Only add upgrade-insecure-requests in production
  if (!isDevelopment) {
    cspDirectives.push('upgrade-insecure-requests');
  }

  const cspHeader = cspDirectives.join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
