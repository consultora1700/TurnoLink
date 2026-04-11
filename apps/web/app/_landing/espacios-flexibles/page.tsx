import type { Metadata } from 'next';
import { EspaciosLanding } from './espacios-landing';
import { ESPACIOS_FAQS } from './espacios-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'TurnoLink para Espacios de Trabajo — Reservas para Coworking, Oficinas y Salas de Reuniones',
  description:
    'Sistema de reservas para coworking, oficinas por hora, salas de reuniones, boxes profesionales y estudios compartidos. Reservas online 24/7, cobro automático con Mercado Pago, dashboard de ocupación, precios por franja horaria. Probá 14 días gratis.',
  keywords: [
    'sistema reservas coworking',
    'reservas oficinas por hora',
    'sistema turnos sala reuniones',
    'alquiler sala reuniones online',
    'cobro automático coworking',
    'gestión espacios flexibles',
    'reservas boxes profesionales',
    'estudios compartidos reservas',
    'coworking gestión escritorios',
    'hot desk sistema reservas',
    'dashboard ocupación coworking',
    'cobro seña Mercado Pago espacios',
    'precios por franja horaria salas',
    'reservas espacios trabajo Argentina',
    'software gestión coworking',
    'oficinas flexibles reservas online',
  ],
  openGraph: {
    title: 'TurnoLink para Espacios de Trabajo — Cada espacio ocupado, sin mover un dedo',
    description:
      'Reservas online 24/7 para coworkings, salas y oficinas flexibles. Cobro automático, dashboard de ocupación y precios por franja. Probá 14 días gratis.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/espacios-flexibles`,
  },
};

export default async function EspaciosFlexiblesPage() {
  const pricing = await fetchPricingByGroup('espacios-flexibles');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Espacios Flexibles', url: `${SITE_URL}/espacios-flexibles` },
      ]} />
      <FaqJsonLd faqs={ESPACIOS_FAQS} />
      <EspaciosLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
