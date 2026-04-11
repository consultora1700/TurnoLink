import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { ProductDetail } from '@/components/storefront/product-detail';
import { ProductDetailThemeWrapper } from '@/components/storefront/product-detail-wrapper';
import { PropertyDetail } from '@/components/storefront/real-estate/property-detail';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

// ISR: regenerate every 10 seconds for fresh content with caching
export const revalidate = 10;

interface Props {
  params: { slug: string; productSlug: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const [product, tenant] = await Promise.all([
      publicApi.getProduct(params.slug, params.productSlug),
      publicApi.getTenant(params.slug),
    ]);

    const image = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;
    const title = `${product.name} — ${tenant.name}`;
    const isRealEstate = (tenant.settings as any)?.rubro === 'inmobiliarias';
    const description = product.shortDescription || product.description || (isRealEstate ? `${product.name} en ${tenant.name}` : `Comprá ${product.name} en ${tenant.name}`);
    const canonicalUrl = `${SITE_URL}/${params.slug}/producto/${params.productSlug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: product.name,
        description,
        type: 'website',
        url: canonicalUrl,
        siteName: tenant.name,
        ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: product.name }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: 'Producto no encontrado' };
  }
}

// JSON-LD: Product + Offer
function ProductJsonLd({ product, tenant, slug }: { product: any; tenant: any; slug: string }) {
  const image = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;
  const canonicalUrl = `${SITE_URL}/${slug}/producto/${product.slug}`;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': canonicalUrl,
    name: product.name,
    url: canonicalUrl,
    description: product.shortDescription || product.description || undefined,
    image: image || undefined,
    brand: {
      '@type': 'Organization',
      name: tenant.name,
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: product.currency || 'ARS',
      price: product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: tenant.name,
      },
    },
  };

  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    jsonLd.offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// JSON-LD: BreadcrumbList
function BreadcrumbJsonLd({ product, tenant, slug }: { product: any; tenant: any; slug: string }) {
  const items: any[] = [
    { '@type': 'ListItem', position: 1, name: 'TurnoLink', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: tenant.name, item: `${SITE_URL}/${slug}` },
    { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/${slug}/producto/${product.slug}` },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
      }) }}
    />
  );
}

export default async function ProductoPage({ params }: Props) {
  let tenant: any, product: any, branding: any;
  let relatedProducts: any[] = [];

  try {
    [tenant, product, branding] = await Promise.all([
      publicApi.getTenant(params.slug),
      publicApi.getProduct(params.slug, params.productSlug),
      publicApi.getBranding(params.slug).catch(() => null),
    ]);
  } catch {
    notFound();
  }

  // Fetch related products (same category)
  try {
    const allProducts = await publicApi.getProducts(
      params.slug,
      product.categoryId || undefined,
    );
    relatedProducts = allProducts
      .filter((p: any) => p.id !== product.id && p.isActive)
      .slice(0, 4);
  } catch {
    relatedProducts = [];
  }

  const settings = tenant.settings as any;
  const isInmobiliaria = settings?.rubro === 'inmobiliarias';

  // Inmobiliarias get their own premium property detail page
  if (isInmobiliaria) {
    return (
      <>
        <RealEstateJsonLd product={product} tenant={tenant} slug={params.slug} />
        <BreadcrumbJsonLd product={product} tenant={tenant} slug={params.slug} />
        <PropertyDetail
          tenant={tenant}
          slug={params.slug}
          product={product}
          branding={branding}
          relatedProducts={relatedProducts}
        />
      </>
    );
  }

  return (
    <>
      <ProductJsonLd product={product} tenant={tenant} slug={params.slug} />
      <BreadcrumbJsonLd product={product} tenant={tenant} slug={params.slug} />
      <ProductDetailThemeWrapper
        tenant={tenant}
        slug={params.slug}
        product={product}
        branding={branding}
        relatedProducts={relatedProducts}
        settings={settings}
      />
    </>
  );
}

// JSON-LD: RealEstateListing (for inmobiliarias)
function RealEstateJsonLd({ product, tenant, slug }: { product: any; tenant: any; slug: string }) {
  const image = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;
  const canonicalUrl = `${SITE_URL}/${slug}/producto/${product.slug}`;
  const attrs = product.attributes || [];
  const getVal = (key: string) => attrs.find((a: any) => a.key === key)?.value;
  const operacion = getVal('operacion');

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': canonicalUrl,
    name: product.name,
    url: canonicalUrl,
    description: product.shortDescription || product.description || undefined,
    image: image || undefined,
    datePosted: product.createdAt,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: operacion === 'Alquiler' ? 'ARS' : (product.currency || 'USD'),
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'RealEstateAgent',
        name: tenant.name,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
