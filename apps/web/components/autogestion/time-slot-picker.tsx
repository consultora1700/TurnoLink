'use client';

import { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Zap, Clock, CalendarDays } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ApiClient, TimeSlot } from '@/lib/api';

interface TimeSlotPickerProps {
  api: ApiClient;
  date: Date;
  serviceId?: string;
  onDateChange: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  selectedTime: string | null;
}

export function TimeSlotPicker({
  api,
  date,
  serviceId,
  onDateChange,
  onTimeSelect,
  selectedTime,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNow, setIsNow] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      setLoading(true);
      try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const data = await api.getAvailability(dateStr, serviceId);
        setSlots(Array.isArray(data) ? data : []);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, [api, date, serviceId]);

  const handleNowClick = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    setIsNow(true);
    onTimeSelect(timeStr);
  };

  const handleSlotClick = (time: string) => {
    setIsNow(false);
    onTimeSelect(time);
  };

  const currentTimeStr = (() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  })();

  const availableSlots = slots.filter((s) => s.available);
  const unavailableSlots = slots.filter((s) => !s.available);

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Fecha
        </Label>
        <Input
          type="date"
          value={format(date, 'yyyy-MM-dd')}
          onChange={(e) => {
            if (e.target.value) {
              // Parse as local date to avoid timezone issues
              const [y, m, d] = e.target.value.split('-').map(Number);
              onDateChange(new Date(y, m - 1, d));
            }
          }}
          className="w-full"
        />
      </div>

      {/* "Atender Ahora" button — only if today */}
      {isToday(date) && (
        <button
          onClick={handleNowClick}
          className={cn(
            'w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all',
            isNow && selectedTime
              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 shadow-md'
              : 'border-teal-300 dark:border-teal-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20'
          )}
        >
          <div className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center',
            isNow && selectedTime
              ? 'bg-teal-500 text-white'
              : 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400'
          )}>
            <Zap className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm text-teal-700 dark:text-teal-300">
              Atender Ahora — {currentTimeStr}
            </p>
            <p className="text-xs text-muted-foreground">
              Crear turno en este momento exacto
            </p>
          </div>
          {isNow && selectedTime && (
            <div className="ml-auto text-teal-600 dark:text-teal-400 font-bold text-lg">
              {selectedTime}
            </div>
          )}
        </button>
      )}

      {/* Slots grid */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Horarios disponibles
          {loading && (
            <div className="h-3.5 w-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          )}
        </Label>

        {!loading && slots.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay horarios configurados para este día
          </div>
        )}

        {!loading && slots.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {slots.map((slot) => {
              const isSelected = !isNow && selectedTime === slot.time;
              const isAvailable = slot.available;

              return (
                <button
                  key={slot.time}
                  onClick={() => isAvailable && handleSlotClick(slot.time)}
                  disabled={!isAvailable}
                  className={cn(
                    'px-2 py-2 rounded-lg text-sm font-medium transition-all text-center',
                    isSelected
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md scale-105'
                      : isAvailable
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:shadow-sm'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-600 line-through cursor-not-allowed'
                  )}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        )}

        {!loading && availableSlots.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {availableSlots.length} horarios disponibles
            {unavailableSlots.length > 0 && ` · ${unavailableSlots.length} ocupados`}
          </p>
        )}
      </div>
    </div>
  );
}
