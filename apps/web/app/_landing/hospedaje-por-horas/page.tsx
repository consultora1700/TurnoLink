import type { Metadata } from 'next';
import { HospedajeLanding } from './hospedaje-landing';
import { HOSPEDAJE_FAQS } from './hospedaje-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'TurnoLink para Hospedaje por Horas — Turnos por Bloque 24/7 para Albergues, Hoteles y Boxes',
  description:
    'Sistema de reservas y gestión para albergues transitorios, hoteles por turno, hostels por bloque, habitaciones de 12 horas y boxes privados. Check-in digital, cobro automático con Mercado Pago, buffer de limpieza entre turnos, dashboard de ocupación 24/7. Probá 14 días gratis.',
  keywords: [
    'sistema reservas albergue transitorio',
    'turnos hotel por hora',
    'software gestión albergue',
    'reservas hospedaje por horas',
    'cobro automático hospedaje',
    'gestión habitaciones por hora',
    'sistema turnos hospedaje 24/7',
    'check-in digital hotel',
    'reservas boxes privados',
    'hostel por bloque horario',
    'habitaciones 12 horas sistema',
    'dashboard ocupación hotel',
    'cobro seña Mercado Pago hospedaje',
    'buffer limpieza entre turnos',
    'gestión alta rotación habitaciones',
    'sistema albergue transitorio Argentina',
  ],
  openGraph: {
    title: 'TurnoLink para Hospedaje por Horas — Ocupación máxima, gestión mínima',
    description:
      'Turnos por bloque 24/7 con check-in digital, cobro automático y buffer de limpieza. Probá 14 días gratis.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/hospedaje-por-horas`,
  },
};

export default async function HospedajePorHorasPage() {
  const pricing = await fetchPricingByGroup('hospedaje-por-horas');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Hospedaje por Horas', url: `${SITE_URL}/hospedaje-por-horas` },
      ]} />
      <FaqJsonLd faqs={HOSPEDAJE_FAQS} />
      <HospedajeLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
