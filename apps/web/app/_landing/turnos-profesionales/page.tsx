import type { Metadata } from 'next';
import { ProfesionalesLanding } from './profesionales-landing';
import { fetchPricingByGroup } from '../_components/pricing-api';

export const metadata: Metadata = {
  title: 'TurnoLink para Profesionales — Agenda Online para Abogados, Contadores y Escribanos',
  description:
    'Sistema de turnos para estudios jurídicos, contables y notariales. Agenda online 24/7, cobro anticipado de honorarios con Mercado Pago, recordatorios automáticos, videollamadas y base de clientes. Probá 14 días gratis.',
  keywords: [
    'turnos abogados online',
    'agenda contadores digital',
    'sistema escribanía',
    'software estudio jurídico',
    'software estudio contable',
    'software estudio notarial',
    'turnos profesionales argentina',
    'agenda estudio jurídico',
    'cobro honorarios online',
    'sistema citas abogados',
    'reservas consulta contable',
    'turnos escribano online',
  ],
  openGraph: {
    title: 'TurnoLink para Profesionales — Agenda Online para Abogados, Contadores y Escribanos',
    description:
      'Agenda online con cobro de honorarios, recordatorios automáticos y videollamadas. Para estudios jurídicos, contables y notariales que quieren dejar de perseguir clientes.',
  },
  alternates: {
    canonical: 'https://turnolink.com.ar/turnos-profesionales',
  },
};

export default async function ProfesionalesPage() {
  const pricing = await fetchPricingByGroup('profesionales');
  return <ProfesionalesLanding dynamicPricing={pricing?.tiers} />;
}
