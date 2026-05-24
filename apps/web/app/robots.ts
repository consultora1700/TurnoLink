import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
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
          '/turnos/',
          '/clientes/',
          '/configuracion/',
          '/suscripcion/',
          '/perfil-profesional/',
          '/reportes/',
          '/finanzas/',
          '/portal-empleado/',
          '/checkout/',
          '/pedido/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
