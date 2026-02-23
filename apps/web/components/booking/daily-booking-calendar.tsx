'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Moon, LogIn, LogOut, ArrowRight, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DailyAvailabilityDay {
  date: string;
  available: boolean;
}

interface Props {
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onSelectRange: (checkIn: Date | null, checkOut: Date | null) => void;
  onConfirm?: () => void;
  availability: DailyAvailabilityDay[];
  loadingAvailability: boolean;
  onMonthChange: (startDate: string, endDate: string) => void;
  maxAdvanceDays?: number;
  minNights?: number;
  maxNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
}

export function DailyBookingCalendar({
  checkInDate,
  checkOutDate,
  onSelectRange,
  onConfirm,
  availability,
  loadingAvailability,
  onMonthChange,
  maxAdvanceDays = 90,
  minNights = 1,
  maxNights = 30,
  checkInTime = '14:00',
  checkOutTime = '10:00',
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = startOfDay(new Date());
  const maxDate = startOfDay(addDays(today, maxAdvanceDays));

  // Fetch availability when month changes
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startStr = format(
      isBefore(monthStart, today) ? today : monthStart,
      'yyyy-MM-dd'
    );
    const endStr = format(
      isAfter(monthEnd, maxDate) ? maxDate : monthEnd,
      'yyyy-MM-dd'
    );
    onMonthChange(startStr, endStr);
  }, [currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const canGoNext =
    isBefore(startOfMonth(addMonths(currentMonth, 1)), maxDate) ||
    isSameMonth(addMonths(currentMonth, 1), maxDate);

  // Build availability map for fast lookup
  const availMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const d of availability) {
      map.set(d.date, d.available);
    }
    return map;
  }, [availability]);

  const isDayAvailable = useCallback(
    (day: Date): boolean => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return availMap.get(dateStr) !== false;
    },
    [availMap]
  );

  const isDayDisabled = useCallback(
    (day: Date): boolean => {
      if (isBefore(day, today)) return true;
      if (isAfter(day, maxDate)) return true;
      if (availability.length === 0 && loadingAvailability) return false;
      return !isDayAvailable(day);
    },
    [today, maxDate, availability, loadingAvailability, isDayAvailable]
  );

  // ─── Smart boundary: max checkout date after check-in ───
  // Find the first unavailable date after checkIn.
  // The user can check out ON that date (leaves morning, next guest arrives afternoon)
  // but cannot select any date beyond it.
  const maxCheckoutDate = useMemo(() => {
    if (!checkInDate || checkOutDate) return null;

    // Walk day by day from checkIn+1 looking for the first unavailable night
    let cursor = addDays(checkInDate, 1);
    while (!isAfter(cursor, maxDate)) {
      const dateStr = format(cursor, 'yyyy-MM-dd');
      const avail = availMap.get(dateStr);
      // If this date is explicitly unavailable, this is the boundary
      // The user CAN check out on this date (checkout morning), so maxCheckout = cursor
      if (avail === false) {
        return cursor;
      }
      cursor = addDays(cursor, 1);
    }
    // No blocked dates found — limit by maxNights or maxDate
    const maxByNights = addDays(checkInDate, maxNights);
    return isBefore(maxByNights, maxDate) ? maxByNights : maxDate;
  }, [checkInDate, checkOutDate, availMap, maxDate, maxNights]);

  // Is this day beyond the max checkout boundary? (only during checkout selection)
  const isBeyondBoundary = useCallback(
    (day: Date): boolean => {
      if (!checkInDate || checkOutDate) return false; // Only applies during checkout selection
      if (!maxCheckoutDate) return false;
      return isAfter(day, maxCheckoutDate);
    },
    [checkInDate, checkOutDate, maxCheckoutDate]
  );

  // Is this day the checkout boundary? (blocked day that's still valid as checkout — guest leaves morning)
  const isCheckoutBoundaryDay = useCallback(
    (day: Date): boolean => {
      if (!checkInDate || checkOutDate) return false;
      if (!maxCheckoutDate) return false;
      // Only mark as boundary if it actually satisfies minNights
      if (differenceInCalendarDays(maxCheckoutDate, checkInDate) < minNights) return false;
      return isSameDay(day, maxCheckoutDate) && isAfter(day, checkInDate);
    },
    [checkInDate, checkOutDate, maxCheckoutDate, minNights]
  );

  const isInRange = useCallback(
    (day: Date): boolean => {
      if (!checkInDate) return false;
      const endDate = checkOutDate || hoverDate;
      if (!endDate) return false;
      return isAfter(day, checkInDate) && isBefore(day, endDate);
    },
    [checkInDate, checkOutDate, hoverDate]
  );

  const isCheckIn = useCallback(
    (day: Date): boolean => {
      return checkInDate !== null && isSameDay(day, checkInDate);
    },
    [checkInDate]
  );

  const isCheckOut = useCallback(
    (day: Date): boolean => {
      if (checkOutDate) return isSameDay(day, checkOutDate);
      if (checkInDate && hoverDate) return isSameDay(day, hoverDate);
      return false;
    },
    [checkOutDate, checkInDate, hoverDate]
  );

  const handleDayClick = useCallback(
    (day: Date) => {
      if (!checkInDate || checkOutDate) {
        // Selecting check-in: day must be available
        if (isDayDisabled(day)) return;
        onSelectRange(day, null);
        setHoverDate(null);
      } else {
        // Selecting check-out
        if (isSameDay(day, checkInDate)) {
          // Click on check-in → deselect/reset
          onSelectRange(null, null);
          setHoverDate(null);
          return;
        }
        if (isBefore(day, checkInDate)) {
          // Clicked before check-in: set as new check-in
          if (isDayDisabled(day)) return;
          onSelectRange(day, null);
          setHoverDate(null);
        } else {
          // Validate nights
          const nights = differenceInCalendarDays(day, checkInDate);
          if (nights < minNights) return;
          if (nights > maxNights) return;
          // Block if beyond the boundary (occupied date in the middle)
          if (maxCheckoutDate && isAfter(day, maxCheckoutDate)) return;
          onSelectRange(checkInDate, day);
          setHoverDate(null);
        }
      }
    },
    [checkInDate, checkOutDate, isDayDisabled, minNights, maxNights, maxCheckoutDate, onSelectRange]
  );

  const handleDayHover = useCallback(
    (day: Date) => {
      if (!checkInDate || checkOutDate) return;
      if (!isAfter(day, checkInDate)) return;
      // Don't hover past the boundary
      if (maxCheckoutDate && isAfter(day, maxCheckoutDate)) {
        setHoverDate(maxCheckoutDate);
        return;
      }
      const isBoundary = maxCheckoutDate && isSameDay(day, maxCheckoutDate);
      if (!isDayDisabled(day) || isBoundary) {
        setHoverDate(day);
      }
    },
    [checkInDate, checkOutDate, isDayDisabled, maxCheckoutDate]
  );

  const nights = checkInDate && checkOutDate
    ? differenceInCalendarDays(checkOutDate, checkInDate)
    : checkInDate && hoverDate && isAfter(hoverDate, checkInDate)
    ? differenceInCalendarDays(hoverDate, checkInDate)
    : 0;

  // Can the user select any valid checkout date?
  const hasValidCheckout = useMemo(() => {
    if (!checkInDate || checkOutDate) return true;
    if (!maxCheckoutDate) return true;
    return differenceInCalendarDays(maxCheckoutDate, checkInDate) >= minNights;
  }, [checkInDate, checkOutDate, maxCheckoutDate, minNights]);

  // Is checkout limited by a blocked date (not just maxNights)?
  const isBlockedLimit = useMemo(() => {
    if (!checkInDate || checkOutDate || !maxCheckoutDate) return false;
    const maxByNights = addDays(checkInDate, maxNights);
    return isBefore(maxCheckoutDate, maxByNights);
  }, [checkInDate, checkOutDate, maxCheckoutDate, maxNights]);

  // Selection phase
  const selectionPhase: 'check-in' | 'check-out' | 'complete' =
    !checkInDate ? 'check-in' :
    !checkOutDate ? 'check-out' :
    'complete';

  const handleReset = useCallback(() => {
    onSelectRange(null, null);
    setHoverDate(null);
  }, [onSelectRange]);

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
          selectionPhase === 'check-in'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700'
            : 'text-slate-500 dark:text-neutral-400'
        )}>
          <LogIn className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">1.</span> Entrada
          {checkInDate && selectionPhase !== 'check-in' && (
            <span className="ml-1 text-emerald-600 dark:text-emerald-400">
              {format(checkInDate, "d MMM", { locale: es })}
            </span>
          )}
        </div>
        <ArrowRight className="h-3 w-3 text-slate-400 dark:text-neutral-500 shrink-0" />
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
          selectionPhase === 'check-out'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
            : selectionPhase === 'complete'
            ? 'text-slate-500 dark:text-neutral-400'
            : 'text-slate-400 dark:text-neutral-500'
        )}>
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">2.</span> Salida
          {checkOutDate && (
            <span className="ml-1 text-blue-600 dark:text-blue-400">
              {format(checkOutDate, "d MMM", { locale: es })}
            </span>
          )}
        </div>
        {(checkInDate || checkOutDate) && (
          <button
            onClick={handleReset}
            className="ml-auto p-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
            title="Reiniciar selección"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl p-3 sm:p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={isSameMonth(currentMonth, today)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-sm capitalize text-slate-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-semibold text-slate-500 dark:text-neutral-400 py-1.5 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loadingAvailability && (
          <div className="text-center py-2 text-xs text-slate-500 dark:text-neutral-400 animate-pulse">
            Cargando disponibilidad...
          </div>
        )}

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0">
          {Array.from({ length: emptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-11" />
          ))}

          {days.map((day) => {
            const disabled = isDayDisabled(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const inRange = isInRange(day);
            const isStart = isCheckIn(day);
            const isEnd = isCheckOut(day);
            const isPast = isBefore(day, today);
            const isUnavailable = !isPast && !isAfter(day, maxDate) && !isDayAvailable(day);
            const beyondBoundary = isBeyondBoundary(day);
            const checkoutBoundary = isCheckoutBoundaryDay(day);
            // During checkout selection: boundary day stays clickable (valid checkout morning)
            const effectivelyDisabled = checkoutBoundary ? false : (disabled || beyondBoundary);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => handleDayHover(day)}
                disabled={effectivelyDisabled && !isStart}
                className={cn(
                  'h-10 sm:h-11 text-sm font-medium transition-all relative flex items-center justify-center',
                  // Default text
                  'text-slate-800 dark:text-neutral-200',
                  // Out of month
                  !isCurrentMonth && 'text-slate-300 dark:text-neutral-600',
                  // Past days
                  isPast && 'text-slate-300 dark:text-neutral-600 cursor-not-allowed',
                  // Unavailable (occupied) — clearly marked (but not if it's the checkout boundary)
                  isUnavailable && !checkoutBoundary && 'text-slate-300 dark:text-neutral-600 cursor-not-allowed line-through decoration-slate-400 dark:decoration-neutral-500',
                  // Checkout boundary: blocked day but valid for checkout (guest leaves morning)
                  checkoutBoundary && !isEnd && 'text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg',
                  // Beyond boundary during checkout selection — visually disabled
                  beyondBoundary && !isUnavailable && !isPast && 'text-slate-300 dark:text-neutral-600 cursor-not-allowed',
                  // Range background — visible band
                  inRange && 'bg-emerald-100 dark:bg-emerald-900/50',
                  // Check-in date (left half-rounded, slightly translucent)
                  isStart && 'bg-emerald-500/90 dark:bg-emerald-500/85 text-white dark:text-white rounded-l-lg z-10 no-underline',
                  // Check-out date (right half-rounded, slightly translucent)
                  isEnd && !isStart && 'bg-blue-500/90 dark:bg-blue-500/85 text-white dark:text-white rounded-r-lg z-10 no-underline',
                  // Both same day (fully rounded)
                  isStart && isEnd && 'rounded-lg',
                  // Hover on available dates
                  !effectivelyDisabled && !isStart && !isEnd && !inRange && 'hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer',
                  // Today indicator
                  isTodayDate && !isStart && !isEnd && !isPast && !beyondBoundary && 'font-bold text-emerald-700 dark:text-emerald-400',
                )}
              >
                {/* Today dot indicator */}
                {isTodayDate && !isStart && !isEnd && !isPast && !beyondBoundary && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/90 dark:bg-emerald-500/85" />
            <span>Entrada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500/90 dark:bg-blue-500/85" />
            <span>Salida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800" />
            <span>Estadía</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 dark:text-neutral-600 line-through text-xs">15</span>
            <span>No disponible</span>
          </div>
        </div>
      </div>

      {/* Selection summary + confirm */}
      <div className={cn(
        'rounded-xl border transition-all overflow-hidden',
        selectionPhase === 'complete'
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
          : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900',
      )}>
        {selectionPhase === 'check-in' && (
          <div className="p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-neutral-400">
              Selecciona tu fecha de <span className="font-semibold text-emerald-700 dark:text-emerald-400">entrada</span> en el calendario
            </p>
          </div>
        )}

        {selectionPhase === 'check-out' && (
          <div className="p-4 space-y-3">
            {/* Two columns: check-in filled, check-out waiting */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Entrada</p>
                  <button onClick={handleReset} className="text-[10px] text-slate-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    cambiar
                  </button>
                </div>
                <p className="font-bold text-slate-900 dark:text-white capitalize text-sm">{format(checkInDate!, "EEE d MMM", { locale: es })}</p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">{checkInTime} hs</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-dashed border-blue-300 dark:border-blue-700">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Salida</p>
                <p className="text-sm text-slate-400 dark:text-neutral-500 animate-pulse">Seleccionar...</p>
              </div>
            </div>
            {/* Info messages */}
            {!hasValidCheckout && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50">
                <Info className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  No hay disponibilidad suficiente desde esta fecha. Elegí otra fecha de entrada.
                </p>
              </div>
            )}
            {hasValidCheckout && isBlockedLimit && (
              <p className="text-[11px] text-center text-slate-400 dark:text-neutral-500">
                Máximo {differenceInCalendarDays(maxCheckoutDate!, checkInDate!)} {differenceInCalendarDays(maxCheckoutDate!, checkInDate!) === 1 ? 'noche' : 'noches'} desde esta fecha
              </p>
            )}
            {hasValidCheckout && hoverDate && nights > 0 && (
              <p className="text-xs text-center text-slate-500 dark:text-neutral-400">
                {nights} {nights === 1 ? 'noche' : 'noches'}
              </p>
            )}
          </div>
        )}

        {selectionPhase === 'complete' && checkInDate && checkOutDate && (
          <div className="p-4 space-y-4">
            {/* Two columns: check-in and check-out */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Entrada</p>
                <p className="font-bold text-slate-900 dark:text-white capitalize text-sm">{format(checkInDate, "d MMM", { locale: es })}</p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">{checkInTime} hs</p>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-1">
                <Moon className="h-3.5 w-3.5 text-slate-500 dark:text-neutral-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-white">{nights}N</span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Salida</p>
                <p className="font-bold text-slate-900 dark:text-white capitalize text-sm">{format(checkOutDate, "d MMM", { locale: es })}</p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">{checkOutTime} hs</p>
              </div>
            </div>

            {/* Confirm button */}
            {onConfirm && (
              <Button
                onClick={onConfirm}
                className="w-full h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all"
              >
                Confirmar fechas y continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
