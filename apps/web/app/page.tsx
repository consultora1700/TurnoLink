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
  title: 'Turnos Online con Cobro Automático | TurnoLink',
  description:
    'Agendá, cobrá señas con Mercado Pago y enviá recordatorios automáticos. Para peluquerías, consultorios, canchas y +40 rubros. 14 días gratis, sin tarjeta.',
  keywords: [
    'turnos online',
    'turnos online argentina',
    'sistema de turnos',
    'sistema de reservas online',
    'agenda online para negocios',
    'software de turnos',
    'turnero online',
    'reservas con mercado pago',
    'cobro de seña automatico',
    'recordatorios de turnos automaticos',
    'agenda digital para profesionales',
    'turnos para peluqueria',
    'turnos para consultorio',
    'reservas de canchas online',
  ],
  openGraph: {
    title: 'Turnos online con cobro automático — TurnoLink',
    description:
      'Agendá, cobrá señas y enviá recordatorios automáticos. Para +40 rubros. Empezá gratis 14 días, sin tarjeta.',
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
