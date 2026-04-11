import type { Metadata } from 'next';
import { DeportesLanding } from './deportes-landing';
import { DEPORTES_FAQS } from './deportes-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'TurnoLink para Deportes — Reservas Online para Canchas, Estudios y Espacios por Hora',
  description:
    'Sistema de reservas para canchas de fútbol, pádel, tenis, básquet, estudios de danza, gimnasios, entrenadores personales, salas de ensayo y estudios de grabación. Reservas online 24/7, cobro de señas con Mercado Pago, gestión de múltiples espacios. Empezá gratis.',
  keywords: [
    'reserva canchas online',
    'sistema turnos cancha fútbol',
    'reservas pádel online',
    'sistema reservas club deportivo',
    'cobro señas cancha',
    'gestión canchas deportivas',
    'reservas tenis online',
    'turnos básquet online',
    'reserva estudio de danza',
    'turnos gimnasio por clase',
    'sistema reservas sala de ensayo',
    'reservas estudio de grabación',
    'alquiler canchas por hora',
    'software gestión complejo deportivo',
    'reservas espacios deportivos online',
    'cobro seña Mercado Pago cancha',
  ],
  openGraph: {
    title: 'TurnoLink para Deportes — Espacios llenos, gestión en cero',
    description:
      'Reservas automáticas para canchas, estudios y espacios por hora. Cobro de señas con Mercado Pago. Empezá gratis en 5 minutos.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/deportes`,
  },
};

export default async function DeportesPage() {
  const pricing = await fetchPricingByGroup('deportes');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Deportes & Recreación', url: `${SITE_URL}/deportes` },
      ]} />
      <FaqJsonLd faqs={DEPORTES_FAQS} />
      <DeportesLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
