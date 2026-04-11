'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';

// All SEO feature slugs
export const SEO_FEATURES = {
  /** Personalizar título y descripción para Google */
  SEO_CUSTOM: 'seo_custom',
  /** Rich snippets: reviews, precios en resultados de Google */
  SEO_RICH_SNIPPETS: 'seo_rich_snippets',
  /** SEO por producto individual (e-commerce) */
  SEO_PRODUCT: 'seo_product',
} as const;

let cachedFeatures: string[] | null = null;

export function usePlanFeatures() {
  const { data: session } = useSession();
  const [features, setFeatures] = useState<string[]>(cachedFeatures || []);
  const [planName, setPlanName] = useState('');
  const [planSlug, setPlanSlug] = useState('');
  const [isLoaded, setIsLoaded] = useState(!!cachedFeatures);

  useEffect(() => {
    if (!session?.accessToken) return;
    if (cachedFeatures) {
      setFeatures(cachedFeatures);
      setIsLoaded(true);
      return;
    }

    let cancelled = false;
    const api = createApiClient(session.accessToken as string);

    api.getSubscription().then((sub) => {
      if (cancelled) return;
      const raw = (sub.plan as any).features || [];
      const parsed: string[] = typeof raw === 'string' ? JSON.parse(raw) : raw;
      cachedFeatures = parsed;
      setFeatures(parsed);
      setPlanName((sub.plan as any).name || '');
      setPlanSlug((sub.plan as any).slug || '');
      setIsLoaded(true);
    }).catch(() => {
      if (!cancelled) setIsLoaded(true);
    });

    return () => { cancelled = true; };
  }, [session?.accessToken]);

  const hasFeature = useCallback(
    (feature: string) => features.includes(feature),
    [features],
  );

  const planTier = useMemo(() => {
    if (features.includes('complete_reports') || features.includes('api_access')) return 'business';
    if (features.includes('advanced_reports') || features.includes('finance_module')) return 'pro';
    return 'free';
  }, [features]);

  return { features, hasFeature, planTier, planName, planSlug, isLoaded };
}
