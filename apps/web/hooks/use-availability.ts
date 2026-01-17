'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { publicApi, TimeSlot, isApiError, getErrorMessage } from '@/lib/api';

export interface UseAvailabilityReturn {
  slots: TimeSlot[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  fetchAvailability: (date: string, serviceId?: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for fetching availability slots for a specific date
 */
export function useAvailability(slug: string): UseAvailabilityReturn {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<string>('');

  const fetchAvailability = useCallback(
    async (date: string, serviceId?: string) => {
      if (!slug || !date) {
        return;
      }

      // Create cache key to avoid duplicate fetches
      const cacheKey = `${date}-${serviceId || 'all'}`;
      if (lastFetchRef.current === cacheKey && slots.length > 0) {
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      lastFetchRef.current = cacheKey;

      try {
        const data = await publicApi.getAvailability(slug, date, serviceId);
        setSlots(data);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        if (isApiError(err)) {
          if (err.isNotFound) {
            setError('No se encontró disponibilidad');
          } else {
            setError(err.message);
          }
        } else {
          setError(getErrorMessage(err));
        }
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    },
    [slug, slots.length]
  );

  const reset = useCallback(() => {
    setSlots([]);
    setError(null);
    lastFetchRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    slots,
    isLoading,
    isError: !!error,
    error,
    fetchAvailability,
    reset,
  };
}
