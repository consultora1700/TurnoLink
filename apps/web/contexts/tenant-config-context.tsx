'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import {
  DEFAULT_CLIENT_LABEL_SINGULAR,
  DEFAULT_CLIENT_LABEL_PLURAL,
  DEFAULT_ENABLED_FICHAS,
  type FichaModuleId,
  type RubroTerms,
  getTermsForRubro,
} from '@/lib/tenant-config';

interface TenantConfigState {
  rubro: string;
  storeType: 'catalogo' | 'ecommerce';
  clientLabelSingular: string;
  clientLabelPlural: string;
  enabledFichas: FichaModuleId[];
  hiddenSections: string[];
  isLoaded: boolean;
  reload: () => Promise<void>;
}

const TenantConfigContext = createContext<TenantConfigState | undefined>(undefined);

const CACHE_KEY = 'tenantConfig';

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      rubro: string;
      storeType: 'catalogo' | 'ecommerce';
      clientLabelSingular: string;
      clientLabelPlural: string;
      enabledFichas: FichaModuleId[];
      hiddenSections: string[];
    };
  } catch {
    return null;
  }
}

export function TenantConfigProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const cached = useRef(readCache());
  const [rubro, setRubro] = useState(cached.current?.rubro || '');
  const [storeType, setStoreType] = useState<'catalogo' | 'ecommerce'>(cached.current?.storeType || 'catalogo');
  const [clientLabelSingular, setClientLabelSingular] = useState(cached.current?.clientLabelSingular || DEFAULT_CLIENT_LABEL_SINGULAR);
  const [clientLabelPlural, setClientLabelPlural] = useState(cached.current?.clientLabelPlural || DEFAULT_CLIENT_LABEL_PLURAL);
  const [enabledFichas, setEnabledFichas] = useState<FichaModuleId[]>(cached.current?.enabledFichas || DEFAULT_ENABLED_FICHAS);
  const [hiddenSections, setHiddenSections] = useState<string[]>(cached.current?.hiddenSections || []);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadConfig = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const tenant = await api.getTenant();
      const settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : (tenant.settings || {});

      const r = settings.rubro || '';
      const st = settings.storeType || 'catalogo';
      const s = settings.clientLabelSingular || DEFAULT_CLIENT_LABEL_SINGULAR;
      const p = settings.clientLabelPlural || DEFAULT_CLIENT_LABEL_PLURAL;
      const f = Array.isArray(settings.enabledFichas) && settings.enabledFichas.length > 0
        ? settings.enabledFichas
        : DEFAULT_ENABLED_FICHAS;
      const h = Array.isArray(settings.hiddenSections) ? settings.hiddenSections : [];

      setRubro(r);
      setStoreType(st);
      setClientLabelSingular(s);
      setClientLabelPlural(p);
      setEnabledFichas(f);
      setHiddenSections(h);

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rubro: r, storeType: st, clientLabelSingular: s, clientLabelPlural: p, enabledFichas: f, hiddenSections: h }));
      } catch { /* quota exceeded */ }
    } catch {
      // Use defaults on error
    } finally {
      setIsLoaded(true);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <TenantConfigContext.Provider
      value={{
        rubro,
        storeType,
        clientLabelSingular,
        clientLabelPlural,
        enabledFichas,
        hiddenSections,
        isLoaded,
        reload: loadConfig,
      }}
    >
      {children}
    </TenantConfigContext.Provider>
  );
}

export function useTenantConfig(): TenantConfigState {
  const context = useContext(TenantConfigContext);
  if (!context) {
    // Fallback when no provider (shouldn't happen in dashboard)
    return {
      rubro: '',
      storeType: 'catalogo',
      clientLabelSingular: DEFAULT_CLIENT_LABEL_SINGULAR,
      clientLabelPlural: DEFAULT_CLIENT_LABEL_PLURAL,
      enabledFichas: DEFAULT_ENABLED_FICHAS,
      hiddenSections: [],
      isLoaded: false,
      reload: async () => {},
    };
  }
  return context;
}

/** Hook that returns the full terminology for the current tenant's rubro */
export function useRubroTerms(): RubroTerms {
  const { rubro } = useTenantConfig();
  return getTermsForRubro(rubro);
}
