import type { Metadata } from 'next';
import { BellezaLanding } from './belleza-landing';
import { BELLEZA_FAQS } from './belleza-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'Turnos para Peluquerías y Salones de Belleza',
  description:
    'Sistema de reservas online para peluquerías, barberías, spas y centros de estética. Cobro de señas con Mercado Pago, recordatorios automáticos. 14 días gratis.',
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
  alternates: {
    canonical: `${SITE_URL}/belleza`,
  },
};

export default async function BellezaPage() {
  const pricing = await fetchPricingByGroup('belleza');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Belleza & Bienestar', url: `${SITE_URL}/belleza` },
      ]} />
      <FaqJsonLd faqs={BELLEZA_FAQS} />
      <BellezaLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
