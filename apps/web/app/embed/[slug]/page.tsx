import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { EmbedBookingPage } from '@/components/booking/embed-booking-page';

interface Props {
  params: { slug: string };
}

export default async function EmbedPage({ params }: Props) {
  let tenant;

  try {
    tenant = await publicApi.getTenant(params.slug);
  } catch {
    notFound();
  }

  return <EmbedBookingPage tenant={tenant} slug={params.slug} />;
}
