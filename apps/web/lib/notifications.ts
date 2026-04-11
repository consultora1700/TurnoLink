import { toast } from '@/hooks/use-toast';

/**
 * Centralized notification utilities for consistent UX across the application.
 * All user-facing messages are in Spanish (es-AR).
 */

// =============================================================================
// Success Notifications
// =============================================================================

export const notifications = {
  // Services
  serviceCreated: () =>
    toast({
      title: 'Servicio creado',
      description: 'El servicio se ha creado correctamente.',
    }),

  serviceUpdated: () =>
    toast({
      title: 'Servicio actualizado',
      description: 'Los cambios se han guardado correctamente.',
    }),

  serviceDeleted: () =>
    toast({
      title: 'Servicio eliminado',
      description: 'El servicio ha sido eliminado.',
    }),

  // Products
  productCreated: () =>
    toast({
      title: 'Producto creado',
      description: 'El producto se ha creado correctamente.',
    }),

  productUpdated: () =>
    toast({
      title: 'Producto actualizado',
      description: 'Los cambios se han guardado correctamente.',
    }),

  productDeleted: () =>
    toast({
      title: 'Producto eliminado',
      description: 'El producto ha sido eliminado.',
    }),

  categoryCreated: () =>
    toast({
      title: 'Categoría creada',
      description: 'La categoría se ha creado correctamente.',
    }),

  categoryDeleted: () =>
    toast({
      title: 'Categoría eliminada',
      description: 'La categoría ha sido eliminada.',
    }),

  stockAdjusted: () =>
    toast({
      title: 'Stock actualizado',
      description: 'El stock se ha ajustado correctamente.',
    }),

  // Customers
  customerCreated: () =>
    toast({
      title: 'Cliente creado',
      description: 'El cliente se ha registrado correctamente.',
    }),

  customerUpdated: () =>
    toast({
      title: 'Cliente actualizado',
      description: 'Los datos del cliente se han actualizado.',
    }),

  customerDeleted: () =>
    toast({
      title: 'Cliente eliminado',
      description: 'El cliente ha sido eliminado.',
    }),

  // Employees
  employeeCreated: () =>
    toast({
      title: 'Empleado creado',
      description: 'El empleado se ha agregado correctamente.',
    }),

  employeeUpdated: () =>
    toast({
      title: 'Empleado actualizado',
      description: 'Los datos del empleado se han actualizado.',
    }),

  employeeDeleted: () =>
    toast({
      title: 'Empleado eliminado',
      description: 'El empleado ha sido eliminado.',
    }),

  // Bookings
  bookingCreated: () =>
    toast({
      title: 'Turno creado',
      description: 'El turno se ha registrado correctamente.',
    }),

  saleCreated: () =>
    toast({
      title: 'Venta registrada',
      description: 'La venta se ha registrado correctamente.',
    }),

  bookingConfirmed: () =>
    toast({
      title: 'Turno confirmado',
      description: 'El turno ha sido confirmado.',
    }),

  bookingCancelled: () =>
    toast({
      title: 'Turno cancelado',
      description: 'El turno ha sido cancelado.',
    }),

  bookingCompleted: () =>
    toast({
      title: 'Turno completado',
      description: 'El turno ha sido marcado como completado.',
    }),

  // Schedule
  scheduleUpdated: () =>
    toast({
      title: 'Horario actualizado',
      description: 'Los horarios se han guardado correctamente.',
    }),

  dateBlocked: () =>
    toast({
      title: 'Fecha bloqueada',
      description: 'La fecha ha sido bloqueada correctamente.',
    }),

  dateUnblocked: () =>
    toast({
      title: 'Bloqueo eliminado',
      description: 'La fecha ya está disponible para turnos.',
    }),

  // Settings
  settingsSaved: () =>
    toast({
      title: 'Configuración guardada',
      description: 'Los cambios se han aplicado correctamente.',
    }),

  logoUpdated: () =>
    toast({
      title: 'Logo actualizado',
      description: 'El logo de tu negocio se ha actualizado.',
    }),

  coverUpdated: () =>
    toast({
      title: 'Portada actualizada',
      description: 'La imagen de portada se ha actualizado.',
    }),

  // Profile
  profileUpdated: () =>
    toast({
      title: 'Perfil actualizado',
      description: 'Tus datos se han actualizado correctamente.',
    }),

  passwordChanged: () =>
    toast({
      title: 'Contraseña cambiada',
      description: 'Tu contraseña se ha actualizado correctamente.',
    }),

  // Authentication
  totpEnabled: () =>
    toast({
      title: 'Autenticación activada',
      description: 'La verificación en dos pasos está ahora activa.',
    }),

  totpDisabled: () =>
    toast({
      title: 'Autenticación desactivada',
      description: 'La verificación en dos pasos ha sido desactivada.',
    }),

  // Generic
  saved: () =>
    toast({
      title: 'Guardado',
      description: 'Los cambios se han guardado correctamente.',
    }),

  copied: () =>
    toast({
      title: 'Copiado',
      description: 'Copiado al portapapeles.',
    }),
};

// =============================================================================
// Error Notifications
// =============================================================================

export const errorNotifications = {
  generic: (message?: string) =>
    toast({
      title: 'Error',
      description: message || 'Ha ocurrido un error. Por favor intenta de nuevo.',
      variant: 'destructive',
    }),

  networkError: () =>
    toast({
      title: 'Error de conexión',
      description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      variant: 'destructive',
    }),

  unauthorized: () =>
    toast({
      title: 'Sesión expirada',
      description: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      variant: 'destructive',
    }),

  forbidden: () =>
    toast({
      title: 'Acceso denegado',
      description: 'No tienes permisos para realizar esta acción.',
      variant: 'destructive',
    }),

  notFound: (resource?: string) =>
    toast({
      title: 'No encontrado',
      description: resource
        ? `No se encontró el ${resource}.`
        : 'El recurso solicitado no existe.',
      variant: 'destructive',
    }),

  validationError: (message?: string) =>
    toast({
      title: 'Datos inválidos',
      description: message || 'Por favor revisa los datos ingresados.',
      variant: 'destructive',
    }),

  conflict: (message?: string) =>
    toast({
      title: 'Conflicto',
      description: message || 'Ya existe un registro con esos datos.',
      variant: 'destructive',
    }),

  saveFailed: () =>
    toast({
      title: 'Error al guardar',
      description: 'No se pudieron guardar los cambios. Por favor intenta de nuevo.',
      variant: 'destructive',
    }),

  deleteFailed: () =>
    toast({
      title: 'Error al eliminar',
      description: 'No se pudo eliminar el registro. Por favor intenta de nuevo.',
      variant: 'destructive',
    }),

  uploadFailed: () =>
    toast({
      title: 'Error al subir archivo',
      description: 'No se pudo subir el archivo. Por favor intenta de nuevo.',
      variant: 'destructive',
    }),

  loadFailed: () =>
    toast({
      title: 'Error al cargar',
      description: 'No se pudieron cargar los datos. Por favor intenta de nuevo.',
      variant: 'destructive',
    }),
};

// =============================================================================
// Helper to handle API errors
// =============================================================================

// Subscription error codes from the backend
const SUBSCRIPTION_ERRORS: Record<string, { title: string; description: string }> = {
  SUBSCRIPTION_PAST_DUE: {
    title: 'Pago pendiente',
    description: 'Tu suscripción tiene un pago pendiente. Regularizá el pago para seguir operando.',
  },
  SUBSCRIPTION_EXPIRED: {
    title: 'Suscripción vencida',
    description: 'Tu suscripción venció. Renová tu plan para seguir usando TurnoLink.',
  },
  TRIAL_EXPIRED: {
    title: 'Período de prueba finalizado',
    description: 'Tu período de prueba terminó. Elegí un plan para seguir usando TurnoLink.',
  },
  NO_SUBSCRIPTION: {
    title: 'Sin suscripción',
    description: 'No tenés una suscripción activa. Elegí un plan para continuar.',
  },
  SUBSCRIPTION_INACTIVE: {
    title: 'Suscripción inactiva',
    description: 'Tu suscripción no está activa. Reactivá tu plan para continuar.',
  },
};

/**
 * Handles any API error and shows an appropriate toast notification.
 * Works with ApiRequestError from the API client and also with
 * raw Response objects, network errors, and generic errors.
 *
 * Usage: } catch (error) { handleApiError(error); }
 */
export function handleApiError(error: unknown, context?: string): void {
  // ApiRequestError — thrown by createApiClient
  if (error && typeof error === 'object' && 'statusCode' in error && 'originalError' in error) {
    const apiError = error as { statusCode: number; originalError?: string; message: string; validationDetails?: string[] };

    // Subscription-specific errors (403 with known codes)
    if (apiError.originalError && SUBSCRIPTION_ERRORS[apiError.originalError]) {
      const sub = SUBSCRIPTION_ERRORS[apiError.originalError];
      toast({ title: sub.title, description: sub.description, variant: 'destructive' });
      return;
    }

    // 401 Unauthorized
    if (apiError.statusCode === 401) {
      errorNotifications.unauthorized();
      return;
    }

    // 403 Forbidden (non-subscription)
    if (apiError.statusCode === 403) {
      toast({
        title: 'Acceso denegado',
        description: apiError.message || 'No tenés permisos para realizar esta acción.',
        variant: 'destructive',
      });
      return;
    }

    // 404 Not Found
    if (apiError.statusCode === 404) {
      toast({
        title: 'No encontrado',
        description: apiError.message || 'El recurso solicitado no existe.',
        variant: 'destructive',
      });
      return;
    }

    // 409 Conflict
    if (apiError.statusCode === 409) {
      toast({
        title: 'Conflicto',
        description: apiError.message || 'Ya existe un registro con esos datos.',
        variant: 'destructive',
      });
      return;
    }

    // 400/422 Validation error
    if (apiError.statusCode === 400 || apiError.statusCode === 422) {
      const details = apiError.validationDetails;
      const description = details && details.length > 0
        ? details.join('. ')
        : apiError.message || 'Por favor revisá los datos ingresados.';
      toast({
        title: 'Datos inválidos',
        description,
        variant: 'destructive',
      });
      return;
    }

    // 5xx Server error
    if (apiError.statusCode >= 500) {
      toast({
        title: 'Error del servidor',
        description: 'Ocurrió un error interno. Por favor intentá de nuevo en unos minutos.',
        variant: 'destructive',
      });
      return;
    }

    // Other API errors — show the actual message
    toast({
      title: context ? `Error: ${context}` : 'Error',
      description: apiError.message || 'Ocurrió un error inesperado.',
      variant: 'destructive',
    });
    return;
  }

  // Network error (fetch failed)
  if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('fetch'))) {
    errorNotifications.networkError();
    return;
  }

  // Generic Error with message
  if (error instanceof Error && error.message) {
    toast({
      title: context ? `Error: ${context}` : 'Error',
      description: error.message,
      variant: 'destructive',
    });
    return;
  }

  // Unknown error
  errorNotifications.generic();
}
