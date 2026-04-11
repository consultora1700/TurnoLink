import type { IndustryData } from '../_components/industry-page';

/* ─── Sub-niche data extends IndustryData with accent + breadcrumb + SEO ─── */

export interface SubNicheData extends IndustryData {
  /** Accent color hex (e.g. '#EC4899') — inherited from parent niche */
  accent: string;
  /** Parent niche URL for breadcrumb (e.g. '/belleza') */
  parentNicheUrl: string;
  /** Parent niche display label (e.g. 'Belleza & Bienestar') */
  parentNicheLabel: string;
  /** SEO metadata */
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

/* ─── Niche configuration ─── */

export interface NicheConfig {
  slug: string;
  label: string;
  accent: string;
  url: string;
  subNiches: Record<string, SubNicheData>;
}
