import type { Metadata } from 'next';
import { SaludLanding } from './salud-landing';
import { SALUD_FAQS } from './salud-faqs';
import { fetchPricingByGroup } from '../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../_components/seo-schemas';

const SITE_URL = 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'TurnoLink para Salud — Agenda Online para Consultorios, Médicos, Odontólogos y Psicólogos',
  description:
    'Sistema de turnos online para consultorios médicos, odontólogos, psicólogos, nutricionistas, kinesiólogos y fonoaudiólogos. Agenda 24/7, recordatorios automáticos, cobro de señas con Mercado Pago. Probá 14 días gratis.',
  keywords: [
    'turnos consultorio online',
    'agenda médica digital',
    'sistema turnos odontólogo',
    'turnos psicólogo online',
    'cobro señas consultorio',
    'agenda profesional online',
    'turnos kinesiólogo online',
    'sistema turnos nutricionista',
    'agenda fonoaudiólogo',
    'turnos fonoaudiólogo online',
    'sistema turnos consultorio médico',
    'reservas consultorio médico',
    'recordatorios pacientes automáticos',
    'cobro seña Mercado Pago consultorio',
  ],
  openGraph: {
    title: 'TurnoLink para Salud — Más consultas, menos teléfono',
    description:
      'Tus pacientes reservan solos. Vos cobrás la seña. Tu agenda se organiza sola. Probá 14 días gratis.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/salud`,
  },
};

export default async function SaludPage() {
  const pricing = await fetchPricingByGroup('salud');
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Salud', url: `${SITE_URL}/salud` },
      ]} />
      <FaqJsonLd faqs={SALUD_FAQS} />
      <SaludLanding dynamicPricing={pricing?.tiers} />
    </>
  );
}
