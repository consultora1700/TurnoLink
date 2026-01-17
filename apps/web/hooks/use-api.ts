'use client';

import { useSession } from 'next-auth/react';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { createApiClient, ApiClient, isApiError, getErrorMessage } from '@/lib/api';

export interface UseApiReturn {
  api: ApiClient | null;
  isReady: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

/**
 * Hook for accessing the authenticated API client
 */
export function useApi(): UseApiReturn {
  const { data: session, status } = useSession();

  const token = (session as { accessToken?: string })?.accessToken || null;

  const api = useMemo(() => {
    if (!token) return null;
    return createApiClient(token);
  }, [token]);

  return {
    api,
    isReady: status !== 'loading' && !!api,
    isAuthenticated: !!token,
    token,
  };
}

/**
 * Hook for making authenticated API calls with loading and error states
 */
export function useApiCall<T>(
  apiCall: (api: ApiClient) => Promise<T>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { api, isReady } = useApi();
  const { immediate = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    if (!api) {
      setError('No autenticado');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall(api);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [api, apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate && isReady) {
      execute();
    }
  }, [immediate, isReady]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    execute,
    reset,
    isReady,
  };
}

/**
 * Hook for dashboard data with automatic refresh
 */
export function useDashboard() {
  const { api, isReady } = useApi();
  const [stats, setStats] = useState<Awaited<ReturnType<ApiClient['getStats']>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!api) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (isReady) {
      fetchStats();
    }
  }, [isReady, fetchStats]);

  return {
    stats,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchStats,
  };
}

/**
 * Hook for services management
 */
export function useServices() {
  const { api, isReady } = useApi();
  const [services, setServices] = useState<Awaited<ReturnType<ApiClient['getServices']>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!api) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (isReady) {
      fetchServices();
    }
  }, [isReady, fetchServices]);

  const createService = useCallback(
    async (data: Parameters<ApiClient['createService']>[0]) => {
      if (!api) throw new Error('No autenticado');
      const service = await api.createService(data);
      await fetchServices();
      return service;
    },
    [api, fetchServices]
  );

  const updateService = useCallback(
    async (id: string, data: Parameters<ApiClient['updateService']>[1]) => {
      if (!api) throw new Error('No autenticado');
      const service = await api.updateService(id, data);
      await fetchServices();
      return service;
    },
    [api, fetchServices]
  );

  const deleteService = useCallback(
    async (id: string) => {
      if (!api) throw new Error('No autenticado');
      await api.deleteService(id);
      await fetchServices();
    },
    [api, fetchServices]
  );

  return {
    services,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchServices,
    createService,
    updateService,
    deleteService,
  };
}

/**
 * Hook for bookings management
 */
export function useBookings(params?: Parameters<ApiClient['getBookings']>[0]) {
  const { api, isReady } = useApi();
  const [bookings, setBookings] = useState<Awaited<ReturnType<ApiClient['getBookings']>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!api) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getBookings(params);
      setBookings(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [api, params]);

  useEffect(() => {
    if (isReady) {
      fetchBookings();
    }
  }, [isReady, fetchBookings]);

  const updateStatus = useCallback(
    async (id: string, status: Parameters<ApiClient['updateBookingStatus']>[1]) => {
      if (!api) throw new Error('No autenticado');
      await api.updateBookingStatus(id, status);
      await fetchBookings();
    },
    [api, fetchBookings]
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      if (!api) throw new Error('No autenticado');
      await api.cancelBooking(id);
      await fetchBookings();
    },
    [api, fetchBookings]
  );

  return {
    bookings,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchBookings,
    updateStatus,
    cancelBooking,
  };
}

/**
 * Hook for customers management
 */
export function useCustomers(params?: Parameters<ApiClient['getCustomers']>[0]) {
  const { api, isReady } = useApi();
  const [customers, setCustomers] = useState<Awaited<ReturnType<ApiClient['getCustomers']>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!api) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getCustomers(params);
      setCustomers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [api, params]);

  useEffect(() => {
    if (isReady) {
      fetchCustomers();
    }
  }, [isReady, fetchCustomers]);

  return {
    customers,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchCustomers,
  };
}

/**
 * Hook for schedules management
 */
export function useSchedules() {
  const { api, isReady } = useApi();
  const [schedules, setSchedules] = useState<Awaited<ReturnType<ApiClient['getSchedules']>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!api) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getSchedules();
      setSchedules(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (isReady) {
      fetchSchedules();
    }
  }, [isReady, fetchSchedules]);

  const updateSchedules = useCallback(
    async (schedules: Parameters<ApiClient['updateSchedules']>[0]) => {
      if (!api) throw new Error('No autenticado');
      const updated = await api.updateSchedules(schedules);
      setSchedules(updated);
      return updated;
    },
    [api]
  );

  return {
    schedules,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchSchedules,
    updateSchedules,
  };
}
