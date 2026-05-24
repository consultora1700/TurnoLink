import type { Metadata } from 'next';
import { AlquilerLanding } from './alquiler-landing';
import { ALQUILER_FAQS } from './alquiler-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'Reservas por Día para Cabañas y Quintas',
  description:
    'Sistema de reservas por día para cabañas, quintas, departamentos temporarios y salones. Cobro de seña automático y precios por temporada. 14 días gratis.',
  keywords: [
    'sistema reservas cabañas',
    'reservas departamento temporario',
    'cobro señas alquiler temporario',
    'calendario reservas por día',
    'gestión propiedades temporarias',
    'sistema reservas quincho',
    'alquiler casa quinta online',
    'reservas campo recreativo',
    'sistema alquiler salón por día',
    'reservas espacios para eventos',
    'cobro seña Mercado Pago alquiler',
    'precios por temporada cabañas',
    'estadía mínima sistema reservas',
    'gestión alquiler temporario Argentina',
    'software propiedades alquiler día',
    'reservas quinchos online',
  ],
  openGraph: {
    title: 'TurnoLink para Alquiler Temporario — Reservas confirmadas, cobros asegurados',
    description:
      'Calendario por día, cobro de seña automático y precios por temporada. Probá 14 días gratis.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/alquiler-temporario`,
  },
};

export default async function AlquilerTemporarioPage() {
  const pricing = await fetchPricingByGroup('alquiler-temporario');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Alquiler Temporario', url: `${SITE_URL}/alquiler-temporario` },
      ]} />
      <FaqJsonLd faqs={ALQUILER_FAQS} />
      <AlquilerLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
