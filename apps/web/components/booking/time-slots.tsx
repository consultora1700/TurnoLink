'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  slots: { time: string; available: boolean }[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  loading?: boolean;
}

export function TimeSlots({ slots, selectedTime, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Cargando horarios...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-orange-500" />
        </div>
        <p className="font-medium text-slate-700">No hay horarios disponibles</p>
        <p className="text-sm text-muted-foreground mt-1">
          Probá con otra fecha
        </p>
      </div>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  if (availableSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-red-500" />
        </div>
        <p className="font-medium text-slate-700">Sin disponibilidad</p>
        <p className="text-sm text-muted-foreground mt-1">
          Todos los horarios están ocupados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-200" />
          <span>Ocupado</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot, index) => (
          <button
            key={slot.time}
            onClick={() => slot.available && onSelect(slot.time)}
            disabled={!slot.available}
            className={cn(
              'relative py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200',
              slot.available
                ? selectedTime === slot.time
                  ? 'bg-gradient-primary text-white shadow-glow-sm scale-105'
                  : 'bg-white border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
            style={{
              animationDelay: `${index * 0.02}s`,
            }}
          >
            {slot.time}
            {!slot.available && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-full h-px bg-slate-300 transform -rotate-12" />
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        {availableSlots.length} horario{availableSlots.length !== 1 ? 's' : ''} disponible{availableSlots.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
