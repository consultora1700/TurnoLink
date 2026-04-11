/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    scrollRestoration: true,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.turnolink.com.ar',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.basemaps.cartocdn.com',
      },
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'armenon.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'mixerport.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Dashboard/auth pages: no cache (dynamic, session-dependent)
        source: '/(dashboard|login|registro|verificar|configuracion)(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        // Public tenant pages: short cache with revalidation (ISR-friendly)
        source: '/:slug([a-z0-9-]+)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        // Static marketing pages: cache longer
        source: '/(belleza|salud|deportes|mercado|hospedaje-por-horas|alquiler-temporario|espacios-flexibles|turnos-profesionales|turnos-online|precios|integrar)(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  async redirects() {
    const industries = [
      'belleza',
      'salud',
      'deportes',
      'hospedaje-por-horas',
      'alquiler-temporario',
      'espacios-flexibles',
    ];
    return [
      // landing-v2/* → clean URLs (301)
      ...industries.map((slug) => ({
        source: `/landing-v2/${slug}`,
        destination: `/${slug}`,
        permanent: true,
      })),
      ...industries.map((slug) => ({
        source: `/landing-v2/${slug}/:subNiche*`,
        destination: `/${slug}/:subNiche*`,
        permanent: true,
      })),
      { source: '/landing-v2/turnos-profesionales', destination: '/turnos-profesionales', permanent: true },
      { source: '/landing-v2/talento', destination: '/para/talento', permanent: true },
      { source: '/landing-v2/integrar', destination: '/integrar', permanent: true },
      { source: '/landing-v2', destination: '/', permanent: true },
      // Legacy /para/integrar → canonical /integrar
      { source: '/para/integrar', destination: '/integrar', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
