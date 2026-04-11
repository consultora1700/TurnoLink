import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCitySlugs, getCityData, CITIES } from '../../_landing/_data/cities';
import { CityLandingPage } from '../../_landing/_components/city-landing-page';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../../_landing/_components/seo-schemas';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

export async function generateStaticParams() {
  return getCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityData(citySlug);
  if (!city) return {};

  return {
    title: city.seo.title,
    description: city.seo.description,
    keywords: city.seo.keywords,
    openGraph: {
      title: city.seo.title,
      description: city.seo.description,
      type: 'website',
    },
    alternates: {
      canonical: `${SITE_URL}/turnos-online/${citySlug}`,
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = getCityData(citySlug);
  if (!city) notFound();

  const allCities = Object.values(CITIES).map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: 'Turnos Online', url: `${SITE_URL}/turnos-online` },
        { name: city.name, url: `${SITE_URL}/turnos-online/${citySlug}` },
      ]} />
      <FaqJsonLd faqs={city.faqs} />
      <CityLandingPage city={city} allCities={allCities} />
    </>
  );
}
