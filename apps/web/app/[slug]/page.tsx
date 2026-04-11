import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { PublicBookingPage } from '@/components/booking/public-booking-page';
import { PublicStorefront } from '@/components/storefront/public-storefront';
import { PublicCatalogPage } from '@/components/storefront/public-catalog-page';
import { isCatalogRubro, isMercadoRubro } from '@/lib/rubro-attributes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

// ISR: regenerate every 10 seconds for fresh content with caching
export const revalidate = 10;

interface Props {
  params: { slug: string };
}

async function getReviewStats(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/public/reviews/${slug}/stats`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  try {
    const [tenant, branding] = await Promise.all([
      publicApi.getTenant(params.slug) as Promise<{
        name: string;
        description: string | null;
        logo: string | null;
        coverImage: string | null;
        settings: { rubro?: string; storeType?: string };
      }>,
      publicApi.getBranding(params.slug).catch(() => null) as Promise<{
        metaTitle?: string | null;
        metaDescription?: string | null;
      } | null>,
    ]);

    const isMercado = isMercadoRubro(tenant.settings?.rubro || '');

    // Use branding SEO fields if configured, otherwise smart defaults
    const title = branding?.metaTitle
      || (isMercado ? `${tenant.name} — Tienda Online` : `${tenant.name} - Reservar Turno`);
    const description = branding?.metaDescription
      || tenant.description
      || (isMercado
        ? `Explorá los productos de ${tenant.name}. Comprá online con envío o retiro.`
        : `Reservá tu turno en ${tenant.name}. Agenda online 24/7.`);

    const ogImage = tenant.coverImage || tenant.logo || `${SITE_URL}/og-image.jpg?v=2`;
    const canonicalUrl = `${SITE_URL}/${params.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        url: canonicalUrl,
        siteName: tenant.name,
        ...(ogImage !== `${SITE_URL}/og-image.jpg?v=2` ? { images: [{ url: ogImage, width: 1200, height: 630, alt: tenant.name }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(ogImage !== `${SITE_URL}/og-image.jpg?v=2` ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return {
      title: 'Negocio no encontrado',
    };
  }
}

// JSON-LD: LocalBusiness + AggregateRating
function BusinessJsonLd({ tenant, stats, slug }: { tenant: any; stats: any; slug: string }) {
  const canonicalUrl = `${SITE_URL}/${slug}`;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': canonicalUrl,
    name: tenant.name,
    url: canonicalUrl,
    description: tenant.description || undefined,
    image: tenant.coverImage || tenant.logo || undefined,
    logo: tenant.logo || undefined,
    telephone: tenant.phone || undefined,
  };

  if (tenant.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: tenant.address,
      addressLocality: tenant.city || undefined,
      addressCountry: 'AR',
    };
  }

  // Social profiles
  const sameAs: string[] = [];
  if (tenant.instagram) sameAs.push(`https://instagram.com/${tenant.instagram.replace('@', '')}`);
  if (tenant.facebook) sameAs.push(tenant.facebook.startsWith('http') ? tenant.facebook : `https://facebook.com/${tenant.facebook}`);
  if (tenant.website) sameAs.push(tenant.website);
  if (sameAs.length > 0) jsonLd.sameAs = sameAs;

  // Reviews
  if (stats && stats.totalReviews > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: stats.averageRating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      reviewCount: stats.totalReviews,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// JSON-LD: BreadcrumbList
function BreadcrumbJsonLd({ tenant, slug }: { tenant: any; slug: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'TurnoLink',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tenant.name,
        item: `${SITE_URL}/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// JSON-LD: Store (for mercado tenants)
function StoreJsonLd({ tenant, products, slug }: { tenant: any; products: any[]; slug: string }) {
  const canonicalUrl = `${SITE_URL}/${slug}`;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': canonicalUrl,
    name: tenant.name,
    url: canonicalUrl,
    description: tenant.description || undefined,
    image: tenant.coverImage || tenant.logo || undefined,
    logo: tenant.logo || undefined,
    telephone: tenant.phone || undefined,
    currenciesAccepted: 'ARS',
  };

  if (tenant.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: tenant.address,
      addressLocality: tenant.city || undefined,
      addressCountry: 'AR',
    };
  }

  // Social profiles
  const sameAs: string[] = [];
  if (tenant.instagram) sameAs.push(`https://instagram.com/${tenant.instagram.replace('@', '')}`);
  if (tenant.facebook) sameAs.push(tenant.facebook.startsWith('http') ? tenant.facebook : `https://facebook.com/${tenant.facebook}`);
  if (tenant.website) sameAs.push(tenant.website);
  if (sameAs.length > 0) jsonLd.sameAs = sameAs;

  // Product catalog as offers
  if (products.length > 0) {
    jsonLd.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `Productos de ${tenant.name}`,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((p: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          url: p.slug ? `${canonicalUrl}/producto/${p.slug}` : undefined,
          image: p.images?.[0] || undefined,
          offers: {
            '@type': 'Offer',
            price: p.price?.toString() || '0',
            priceCurrency: 'ARS',
            availability: p.stock > 0 || p.stock === null
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        },
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// JSON-LD: Service list (for booking tenants)
function ServiceListJsonLd({ tenant, slug }: { tenant: any; slug: string }) {
  const services = tenant.services?.filter((s: any) => s.isActive && s.visibleOnPublicPage) || [];
  if (services.length === 0) return null;

  const canonicalUrl = `${SITE_URL}/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Servicios de ${tenant.name}`,
    numberOfItems: services.length,
    itemListElement: services.slice(0, 30).map((s: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.name,
        description: s.description || undefined,
        provider: {
          '@type': 'LocalBusiness',
          name: tenant.name,
          url: canonicalUrl,
        },
        offers: s.price ? {
          '@type': 'Offer',
          price: s.promoPrice?.toString() || s.price.toString(),
          priceCurrency: 'ARS',
        } : undefined,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BusinessPage({ params }: Props) {
  let tenant;

  try {
    tenant = await publicApi.getTenant(params.slug);
  } catch {
    notFound();
  }

  // Catalog tenants (mercado, inmobiliarias): ecommerce gets full storefront, catalogo gets card-style catalog
  const tenantRubro = (tenant.settings as any)?.rubro || '';
  const isCatalogRubroFlag = isCatalogRubro(tenantRubro);
  const storeType = (tenant.settings as any)?.storeType || 'catalogo';

  if (isCatalogRubroFlag) {
    // Fetch storefront data in parallel
    const isInmobiliaria = tenantRubro === 'inmobiliarias';
    const [products, categories, branding, developments] = await Promise.all([
      publicApi.getProducts(params.slug).catch(() => []),
      publicApi.getProductCategories(params.slug).catch(() => []),
      publicApi.getBranding(params.slug).catch(() => null),
      isInmobiliaria ? publicApi.getDevelopments(params.slug).catch(() => []) : Promise.resolve([]),
    ]);

    // E-commerce mode: full storefront with cart/checkout
    if (storeType === 'ecommerce') {
      return (
        <>
          <StoreJsonLd tenant={tenant} products={products} slug={params.slug} />
          <BreadcrumbJsonLd tenant={tenant} slug={params.slug} />
          <PublicStorefront
            tenant={tenant}
            slug={params.slug}
            products={products}
            categories={categories}
            branding={branding}
            developments={developments}
          />
        </>
      );
    }

    // Catalog mode: card-style page with WhatsApp CTA (like booking page but for products)
    return (
      <>
        <StoreJsonLd tenant={tenant} products={products} slug={params.slug} />
        <BreadcrumbJsonLd tenant={tenant} slug={params.slug} />
        <PublicCatalogPage
          tenant={tenant}
          slug={params.slug}
          products={products}
          categories={categories}
          branding={branding}
          showAds={(tenant as any).showAds === true}
          developments={developments}
        />
      </>
    );
  }

  const stats = await getReviewStats(params.slug);

  return (
    <>
      <BusinessJsonLd tenant={tenant} stats={stats} slug={params.slug} />
      <BreadcrumbJsonLd tenant={tenant} slug={params.slug} />
      <ServiceListJsonLd tenant={tenant} slug={params.slug} />
      <PublicBookingPage tenant={tenant} slug={params.slug} />
    </>
  );
}
