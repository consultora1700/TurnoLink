'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  status: AsyncStatus;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
}

export interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
  initialData?: T | null;
}

export interface UseAsyncReturn<T, Args extends unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Custom hook for handling async operations with loading, error, and success states
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const { onSuccess, onError, immediate = false, initialData = null } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: null,
    status: initialData ? 'success' : 'idle',
    isLoading: false,
    isError: false,
    isSuccess: !!initialData,
    isIdle: !initialData,
  });

  const mountedRef = useRef(true);
  const lastCallIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      const callId = ++lastCallIdRef.current;

      setState({
        data: state.data,
        error: null,
        status: 'loading',
        isLoading: true,
        isError: false,
        isSuccess: false,
        isIdle: false,
      });

      try {
        const data = await asyncFunction(...args);

        // Only update state if this is the most recent call and component is mounted
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({
            data,
            error: null,
            status: 'success',
            isLoading: false,
            isError: false,
            isSuccess: true,
            isIdle: false,
          });
          onSuccess?.(data);
        }

        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({
            data: null,
            error: err,
            status: 'error',
            isLoading: false,
            isError: true,
            isSuccess: false,
            isIdle: false,
          });
          onError?.(err);
        }

        throw err;
      }
    },
    [asyncFunction, onSuccess, onError, state.data]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: null,
      status: initialData ? 'success' : 'idle',
      isLoading: false,
      isError: false,
      isSuccess: !!initialData,
      isIdle: !initialData,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
      status: data ? 'success' : 'idle',
      isSuccess: !!data,
      isIdle: !data,
    }));
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook for cached async data with automatic refresh
 */
export function useCachedAsync<T, Args extends unknown[] = []>(
  key: string,
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> & {
    cacheTime?: number;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  } = {}
): UseAsyncReturn<T, Args> & { refetch: () => Promise<T> } {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    refetchOnMount = true,
    refetchOnWindowFocus = true,
    ...asyncOptions
  } = options;

  // Simple in-memory cache
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const getCachedData = useCallback((): T | null => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > cacheTime) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [key, cacheTime]);

  const isStale = useCallback((): boolean => {
    const cached = cacheRef.current.get(key);
    if (!cached) return true;

    const age = Date.now() - cached.timestamp;
    return age > staleTime;
  }, [key, staleTime]);

  const wrappedFunction = useCallback(
    async (...args: Args): Promise<T> => {
      const data = await asyncFunction(...args);
      cacheRef.current.set(key, { data, timestamp: Date.now() });
      return data;
    },
    [asyncFunction, key]
  );

  const cachedData = getCachedData();
  const asyncState = useAsync(wrappedFunction, {
    ...asyncOptions,
    initialData: cachedData,
  });

  // Refetch on mount if stale
  useEffect(() => {
    if (refetchOnMount && isStale()) {
      asyncState.execute(...([] as unknown as Args));
    }
  }, []);

  // Refetch on window focus if stale
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale()) {
        asyncState.execute(...([] as unknown as Args));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, isStale, asyncState.execute]);

  const refetch = useCallback(
    () => asyncState.execute(...([] as unknown as Args)),
    [asyncState.execute]
  );

  return {
    ...asyncState,
    refetch,
  };
}
