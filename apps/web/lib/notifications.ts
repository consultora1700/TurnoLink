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

export function handleApiError(error: unknown): void {
  if (error instanceof Response) {
    switch (error.status) {
      case 401:
        errorNotifications.unauthorized();
        break;
      case 403:
        errorNotifications.forbidden();
        break;
      case 404:
        errorNotifications.notFound();
        break;
      case 409:
        errorNotifications.conflict();
        break;
      case 422:
        errorNotifications.validationError();
        break;
      default:
        errorNotifications.generic();
    }
  } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
    errorNotifications.networkError();
  } else if (error instanceof Error) {
    errorNotifications.generic(error.message);
  } else {
    errorNotifications.generic();
  }
}
