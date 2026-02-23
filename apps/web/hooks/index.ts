// Async utilities
export { useAsync, useCachedAsync } from './use-async';
export type { AsyncState, AsyncStatus, UseAsyncOptions, UseAsyncReturn } from './use-async';

// Public hooks (no auth required)
export { useTenant } from './use-tenant';
export type { UseTenantReturn } from './use-tenant';

export { useAvailability } from './use-availability';
export type { UseAvailabilityReturn } from './use-availability';

export { useDailyAvailability } from './use-daily-availability';
export type { UseDailyAvailabilityReturn, DailyAvailabilityDay } from './use-daily-availability';

export { useBooking } from './use-booking';
export type { UseBookingReturn, BookingStatus } from './use-booking';

// Authenticated API hooks
export {
  useApi,
  useApiCall,
  useDashboard,
  useServices,
  useBookings,
  useCustomers,
  useSchedules,
} from './use-api';
export type { UseApiReturn } from './use-api';

// Toast notifications
export { useToast, toast, toastSuccess, toastError } from './use-toast';
