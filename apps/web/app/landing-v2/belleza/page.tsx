import type { Metadata } from 'next';
import { BellezaLanding } from './belleza-landing';

export const metadata: Metadata = {
  title: 'TurnoLink para Belleza & Bienestar — Turnos Online para Peluquerías, Barberías y Spas',
  description:
    'Sistema de turnos online para peluquerías, barberías, spas, centros de estética, uñas, pestañas, depilación y cosmetología. Reservas 24/7, cobro de señas con Mercado Pago, gestión de profesionales y clientes. Empezá gratis.',
  keywords: [
    'turnos peluquería online',
    'sistema turnos barbería',
    'reservas spa online',
    'cobro señas estética',
    'agenda peluquería automática',
    'sistema turnos belleza',
    'turnos uñas online',
    'agenda barbería digital',
    'reservas peluquería WhatsApp',
    'sistema de turnos para salón de belleza',
    'turnos pestañas y cejas',
    'turnos depilación online',
    'software gestión peluquería',
    'cobro seña Mercado Pago peluquería',
  ],
  openGraph: {
    title: 'TurnoLink para Belleza & Bienestar — Tu salón lleno, tu WhatsApp libre',
    description:
      'Tus clientes reservan solos desde Instagram. Pagan la seña con Mercado Pago. Empezá gratis en 5 minutos.',
    type: 'website',
  },
};

export default function BellezaPage() {
  return <BellezaLanding />;
}
