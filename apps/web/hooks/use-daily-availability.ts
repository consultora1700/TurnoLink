'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { publicApi, isApiError, getErrorMessage } from '@/lib/api';

export interface DailyAvailabilityDay {
  date: string;
  available: boolean;
}

export interface UseDailyAvailabilityReturn {
  days: DailyAvailabilityDay[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  fetchAvailability: (startDate: string, endDate: string, branchId?: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for fetching daily availability (date ranges) for daily booking mode
 */
export function useDailyAvailability(slug: string): UseDailyAvailabilityReturn {
  const [days, setDays] = useState<DailyAvailabilityDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchedRangesRef = useRef<Set<string>>(new Set());

  const fetchAvailability = useCallback(
    async (startDate: string, endDate: string, branchId?: string) => {
      if (!slug || !startDate || !endDate) {
        return;
      }

      const cacheKey = `${startDate}-${endDate}-${branchId || 'all'}`;
      if (fetchedRangesRef.current.has(cacheKey)) {
        return; // Already fetched this range
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      fetchedRangesRef.current.add(cacheKey);

      try {
        const data = await publicApi.getDailyAvailability(slug, startDate, endDate, branchId);
        // Merge new data with existing — don't replace, so cross-month ranges keep all availability info
        setDays(prev => {
          const map = new Map(prev.map(d => [d.date, d]));
          for (const d of data) {
            map.set(d.date, d);
          }
          return Array.from(map.values());
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        if (isApiError(err)) {
          setError(err.message);
        } else {
          setError(getErrorMessage(err));
        }
        setDays([]);
      } finally {
        setIsLoading(false);
      }
    },
    [slug]
  );

  const reset = useCallback(() => {
    setDays([]);
    setError(null);
    fetchedRangesRef.current = new Set();
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    days,
    isLoading,
    isError: !!error,
    error,
    fetchAvailability,
    reset,
  };
}
