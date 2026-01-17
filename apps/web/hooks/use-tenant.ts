'use client';

import { useState, useEffect, useCallback } from 'react';
import { publicApi, TenantPublic, isApiError, getErrorMessage } from '@/lib/api';

export interface UseTenantReturn {
  tenant: TenantPublic | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching public tenant data by slug
 */
export function useTenant(slug: string): UseTenantReturn {
  const [tenant, setTenant] = useState<TenantPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      setError('No slug provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await publicApi.getTenant(slug);
      setTenant(data);
    } catch (err) {
      if (isApiError(err)) {
        if (err.isNotFound) {
          setError('Negocio no encontrado');
        } else {
          setError(err.message);
        }
      } else {
        setError(getErrorMessage(err));
      }
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  return {
    tenant,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchTenant,
  };
}
