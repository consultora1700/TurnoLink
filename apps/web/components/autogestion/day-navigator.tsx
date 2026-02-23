'use client';

import { format, addDays, subDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DayNavigatorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DayNavigator({ date, onDateChange }: DayNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(subDays(date, 1))}
        className="h-9 w-9 rounded-lg"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="text-center min-w-[180px] sm:min-w-[220px]">
        <p className="font-semibold text-sm sm:text-base capitalize">
          {format(date, "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(addDays(date, 1))}
        className="h-9 w-9 rounded-lg"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isToday(date) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDateChange(new Date())}
          className="h-9"
        >
          Hoy
        </Button>
      )}
    </div>
  );
}
