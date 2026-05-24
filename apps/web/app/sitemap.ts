import type { MetadataRoute } from 'next';
import { execSync } from 'child_process';
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
  'turnos-profesionales',
] as const;

const BUILD_TIME_ISO = new Date().toISOString();
const gitDateCache = new Map<string, string>();

function resolveRepoRoot(): string | null {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf-8',
      timeout: 2000,
    }).trim() || null;
  } catch {
    return null;
  }
}

const REPO_ROOT = resolveRepoRoot();

function gitLastMod(relPath: string): string {
  const cached = gitDateCache.get(relPath);
  if (cached) return cached;
  if (!REPO_ROOT) {
    gitDateCache.set(relPath, BUILD_TIME_ISO);
    return BUILD_TIME_ISO;
  }
  try {
    const out = execSync(`git log -1 --format=%aI -- "${relPath}"`, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      timeout: 2000,
    }).trim();
    const iso = out || BUILD_TIME_ISO;
    gitDateCache.set(relPath, iso);
    return iso;
  } catch {
    gitDateCache.set(relPath, BUILD_TIME_ISO);
    return BUILD_TIME_ISO;
  }
}

function maxDate(a: string, b: string): string {
  return a > b ? a : b;
}

async function getActiveTenants(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/tenants/sitemap`, {
      next: { revalidate: 3600 },
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
      updatedAt: p.updatedAt || BUILD_TIME_ISO,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeMod = maxDate(
    gitLastMod('apps/web/app/page.tsx'),
    gitLastMod('apps/web/app/layout.tsx'),
  );

  /* ─── Static pages ─── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0, lastModified: homeMod },
    { url: `${BASE_URL}/para/talento`, changeFrequency: 'monthly', priority: 0.7, lastModified: gitLastMod('apps/web/app/para/talento/page.tsx') },
    { url: `${BASE_URL}/integrar`, changeFrequency: 'monthly', priority: 0.7, lastModified: gitLastMod('apps/web/app/integrar/page.tsx') },
    { url: `${BASE_URL}/register`, changeFrequency: 'monthly', priority: 0.8, lastModified: gitLastMod('apps/web/app/(auth)/register/page.tsx') },
    { url: `${BASE_URL}/explorar-talento`, changeFrequency: 'weekly', priority: 0.6, lastModified: gitLastMod('apps/web/app/explorar-talento/page.tsx') },
    { url: `${BASE_URL}/terminos`, changeFrequency: 'yearly', priority: 0.3, lastModified: gitLastMod('apps/web/app/terminos/page.tsx') },
    { url: `${BASE_URL}/privacidad`, changeFrequency: 'yearly', priority: 0.3, lastModified: gitLastMod('apps/web/app/privacidad/page.tsx') },
  ];

  /* ─── Industry parent pages + sub-niche pages ─── */
  const industryPages: MetadataRoute.Sitemap = [];

  for (const industry of INDUSTRIES) {
    const industryMod = gitLastMod(`apps/web/app/_landing/${industry}/page.tsx`);
    industryPages.push({
      url: `${BASE_URL}/${industry}`,
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified: industryMod,
    });

    try {
      const slugs = await getSubNicheSlugs(industry);
      for (const slug of slugs) {
        const subNicheMod = maxDate(
          industryMod,
          gitLastMod(`apps/web/app/_landing/_data/${industry}/${slug}.ts`),
        );
        industryPages.push({
          url: `${BASE_URL}/${industry}/${slug}`,
          changeFrequency: 'weekly',
          priority: 0.8,
          lastModified: subNicheMod,
        });
      }
    } catch {
      // Skip if niche has no sub-niches
    }
  }

  // Static sub-niche pages not in the niche-registry
  const extraPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/salud/psicologos`, changeFrequency: 'weekly', priority: 0.8, lastModified: gitLastMod('apps/web/app/_landing/salud/psicologos/page.tsx') },
  ];

  /* ─── City landing pages ─── */
  const citiesMod = gitLastMod('apps/web/app/_landing/_data/cities.ts');
  const cityPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/turnos-online`, changeFrequency: 'monthly', priority: 0.8, lastModified: citiesMod },
  ];
  for (const citySlug of getCitySlugs()) {
    cityPages.push({
      url: `${BASE_URL}/turnos-online/${citySlug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: citiesMod,
    });
  }

  /* ─── Dynamic tenant storefronts + products ─── */
  const tenantPages: MetadataRoute.Sitemap = [];
  const tenants = await getActiveTenants();

  for (const tenant of tenants) {
    tenantPages.push({
      url: `${BASE_URL}/${tenant.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: tenant.updatedAt,
    });
  }

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
