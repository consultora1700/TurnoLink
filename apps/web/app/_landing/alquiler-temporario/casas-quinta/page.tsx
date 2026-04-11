import type { Metadata } from 'next';
import { CasasQuintaLanding } from './casas-quinta-landing';
import { fetchPricingByGroup } from '../../_components/pricing-api';

export const metadata: Metadata = {
  title: 'TurnoLink para Casas Quinta — Reservas por Día con Seña Automática y Calendario Online',
  description:
    'Sistema de reservas para casas quinta, casas de campo, quintas con pileta y espacios rurales. Calendario por día, cobro de seña con Mercado Pago, precios por temporada, fotos y disponibilidad en tiempo real. Probá 14 días gratis.',
  keywords: [
    'reservas casa quinta online',
    'alquiler quinta por dia',
    'sistema reservas quinta con pileta',
    'cobro seña casa de campo',
    'calendario reservas quinta',
    'alquiler casa quinta finde',
    'sistema alquiler quinta Buenos Aires',
    'reservas quintas zona norte',
    'quinta para eventos reservas',
    'alquiler temporario casa de campo',
    'software gestión quintas',
    'reservas quinta con parrilla',
    'seña Mercado Pago quinta',
    'disponibilidad online casa quinta',
  ],
  openGraph: {
    title: 'TurnoLink para Casas Quinta — Reservas confirmadas, señas cobradas',
    description:
      'Calendario por día, cobro de seña automático y precios por temporada para tu quinta. Probá 14 días gratis.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://turnolink.com.ar/alquiler-temporario/casas-quinta',
  },
};

export default async function CasasQuintaPage() {
  const pricing = await fetchPricingByGroup('alquiler-temporario');
  return <CasasQuintaLanding dynamicPricing={pricing?.tiers} />;
}
