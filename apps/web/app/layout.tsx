import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TurnoLink — Sistema Operativo Comercial: Servicios, Tienda y Finanzas',
    template: '%s | TurnoLink',
  },
  description:
    'Sistema operativo comercial para tu negocio. Gestiona servicios y turnos, vende productos con tu tienda online y controla ingresos, gastos y proyecciones. Mercado Pago integrado. +40 industrias. Empezá gratis.',
  keywords: [
    'sistema de turnos online',
    'reservas online',
    'agenda digital',
    'turnos online argentina',
    'cobro automatico mercado pago',
    'turnolink',
    'software de turnos',
    'sistema de reservas',
    'agenda online para negocios',
    'recordatorio de turnos automatico',
    'tienda online negocios',
    'catalogo productos online',
    'gestion financiera negocio',
    'control ingresos gastos',
    'sistema operativo comercial',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' }],
  },
  // manifest is injected ONLY in the dashboard layout via PwaHead component
  // to prevent browsers from showing "Install App" prompts on public pages
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'TurnoLink',
    title: 'TurnoLink — Servicios, Tienda Online y Finanzas en Un Solo Lugar',
    description:
      'Sistema operativo comercial: servicios, tienda online y finanzas. Para +40 industrias. Empezá gratis.',
    images: [
      {
        url: '/og-image.jpg?v=2',
        width: 1200,
        height: 630,
        alt: 'TurnoLink',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TurnoLink — Servicios, Tienda y Finanzas en una plataforma',
    description:
      'Sistema operativo comercial para tu negocio. Servicios, tienda online y gestión financiera. Empezá gratis.',
    images: ['/og-image.jpg?v=2'],
  },
  // canonical is set per-page to avoid all pages pointing to root
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="theme-color" content="#0f0f0f" media="(prefers-color-scheme: dark)" />
        {/* Resource hints — preconnect to critical origins */}
        <link rel="preconnect" href="https://api.turnolink.com.ar" />
        <link rel="dns-prefetch" href="https://api.turnolink.com.ar" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Hreflang — single-language site, canonical region */}
        <link rel="alternate" hrefLang="es-AR" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'TurnoLink',
              url: SITE_URL,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'Sistema operativo comercial: gestiona servicios y turnos con cobro automático, vende productos con tienda online integrada y controla ingresos, gastos y proyecciones financieras. +40 industrias.',
              featureList: [
                'Reservas y turnos online',
                'Tienda online y catálogo de productos',
                'Gestión financiera integral',
                'Cobro automático con Mercado Pago',
                'Multi-sucursal',
                'CRM de clientes',
              ],
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'ARS',
                description: '14 días de prueba gratuita',
              },
              provider: {
                '@type': 'Organization',
                name: 'TurnoLink',
                url: SITE_URL,
                logo: `${SITE_URL}/logo-claro.png`,
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'sales',
                  availableLanguage: 'Spanish',
                },
              },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('turnolink-theme');if(t==='dark'){document.documentElement.classList.remove('light');document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
