import type { MetadataRoute } from 'next';
import { getSubNicheSlugs } from './_landing/_data/niche-registry';
import { getCitySlugs } from './_landing/_data/cities';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const INDUSTRIES = [
  'belleza',
  'salud',
  'deportes',
  'hospedaje-por-horas',
  'alquiler-temporario',
  'espacios-flexibles',
  'mercado',
  'turnos-profesionales',
] as const;

async function getActiveTenants(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/tenants/sitemap`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getTenantProducts(slug: string): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/tenants/${slug}/products`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const products = await res.json();
    return products.map((p: any) => ({
      slug: p.slug,
      updatedAt: p.updatedAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  /* ─── Static pages ─── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0, lastModified: now },
    { url: `${BASE_URL}/para/talento`, changeFrequency: 'monthly', priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/integrar`, changeFrequency: 'monthly', priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/register`, changeFrequency: 'monthly', priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/explorar-talento`, changeFrequency: 'weekly', priority: 0.6, lastModified: now },
    { url: `${BASE_URL}/finanzas`, changeFrequency: 'weekly', priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/terminos`, changeFrequency: 'yearly', priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/privacidad`, changeFrequency: 'yearly', priority: 0.3, lastModified: now },
  ];

  /* ─── Industry parent pages + sub-niche pages ─── */
  const industryPages: MetadataRoute.Sitemap = [];

  for (const industry of INDUSTRIES) {
    industryPages.push({
      url: `${BASE_URL}/${industry}`,
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified: now,
    });

    try {
      const slugs = await getSubNicheSlugs(industry);
      for (const slug of slugs) {
        industryPages.push({
          url: `${BASE_URL}/${industry}/${slug}`,
          changeFrequency: 'weekly',
          priority: 0.8,
          lastModified: now,
        });
      }
    } catch {
      // Skip if niche has no sub-niches
    }
  }

  // Static sub-niche pages not in the niche-registry
  const extraPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/salud/psicologos`, changeFrequency: 'weekly', priority: 0.8, lastModified: now },
  ];

  /* ─── City landing pages ─── */
  const cityPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/turnos-online`, changeFrequency: 'monthly', priority: 0.8, lastModified: now },
  ];
  for (const citySlug of getCitySlugs()) {
    cityPages.push({
      url: `${BASE_URL}/turnos-online/${citySlug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: now,
    });
  }

  /* ─── Dynamic tenant storefronts + products ─── */
  const tenantPages: MetadataRoute.Sitemap = [];
  const tenants = await getActiveTenants();

  // Add tenant storefront pages
  for (const tenant of tenants) {
    tenantPages.push({
      url: `${BASE_URL}/${tenant.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: tenant.updatedAt,
    });
  }

  // Fetch all tenant products in parallel (chunks of 10 to avoid overwhelming the API)
  const CHUNK_SIZE = 10;
  for (let i = 0; i < tenants.length; i += CHUNK_SIZE) {
    const chunk = tenants.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map(async (tenant) => {
        const products = await getTenantProducts(tenant.slug);
        return products.map((product) => ({
          url: `${BASE_URL}/${tenant.slug}/producto/${product.slug}`,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
          lastModified: product.updatedAt,
        }));
      }),
    );
    for (const productPages of results) {
      tenantPages.push(...productPages);
    }
  }

  return [...staticPages, ...industryPages, ...extraPages, ...cityPages, ...tenantPages];
}
