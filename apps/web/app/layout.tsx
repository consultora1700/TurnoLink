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
    default: 'Turnos Online con Cobro Automático | TurnoLink',
    template: '%s | TurnoLink',
  },
  description:
    'Sistema de turnos online para tu negocio. Agendá, cobrá señas con Mercado Pago y enviá recordatorios automáticos. +40 rubros. Empezá gratis 14 días.',
  keywords: [
    'turnos online',
    'turnos online argentina',
    'sistema de turnos',
    'sistema de reservas online',
    'agenda online para negocios',
    'agenda digital',
    'software de turnos',
    'turnero online',
    'turnolink',
    'reservas con mercado pago',
    'cobro de seña automatico',
    'recordatorios de turnos automaticos',
    'turnos para peluqueria',
    'turnos para consultorio',
    'reservas de canchas online',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico?v=tlink-1', sizes: 'any' },
      { url: '/favicon-32x32.png?v=tlink-1', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon-180x180.png?v=tlink-1', sizes: '180x180' }],
  },
  // manifest is injected ONLY in the dashboard layout via PwaHead component
  // to prevent browsers from showing "Install App" prompts on public pages
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'TurnoLink',
    title: 'Turnos online con cobro automático — TurnoLink',
    description:
      'Agendá, cobrá señas con Mercado Pago y enviá recordatorios automáticos. Para +40 rubros. Empezá gratis 14 días.',
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
    title: 'Turnos online con cobro automático — TurnoLink',
    description:
      'Agendá, cobrá señas y enviá recordatorios. Para +40 rubros. Empezá gratis 14 días.',
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
                'Sistema de turnos online para gestionar reservas, cobrar señas con Mercado Pago, enviar recordatorios automáticos y administrar la agenda de tu negocio. Para peluquerías, consultorios, canchas, spas y +40 rubros más.',
              featureList: [
                'Reservas y turnos online 24/7',
                'Cobro de señas con Mercado Pago',
                'Recordatorios automáticos por WhatsApp y email',
                'Agenda multi-profesional y multi-sucursal',
                'CRM de clientes',
                'Reportes de ocupación y facturación',
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
