'use client';

import { Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';
import type { Booking } from '@/lib/api';

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  PENDING: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-l-amber-500',
    dot: 'bg-amber-500',
    label: 'Pendiente',
  },
  CONFIRMED: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-l-blue-500',
    dot: 'bg-blue-500',
    label: 'Confirmado',
  },
  COMPLETED: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-l-emerald-500',
    dot: 'bg-emerald-500',
    label: 'Completado',
  },
  CANCELLED: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-l-red-500',
    dot: 'bg-red-500',
    label: 'Cancelado',
  },
  NO_SHOW: {
    bg: 'bg-slate-50 dark:bg-neutral-800',
    text: 'text-slate-700 dark:text-neutral-300',
    border: 'border-l-slate-500',
    dot: 'bg-slate-500',
    label: 'No asistió',
  },
};

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
  compact?: boolean;
}

export function BookingCard({ booking, onClick, compact }: BookingCardProps) {
  const config = statusConfig[booking.status] || statusConfig.PENDING;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`
          ${config.bg} border-l-[3px] ${config.border}
          rounded-lg px-3 py-1.5 cursor-pointer transition-all hover:shadow-md h-full
          flex items-center gap-2
        `}
      >
        <span className="text-sm font-bold shrink-0">{booking.startTime}</span>
        <span className="text-xs truncate">{booking.customer.name}</span>
        <span className="text-[10px] text-muted-foreground truncate hidden lg:inline">
          {booking.service.name}
        </span>
        <Badge className={`${config.bg} ${config.text} border-0 text-[10px] shrink-0 ml-auto`}>
          {config.label}
        </Badge>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        ${config.bg} border-l-[3px] ${config.border}
        rounded-lg p-3 cursor-pointer transition-all hover:shadow-md h-full
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-center shrink-0 w-14">
          <p className="text-base font-bold">{booking.startTime}</p>
          <p className="text-[10px] text-muted-foreground">{booking.endTime}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="font-semibold text-sm truncate">{booking.customer.name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              {booking.service.name} · {formatDuration(booking.service.duration)}
            </p>
          </div>
        </div>
        <Badge className={`${config.bg} ${config.text} border-0 text-[10px] shrink-0`}>
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

export { statusConfig };
