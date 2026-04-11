import type { Metadata } from 'next';
import { CITIES } from '../_landing/_data/cities';
import { CitiesIndexPage } from './cities-index';
import { BreadcrumbListJsonLd } from '../_landing/_components/seo-schemas';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

export const metadata: Metadata = {
  title: 'Turnos Online en Argentina — Sistema de Reservas por Ciudad',
  description:
    'Encontrá TurnoLink en tu ciudad. Sistema de turnos online para negocios en Buenos Aires, Córdoba, Rosario, Mendoza, Tucumán y más. Reservas 24/7, cobro con Mercado Pago. Empezá gratis.',
  keywords: [
    'turnos online argentina',
    'sistema de reservas argentina',
    'turnos online buenos aires',
    'turnos online córdoba',
    'turnos online rosario',
    'reservas online argentina',
    'agenda digital argentina',
  ],
  openGraph: {
    title: 'Turnos Online en Argentina — TurnoLink en tu ciudad',
    description: 'Sistema de turnos online para negocios en las principales ciudades de Argentina. Empezá gratis.',
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/turnos-online`,
  },
};

export default function TurnosOnlinePage() {
  const cities = Object.values(CITIES).map((c) => ({
    slug: c.slug,
    name: c.name,
    province: c.province,
    description: c.description,
  }));

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Turnos Online por Ciudad', url: `${SITE_URL}/turnos-online` },
      ]} />
      <CitiesIndexPage cities={cities} />
    </>
  );
}
