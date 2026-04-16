import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Cross-platform redirect (turnolink ↔ colmen) ──────────────────────────
// Tenant slugs on the wrong platform get 301-redirected to the correct domain.
// Uses in-memory LRU cache (5min TTL, max 1000 entries) to avoid API calls.

const CURRENT_PLATFORM = process.env.NEXT_PUBLIC_PLATFORM || 'turnolink';

const PLATFORM_DOMAINS: Record<string, string> = {
  turnolink: 'https://turnolink.com.ar',
  colmen: 'https://colmen.com.ar',
};

const COLMEN_RUBROS = new Set([
  'gastronomia', 'mercado', 'inmobiliarias',
]);
const COLMEN_PREFIXES = ['gastro-', 'mercado-'];

function getPlatformForRubro(rubro: string): string {
  if (COLMEN_RUBROS.has(rubro)) return 'colmen';
  if (COLMEN_PREFIXES.some(p => rubro.startsWith(p))) return 'colmen';
  return 'turnolink';
}

// In-memory cache for slug → platform lookups
interface CacheEntry { platform: string; ts: number; }
const slugPlatformCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX = 1000;

function getCachedPlatform(slug: string): string | null {
  const entry = slugPlatformCache.get(slug);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { slugPlatformCache.delete(slug); return null; }
  return entry.platform;
}

function setCachedPlatform(slug: string, platform: string) {
  if (slugPlatformCache.size >= CACHE_MAX) {
    const first = slugPlatformCache.keys().next().value;
    if (first) slugPlatformCache.delete(first);
  }
  slugPlatformCache.set(slug, { platform, ts: Date.now() });
}

// Routes that are never tenant slugs
const NON_SLUG_ROUTES = new Set([
  'login', 'registro', 'register', 'dashboard', 'admin', 'verificar-email',
  'verificar-cuenta', 'privacidad', 'terminos', 'ayuda', 'precios',
  'suscripcion', 'belleza', 'salud', 'deportes', 'gastronomia', 'mercado',
  'hospedaje-por-horas', 'alquiler-temporario', 'espacios-flexibles',
  'turnos-profesionales', 'turnos-online', 'integrar', 'para', 'embed',
  'perfil-profesional', 'videollamadas', 'catalogo', 'portal-empleado',
  'mi-perfil', 'talento', 'configuracion', 'clientes', 'empleados',
  'servicios', 'agenda', 'pedidos', 'pedidos-cocina', 'finanzas',
  'reportes', 'salon', 'cocina', 'reservas',
]);

async function fetchTenantRubro(slug: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/api/public/tenants/${slug}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.settings?.rubro || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Cross-platform redirect for tenant slug routes ───
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] || '';
  if (
    segments.length >= 1 &&
    !firstSegment.startsWith('_') &&
    !firstSegment.includes('.') &&
    !NON_SLUG_ROUTES.has(firstSegment)
  ) {
    const slug = firstSegment;
    let targetPlatform = getCachedPlatform(slug);

    if (!targetPlatform) {
      const rubro = await fetchTenantRubro(slug);
      if (rubro) {
        targetPlatform = getPlatformForRubro(rubro);
        setCachedPlatform(slug, targetPlatform);
      }
    }

    if (targetPlatform && targetPlatform !== CURRENT_PLATFORM) {
      const targetDomain = PLATFORM_DOMAINS[targetPlatform];
      if (targetDomain) {
        return NextResponse.redirect(`${targetDomain}${pathname}`, 301);
      }
    }
  }
  const isEmbedRoute = pathname.startsWith('/embed');

  // ─── Auth pages: redirect logged-in users to their dashboard ───
  if (pathname === '/login' || pathname === '/register') {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      const dest = token.role === 'EMPLOYEE' ? '/portal-empleado/agenda'
        : token.tenantType === 'PROFESSIONAL' ? '/mi-perfil'
        : token.tenantType === 'TALENT_SEEKER' ? '/talento'
        : '/dashboard';
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // ─── Employee Portal: block non-employees from portal routes ───
  if (pathname.startsWith('/portal-empleado')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Only EMPLOYEE role or OWNER can access portal
    if (token.role !== 'EMPLOYEE' && token.role !== 'OWNER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ─── Dashboard redirect for EMPLOYEE role ───
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token?.role === 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/portal-empleado/agenda', request.url));
    }
    if (token?.tenantType === 'PROFESSIONAL') {
      return NextResponse.redirect(new URL('/mi-perfil', request.url));
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
    "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://translate.googleapis.com https://maps.google.com https://www.google.com https://sdk.mercadopago.com https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagservices.com https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: blob: https: ${apiDomain} ${devHosts}`.trim(),
    `connect-src 'self' https: wss: ${apiDomain} ${devHosts} ${devWebsockets}`.trim(),
    "media-src 'self' https: data: blob:",
    "object-src 'none'",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com https://www.mercadopago.com https://www.mercadopago.com.ar https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com",
    isEmbedRoute ? "frame-ancestors 'self' https://turnolink.com.ar https://*.turnolink.com.ar https://colmen.com.ar https://*.colmen.com.ar" : "frame-ancestors 'self'",
  ];

  // Only add upgrade-insecure-requests in production
  if (!isDevelopment) {
    cspDirectives.push('upgrade-insecure-requests');
  }

  const cspHeader = cspDirectives.join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  if (!isEmbedRoute) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
  if (!isDevelopment) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

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
