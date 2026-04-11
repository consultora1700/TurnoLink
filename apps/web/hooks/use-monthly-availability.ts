'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { publicApi, MonthlyAvailabilityMap } from '@/lib/api';

export function useMonthlyAvailability(slug: string) {
  const [availabilityMap, setAvailabilityMap] = useState<MonthlyAvailabilityMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fetchedRef = useRef<Set<string>>(new Set());

  const fetchMonth = useCallback(
    async (year: number, month: number, serviceId?: string, branchId?: string) => {
      if (!slug) return;
      const key = `${year}-${month}-${serviceId || ''}-${branchId || ''}`;
      if (fetchedRef.current.has(key)) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      fetchedRef.current.add(key);

      try {
        const data = await publicApi.getMonthlyAvailability(slug, year, month, serviceId, branchId);
        setAvailabilityMap(prev => ({ ...prev, ...data }));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        // Degrade silently — calendar shows normal (no indicators)
        fetchedRef.current.delete(key);
      } finally {
        setIsLoading(false);
      }
    },
    [slug],
  );

  const reset = useCallback(() => {
    setAvailabilityMap({});
    fetchedRef.current = new Set();
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { availabilityMap, isLoading, fetchMonth, reset };
}
