'use client';

import { useState, useCallback } from 'react';
import { publicApi, CreateBookingData, Booking, isApiError, getErrorMessage } from '@/lib/api';

export type BookingStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface UseBookingReturn {
  status: BookingStatus;
  booking: Booking | null;
  error: string | null;
  validationErrors: Record<string, string>;
  submit: (data: CreateBookingData) => Promise<boolean>;
  reset: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Hook for creating public bookings with validation
 */
export function useBooking(slug: string): UseBookingReturn {
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateData = useCallback((data: CreateBookingData): boolean => {
    const errors: Record<string, string> = {};

    if (!data.serviceId) {
      errors.serviceId = 'Seleccione un servicio';
    }

    if (!data.date) {
      errors.date = 'Seleccione una fecha';
    }

    if (!data.startTime) {
      errors.startTime = 'Seleccione un horario';
    }

    if (!data.customerName || data.customerName.trim().length < 2) {
      errors.customerName = 'Ingrese su nombre completo';
    }

    if (!data.customerPhone) {
      errors.customerPhone = 'Ingrese su teléfono';
    } else if (!/^[+]?[\d\s-]{8,}$/.test(data.customerPhone)) {
      errors.customerPhone = 'Ingrese un teléfono válido';
    }

    if (data.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
      errors.customerEmail = 'Ingrese un email válido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const submit = useCallback(
    async (data: CreateBookingData): Promise<boolean> => {
      if (!slug) {
        setError('No se pudo identificar el negocio');
        setStatus('error');
        return false;
      }

      // Validate before submitting
      if (!validateData(data)) {
        return false;
      }

      setStatus('submitting');
      setError(null);

      try {
        const result = await publicApi.createBooking(slug, data);
        setBooking(result);
        setStatus('success');
        return true;
      } catch (err) {
        if (isApiError(err)) {
          if (err.isValidationError) {
            setError('Por favor, verifique los datos ingresados');
          } else if (err.statusCode === 409) {
            setError('El horario seleccionado ya no está disponible. Por favor, elija otro.');
          } else {
            setError(err.message);
          }
        } else {
          setError(getErrorMessage(err));
        }
        setStatus('error');
        return false;
      }
    },
    [slug, validateData]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setBooking(null);
    setError(null);
    setValidationErrors({});
  }, []);

  return {
    status,
    booking,
    error,
    validationErrors,
    submit,
    reset,
    isSubmitting: status === 'submitting',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
