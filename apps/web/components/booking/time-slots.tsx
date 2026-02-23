'use client';

import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Period icons ───────────────────────────────────────────────────────────
// Stroke = currentColor → auto-adapts to text color of parent button
// Fill = medium-tone fixed color → visible on all backgrounds (white, dark, gray)
//
// Contrast verified on: bg-slate-900, bg-white, bg-slate-100, bg-neutral-700

function MorningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Horizon */}
      <line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" />
      {/* Half sun rising */}
      <path d="M7 17a5 5 0 0 1 10 0" fill="#D97706" stroke="currentColor" />
      {/* Rays */}
      <line x1="12" y1="6" x2="12" y2="9" stroke="currentColor" />
      <line x1="6.3" y1="9.3" x2="8.5" y2="11.5" stroke="currentColor" />
      <line x1="17.7" y1="9.3" x2="15.5" y2="11.5" stroke="currentColor" />
    </svg>
  );
}

function AfternoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Sun body */}
      <circle cx="12" cy="12" r="4" fill="#EA580C" stroke="currentColor" />
      {/* Cardinal rays */}
      <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" />
      {/* Diagonal rays */}
      <line x1="5.6" y1="5.6" x2="7.8" y2="7.8" stroke="currentColor" />
      <line x1="18.4" y1="5.6" x2="16.2" y2="7.8" stroke="currentColor" />
      <line x1="5.6" y1="18.4" x2="7.8" y2="16.2" stroke="currentColor" />
      <line x1="18.4" y1="18.4" x2="16.2" y2="16.2" stroke="currentColor" />
    </svg>
  );
}

function NightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Crescent moon */}
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#6366F1" stroke="currentColor" />
      {/* Star */}
      <path d="M17 4l.6 1.9L19.5 6.5l-1.9.6L17 9l-.6-1.9L14.5 6.5l1.9-.6L17 4z" fill="#EAB308" stroke="none" />
    </svg>
  );
}

// ─── Period definitions ─────────────────────────────────────────────────────

type Period = 'morning' | 'afternoon' | 'night';

const PERIODS: { key: Period; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'morning', label: 'Mañana', Icon: MorningIcon },
  { key: 'afternoon', label: 'Tarde', Icon: AfternoonIcon },
  { key: 'night', label: 'Noche', Icon: NightIcon },
];

function getPeriod(time: string): Period {
  const h = parseInt(time.split(':')[0], 10);
  if (h >= 6 && h < 14) return 'morning';
  if (h >= 14 && h < 22) return 'afternoon';
  return 'night';
}

// ─── Main component ─────────────────────────────────────────────────────────

interface Props {
  slots: { time: string; available: boolean }[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  loading?: boolean;
  groupByPeriod?: boolean;
}

export function TimeSlots({ slots, selectedTime, onSelect, loading, groupByPeriod = true }: Props) {
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);

  const availableSlots = useMemo(() => slots.filter((s) => s.available), [slots]);

  const grouped = useMemo(() => {
    const groups: Record<Period, { time: string }[]> = {
      morning: [],
      afternoon: [],
      night: [],
    };
    for (const slot of availableSlots) {
      groups[getPeriod(slot.time)].push(slot);
    }
    return groups;
  }, [availableSlots]);

  const useGrouped = groupByPeriod && availableSlots.length > 12;

  const defaultPeriod = useMemo(() => {
    for (const p of PERIODS) {
      if (grouped[p.key].length > 0) return p.key;
    }
    return 'morning';
  }, [grouped]);

  const currentPeriod = activePeriod && grouped[activePeriod]?.length > 0 ? activePeriod : defaultPeriod;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-neutral-600 border-t-slate-600 dark:border-t-neutral-300 animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando horarios...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="font-medium text-slate-700 dark:text-neutral-200">No hay horarios disponibles</p>
        <p className="text-sm text-muted-foreground mt-1">Probá con otra fecha</p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="font-medium text-slate-700 dark:text-neutral-200">Sin disponibilidad</p>
        <p className="text-sm text-muted-foreground mt-1">Todos los horarios están ocupados</p>
      </div>
    );
  }

  // ─── Flat mode ───
  if (!useGrouped) {
    return (
      <div className="space-y-3 w-full">
        <SlotGrid slots={availableSlots} selectedTime={selectedTime} onSelect={onSelect} />
        <p className="text-xs text-center text-muted-foreground">
          {availableSlots.length} horario{availableSlots.length !== 1 ? 's' : ''} disponible{availableSlots.length !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  // ─── Grouped mode ───
  const periodSlots = grouped[currentPeriod];

  return (
    <div className="space-y-3 w-full min-w-0">
      {/* Period tabs */}
      <div className="w-full min-w-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 pb-0.5">
          {PERIODS.map((p) => {
            const count = grouped[p.key].length;
            if (count === 0) return null;
            const isActive = currentPeriod === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setActivePeriod(p.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0',
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 active:bg-slate-200 dark:active:bg-neutral-600'
                )}
              >
                <p.Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] flex-shrink-0" />
                <span>{p.label}</span>
                <span className={cn(
                  'text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  isActive
                    ? 'bg-white/20 dark:bg-neutral-900/20'
                    : 'bg-slate-200 dark:bg-neutral-600 text-slate-500 dark:text-neutral-400'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <SlotGrid slots={periodSlots} selectedTime={selectedTime} onSelect={onSelect} />

      <p className="text-xs text-center text-muted-foreground">
        {availableSlots.length} horario{availableSlots.length !== 1 ? 's' : ''} disponible{availableSlots.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ─── Slot grid ──────────────────────────────────────────────────────────────

function SlotGrid({
  slots,
  selectedTime,
  onSelect,
}: {
  slots: { time: string }[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0">
      {slots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => onSelect(slot.time)}
          className={cn(
            'py-2.5 px-1 sm:py-3 sm:px-3 rounded-xl text-[13px] sm:text-sm font-medium transition-colors border-2 min-w-0 truncate',
            selectedTime === slot.time
              ? 'bg-slate-900 dark:bg-white text-white dark:text-neutral-900 border-slate-900 dark:border-white'
              : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-600 hover:border-slate-400 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-700 active:bg-slate-100 dark:active:bg-neutral-600 text-slate-700 dark:text-neutral-200'
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
