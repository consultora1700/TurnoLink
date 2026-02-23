import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'ARS'): string {
  // Validar que el precio sea un número válido y razonable
  const safePrice = typeof price === 'number' && isFinite(price) && price >= 0 && price < 1e12
    ? price
    : 0;

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safePrice);
}

/**
 * Safely parse a booking/event date to avoid timezone shift.
 * Extracts the YYYY-MM-DD portion and creates noon local time,
 * ensuring the displayed day is always correct regardless of browser timezone.
 */
export function parseBookingDate(date: string | Date): Date {
  const str = typeof date === 'string' ? date : date.toISOString();
  return new Date(str.split('T')[0] + 'T12:00:00');
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseBookingDate(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parseBookingDate(date));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  const h = hours === 1 ? 'h' : 'hs';
  if (remaining === 0) return `${hours} ${h}`;
  return `${hours} ${h} ${remaining} min`;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

export function getDayName(dayOfWeek: number): string {
  const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  return days[dayOfWeek];
}

export function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'CONFIRMED':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'destructive';
    case 'COMPLETED':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'No asistió',
  };
  return labels[status] || status;
}
