'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  maxAdvanceDays?: number;
  unavailableDates?: Record<string, boolean>;
  onMonthChange?: (year: number, month: number) => void;
}

export function BookingCalendar({ selectedDate, onSelect, maxAdvanceDays = 30, unavailableDates, onMonthChange }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const onMonthChangeRef = useRef(onMonthChange);
  onMonthChangeRef.current = onMonthChange;

  // Fire onMonthChange on mount
  useEffect(() => {
    const now = new Date();
    onMonthChangeRef.current?.(now.getFullYear(), now.getMonth() + 1);
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const today = startOfDay(new Date());
  const maxDate = startOfDay(addDays(today, maxAdvanceDays));

  // Disable navigation to months entirely before today or after maxDate
  const canGoPrev = isSameMonth(currentMonth, today) ? false : isAfter(startOfMonth(currentMonth), today) || isSameMonth(currentMonth, addMonths(today, 1));
  const canGoNext = isBefore(startOfMonth(addMonths(currentMonth, 1)), maxDate) || isSameMonth(addMonths(currentMonth, 1), maxDate);

  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
    onMonthChange?.(prev.getFullYear(), prev.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    onMonthChange?.(next.getFullYear(), next.getMonth() + 1);
  };

  return (
    <div className="bg-background border rounded-lg p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          disabled={isSameMonth(currentMonth, today)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month start */}
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}

        {/* Days */}
        {days.map((day) => {
          const isPast = isBefore(day, today);
          const isBeyondMax = isAfter(day, maxDate);
          const isDisabled = isPast || isBeyondMax;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasNoAvailability = unavailableDates && unavailableDates[dateStr] === false;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && onSelect(day)}
              disabled={isDisabled}
              className={cn(
                'relative h-10 rounded-md text-sm font-medium transition-colors',
                !isCurrentMonth && 'text-muted-foreground/50',
                isDisabled && 'text-muted-foreground/30 cursor-not-allowed',
                !isDisabled && !isSelected && 'hover:bg-muted',
                isSelected && 'bg-primary text-primary-foreground',
                isTodayDate && !isSelected && 'border border-primary',
                !isDisabled && hasNoAvailability && !isSelected && 'opacity-40',
              )}
            >
              {format(day, 'd')}
              {!isDisabled && hasNoAvailability && !isSelected && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                  <span className="block w-5 h-px bg-current opacity-60 rotate-[-20deg]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
