import type { Metadata } from 'next';
import { GastronomiaLanding } from './gastronomia-landing';
import { GASTRONOMIA_FAQS } from './gastronomia-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'TurnoLink para Gastronomía — Reservas Online, Carta Digital y Gestión para Restaurantes',
  description:
    'Sistema de reservas online para restaurantes, bares, cafeterías y locales gastronómicos. Carta digital con QR, reserva de mesas 24/7, cobro con Mercado Pago, control financiero y gestión de sucursales. Empezá gratis.',
  keywords: [
    'reservas restaurante online',
    'carta digital QR',
    'menú online restaurante',
    'sistema restaurante',
    'reserva de mesas online',
    'carta digital con fotos',
    'sistema gastronómico',
    'reservas bar online',
    'gestión restaurante',
    'cobro Mercado Pago restaurante',
    'menú digital QR',
    'software para restaurantes',
    'reservas cafetería online',
    'control de caja restaurante',
  ],
  openGraph: {
    title: 'TurnoLink para Gastronomía — Tu restaurante en una sola app',
    description:
      'Reservas de mesas, carta digital con fotos y gestión financiera. Todo integrado. Empezá gratis en 5 minutos.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/gastronomia`,
  },
};

export default async function GastronomiaPage() {
  const pricing = await fetchPricingByGroup('gastronomia');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Gastronomía', url: `${SITE_URL}/gastronomia` },
      ]} />
      <FaqJsonLd faqs={GASTRONOMIA_FAQS} />
      <GastronomiaLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
