import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'TurnoLink — Reservas y Cobros Automaticos para tu Negocio | 24/7',
  description:
    'Digitaliza tu negocio con TurnoLink. Sistema de reservas online con cobro de senas automatico via Mercado Pago. Gestion de disponibilidad por hora o dia, multi-sucursal, reportes profesionales. Empieza gratis.',
  keywords: [
    'sistema de reservas online',
    'gestion de turnos automatica',
    'cobro de senas automatico',
    'reservas con Mercado Pago',
    'sistema de turnos para negocios',
    'plataforma de reservas 24/7',
    'software de gestion de disponibilidad',
    'turnos online con cobro anticipado',
  ],
  openGraph: {
    title: 'TurnoLink — Reservas y Cobros Automaticos para tu Negocio',
    description:
      'Plataforma de reservas y cobros automaticos para negocios que venden tiempo o espacio. Tus clientes reservan y pagan online, 24/7.',
    type: 'website',
  },
};

export default function LandingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      {children}
    </div>
  );
}
