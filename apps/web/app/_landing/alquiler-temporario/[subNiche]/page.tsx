import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSubNicheSlugs, getSubNicheData } from '../../_data/niche-registry';
import { IndustryPage } from '../../_components/industry-page';
import { fetchPricingByGroup } from '../../_components/pricing-api';
import { BreadcrumbListJsonLd, FaqJsonLd } from '../../_components/seo-schemas';

const NICHE = 'alquiler-temporario';
const NICHE_LABEL = 'Alquiler Temporario';
const SITE_URL = 'https://turnolink.com.ar';

export async function generateStaticParams() {
  const slugs = await getSubNicheSlugs(NICHE);
  return slugs.map((subNiche) => ({ subNiche }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subNiche: string }>;
}): Promise<Metadata> {
  const { subNiche } = await params;
  const data = await getSubNicheData(NICHE, subNiche);
  if (!data) return {};
  return {
    title: data.seo.title,
    description: data.seo.description,
    keywords: data.seo.keywords,
    openGraph: {
      title: data.seo.title,
      description: data.seo.description,
    },
    alternates: {
      canonical: `${SITE_URL}/${NICHE}/${subNiche}`,
    },
  };
}

export default async function SubNichePage({
  params,
}: {
  params: Promise<{ subNiche: string }>;
}) {
  const { subNiche } = await params;
  const data = await getSubNicheData(NICHE, subNiche);
  if (!data) notFound();

  const dynamicPricing = await fetchPricingByGroup(NICHE);
  const finalData = dynamicPricing ? { ...data, pricing: dynamicPricing } : data;

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'TurnoLink', url: SITE_URL },
        { name: NICHE_LABEL, url: `${SITE_URL}/${NICHE}` },
        { name: data.pill.replace(/^[^\w]*\s*/, ''), url: `${SITE_URL}/${NICHE}/${subNiche}` },
      ]} />
      <FaqJsonLd faqs={data.faqs} />
      <IndustryPage data={finalData} />
    </>
  );
}
