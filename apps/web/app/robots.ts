import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/turnos-profesionales/', '/para/', '/integrar', '/explorar-talento'],
        disallow: [
          '/admin/',
          '/api/',
          '/embed/',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/verificar-email',
          '/verificar-cuenta',
          '/mi-perfil',
          '/mi-suscripcion',
          '/turnos',
          '/clientes',
          '/configuracion',
          '/suscripcion',
          '/perfil-profesional',
          '/reportes',
          '/portal-empleado/',
          '/checkout',
          '/pedido',
          '/_next/',
        ],
      },
      {
        // Googlebot-specific: allow all crawlable content
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/embed/',
          '/login',
          '/portal-empleado/',
          '/checkout',
          '/pedido',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
