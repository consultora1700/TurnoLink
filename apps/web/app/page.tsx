import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import LandingV2Page from './_landing/page';
import { FaqJsonLd } from './_landing/_components/seo-schemas';
import { LANDING_FAQS } from './_landing/_data/landing-faqs';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'TurnoLink — Sistema Operativo Comercial: Servicios, Tienda Online y Finanzas',
  description:
    'Gestiona servicios y turnos, vende productos con tu tienda online y controla ingresos, gastos y proyecciones financieras. Todo en una sola plataforma. Mercado Pago integrado. +40 industrias. Empieza gratis.',
  keywords: [
    'sistema de reservas online',
    'gestion de turnos automatica',
    'cobro de senas automatico',
    'reservas con Mercado Pago',
    'sistema de turnos para negocios',
    'plataforma de reservas 24/7',
    'software de gestion de disponibilidad',
    'turnos online con cobro anticipado',
    'tienda online para negocios',
    'catalogo de productos online',
    'gestion financiera para negocios',
    'sistema operativo comercial',
    'vender productos online Argentina',
    'control de gastos negocio',
  ],
  openGraph: {
    title: 'TurnoLink — Servicios, Tienda y Finanzas en una sola plataforma',
    description:
      'Sistema operativo comercial: gestiona servicios con cobro automatico, vende productos con tu tienda online y controla las finanzas de tu negocio. +40 industrias. Empieza gratis.',
    type: 'website',
    url: 'https://turnolink.com.ar/',
    images: [{ url: '/og-image.jpg?v=2', width: 1200, height: 630, alt: 'TurnoLink' }],
  },
  alternates: {
    canonical: 'https://turnolink.com.ar/',
  },
};

export default function HomePage() {
  return (
    <div
      className={`${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <FaqJsonLd faqs={LANDING_FAQS} />
      <LandingV2Page />
    </div>
  );
}
