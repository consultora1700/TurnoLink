import type { NicheConfig, SubNicheData } from './types';

/* ─── Lazy loaders for each niche data file ─── */

const NICHE_LOADERS: Record<string, () => Promise<{ default: NicheConfig }>> = {
  belleza: () => import('./belleza') as Promise<{ default: NicheConfig }>,
  salud: () => import('./salud') as Promise<{ default: NicheConfig }>,
  deportes: () => import('./deportes') as Promise<{ default: NicheConfig }>,
  'hospedaje-por-horas': () => import('./hospedaje-por-horas') as Promise<{ default: NicheConfig }>,
  'alquiler-temporario': () => import('./alquiler-temporario') as Promise<{ default: NicheConfig }>,
  'espacios-flexibles': () => import('./espacios-flexibles') as Promise<{ default: NicheConfig }>,
  mercado: () => import('./mercado') as Promise<{ default: NicheConfig }>,
};

/* ─── Cached configs ─── */

const cache: Record<string, NicheConfig> = {};

async function loadNiche(nicheSlug: string): Promise<NicheConfig> {
  if (cache[nicheSlug]) return cache[nicheSlug];
  const loader = NICHE_LOADERS[nicheSlug];
  if (!loader) throw new Error(`Unknown niche: ${nicheSlug}`);
  const mod = await loader();
  cache[nicheSlug] = mod.default;
  return mod.default;
}

/* ─── Public helpers ─── */

/** Get all sub-niche slugs for generateStaticParams() */
export async function getSubNicheSlugs(nicheSlug: string): Promise<string[]> {
  const niche = await loadNiche(nicheSlug);
  return Object.keys(niche.subNiches);
}

/** Get the full SubNicheData for a specific sub-niche */
export async function getSubNicheData(
  nicheSlug: string,
  subNicheSlug: string
): Promise<SubNicheData | null> {
  const niche = await loadNiche(nicheSlug);
  const data = niche.subNiches[subNicheSlug];
  if (!data) return null;
  return { ...data, industrySlug: nicheSlug };
}

/** Get the NicheConfig for metadata generation */
export async function getNicheConfig(nicheSlug: string): Promise<NicheConfig> {
  return loadNiche(nicheSlug);
}
