'use client';

import { useMemo } from 'react';
import { isToday } from 'date-fns';
import { Plus, CalendarX, User } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { BookingCard, statusConfig } from './booking-card';
import type { Booking } from '@/lib/api';

interface AgendaTimelineProps {
  bookings: Booking[];
  date: Date;
  onBookingClick: (booking: Booking) => void;
  onSlotClick: (time: string) => void;
  scheduleStart?: number; // hour e.g. 8
  scheduleEnd?: number;   // hour e.g. 21
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function formatDurationShort(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutes}min`;
}

type Segment =
  | { type: 'free'; startMin: number; endMin: number }
  | { type: 'booking'; booking: Booking; startMin: number; endMin: number };

type RenderItem = Segment | { type: 'now' };

export function AgendaTimeline({
  bookings,
  date,
  onBookingClick,
  onSlotClick,
  scheduleStart = 8,
  scheduleEnd = 21,
}: AgendaTimelineProps) {
  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings]
  );

  const dayIsToday = isToday(date);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Schedule boundaries in minutes
  const schedStartMin = scheduleStart * 60;
  const schedEndMin = scheduleEnd >= 23 ? 1439 : scheduleEnd * 60;
  const schedDisplayEnd = scheduleEnd >= 23 ? '23:59' : formatHour(scheduleEnd);

  // Build segments for desktop view: alternating free slots and bookings
  const segments = useMemo((): Segment[] => {
    const result: Segment[] = [];
    let cursor = schedStartMin;

    for (const booking of sortedBookings) {
      const bStart = parseTime(booking.startTime);
      const bEnd = parseTime(booking.endTime);

      // Skip bookings entirely outside schedule range
      if (bEnd <= schedStartMin || bStart >= schedEndMin) continue;

      // Free gap before this booking
      if (bStart > cursor) {
        result.push({ type: 'free', startMin: cursor, endMin: bStart });
      }

      result.push({ type: 'booking', booking, startMin: bStart, endMin: bEnd });
      cursor = Math.max(cursor, bEnd);
    }

    // Free gap after last booking
    if (cursor < schedEndMin) {
      result.push({ type: 'free', startMin: cursor, endMin: schedEndMin });
    }

    return result;
  }, [sortedBookings, schedStartMin, schedEndMin]);

  // Build render list with "now" indicator inserted at the right position
  const renderItems = useMemo((): RenderItem[] => {
    if (!dayIsToday) return segments;

    const items: RenderItem[] = [];
    let nowInserted = false;

    for (const seg of segments) {
      // Insert "now" before this segment if now is before its start
      if (!nowInserted && seg.startMin > nowMinutes) {
        items.push({ type: 'now' });
        nowInserted = true;
      }

      items.push(seg);

      // Insert "now" after this segment if now is within it
      if (!nowInserted && seg.startMin <= nowMinutes && seg.endMin > nowMinutes) {
        items.push({ type: 'now' });
        nowInserted = true;
      }
    }

    // Append at end if all segments are in the past
    if (!nowInserted && nowMinutes >= schedStartMin && nowMinutes <= schedEndMin) {
      items.push({ type: 'now' });
    }

    return items;
  }, [segments, dayIsToday, nowMinutes, schedStartMin, schedEndMin]);

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
          <CalendarX className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-medium text-muted-foreground mb-1">Sin turnos para este día</p>
        <p className="text-sm text-muted-foreground/70">Hacé click en &quot;Nuevo Turno&quot; para crear uno</p>
      </div>
    );
  }

  return (
    <>
      {/* ====== MOBILE: Simple card list (unchanged) ====== */}
      <div className="md:hidden space-y-2">
        {dayIsToday && (() => {
          const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const pastBookings = sortedBookings.filter((b) => b.endTime <= nowStr);
          const futureBookings = sortedBookings.filter((b) => b.endTime > nowStr);

          return (
            <>
              {pastBookings.map((b) => (
                <div key={b.id} className="opacity-60">
                  <BookingCard booking={b} onClick={() => onBookingClick(b)} />
                </div>
              ))}
              {pastBookings.length > 0 && futureBookings.length > 0 && (
                <div className="flex items-center gap-2 py-1">
                  <div className="h-px flex-1 bg-red-400" />
                  <span className="text-xs font-medium text-red-500 shrink-0">
                    Ahora · {nowStr}
                  </span>
                  <div className="h-px flex-1 bg-red-400" />
                </div>
              )}
              {futureBookings.map((b) => (
                <BookingCard key={b.id} booking={b} onClick={() => onBookingClick(b)} />
              ))}
            </>
          );
        })()}
        {!dayIsToday && sortedBookings.map((b) => (
          <BookingCard key={b.id} booking={b} onClick={() => onBookingClick(b)} />
        ))}
      </div>

      {/* ====== DESKTOP: Compact agenda list ====== */}
      <div className="hidden md:block">
        {/* Schedule info header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-muted-foreground">
            Horario del día: {formatHour(scheduleStart)} – {schedDisplayEnd}
          </p>
          <p className="text-xs text-muted-foreground">
            {sortedBookings.length} {sortedBookings.length === 1 ? 'turno' : 'turnos'}
          </p>
        </div>

        {/* Agenda rows */}
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden divide-y divide-slate-100 dark:divide-neutral-800">
          {renderItems.map((item) => {
            // "Now" indicator row
            if (item.type === 'now') {
              return (
                <div
                  key="now-indicator"
                  className="flex items-center gap-3 px-4 py-1.5 bg-red-50/50 dark:bg-red-950/20"
                >
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <div className="h-px flex-1 bg-red-300 dark:bg-red-800" />
                  <span className="text-[11px] font-medium text-red-500 dark:text-red-400 shrink-0">
                    Ahora · {formatMinutes(nowMinutes)}
                  </span>
                  <div className="h-px flex-1 bg-red-300 dark:bg-red-800" />
                </div>
              );
            }

            // Free slot row
            if (item.type === 'free') {
              const isPast = dayIsToday && item.endMin <= nowMinutes;
              const durationMin = item.endMin - item.startMin;

              return (
                <button
                  key={`free-${item.startMin}`}
                  onClick={() => onSlotClick(formatMinutes(item.startMin))}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-2.5 text-left transition-colors group',
                    'hover:bg-teal-50/50 dark:hover:bg-teal-950/20',
                    isPast && 'opacity-40',
                  )}
                >
                  <div className="w-1 self-stretch rounded-full bg-slate-200 dark:bg-neutral-700 shrink-0" />
                  <span className="w-[7.5rem] text-xs text-muted-foreground/70 shrink-0 tabular-nums">
                    {formatMinutes(item.startMin)} – {formatMinutes(item.endMin)}
                  </span>
                  <span className="flex-1 text-xs text-muted-foreground/50 truncate">
                    Disponible · {formatDurationShort(durationMin)}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 shrink-0">
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo turno
                  </span>
                </button>
              );
            }

            // Booking row
            const { booking } = item;
            const config = statusConfig[booking.status] || statusConfig.PENDING;
            const isPast = dayIsToday && item.endMin <= nowMinutes;

            return (
              <button
                key={booking.id}
                onClick={() => onBookingClick(booking)}
                className={cn(
                  'w-full flex items-center gap-4 px-4 py-3 text-left transition-colors',
                  'hover:bg-slate-50 dark:hover:bg-neutral-800/50',
                  isPast && 'opacity-50',
                )}
              >
                <div className={cn('w-1 self-stretch rounded-full shrink-0', config.dot)} />
                <span className="w-[7.5rem] text-sm font-semibold shrink-0 tabular-nums">
                  {booking.startTime} – {booking.endTime}
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate max-w-[12rem]">
                      {booking.customer.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate hidden lg:inline">
                    {booking.service.name} · {formatDuration(booking.service.duration)}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0',
                    config.bg,
                    config.text,
                  )}
                >
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
