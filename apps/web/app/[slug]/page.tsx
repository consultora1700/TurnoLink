import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { PublicBookingPage } from '@/components/booking/public-booking-page';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const tenant = await publicApi.getTenant(params.slug) as {
      name: string;
      description: string | null;
      logo: string | null;
      coverImage: string | null;
    };
    const title = `${tenant.name} - Reservar Turno`;
    const description = tenant.description || `Reserva tu turno en ${tenant.name}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Negocio no encontrado',
    };
  }
}

export default async function BusinessPage({ params }: Props) {
  let tenant;

  try {
    tenant = await publicApi.getTenant(params.slug);
  } catch {
    notFound();
  }

  return <PublicBookingPage tenant={tenant} slug={params.slug} />;
}
