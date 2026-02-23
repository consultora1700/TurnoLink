'use client';

import { useState } from 'react';
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
}

export function BookingCalendar({ selectedDate, onSelect, maxAdvanceDays = 30 }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  return (
    <div className="bg-background border rounded-lg p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
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
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && onSelect(day)}
              disabled={isDisabled}
              className={cn(
                'h-10 rounded-md text-sm font-medium transition-colors',
                !isCurrentMonth && 'text-muted-foreground/50',
                isDisabled && 'text-muted-foreground/30 cursor-not-allowed',
                !isDisabled && !isSelected && 'hover:bg-muted',
                isSelected && 'bg-primary text-primary-foreground',
                isTodayDate && !isSelected && 'border border-primary'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
