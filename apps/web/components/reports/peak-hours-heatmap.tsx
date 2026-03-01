'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { PeakHoursReport } from '@/lib/api';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS_RANGE = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

function getCellStyle(count: number, max: number): { className: string; style?: React.CSSProperties } {
  if (max === 0 || count === 0) {
    return { className: 'bg-muted/30 dark:bg-muted/15 text-transparent' };
  }
  const intensity = count / max;
  if (intensity > 0.75) {
    return {
      className: 'text-white font-semibold',
      style: {
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        boxShadow: '0 0 12px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      },
    };
  }
  if (intensity > 0.5) {
    return {
      className: 'text-white',
      style: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        boxShadow: '0 0 8px rgba(139, 92, 246, 0.3)',
      },
    };
  }
  if (intensity > 0.25) {
    return {
      className: 'text-violet-900 dark:text-violet-100',
      style: {
        background: 'rgba(139, 92, 246, 0.25)',
      },
    };
  }
  return {
    className: 'text-violet-700 dark:text-violet-300',
    style: {
      background: 'rgba(139, 92, 246, 0.1)',
    },
  };
}

export function PeakHoursHeatmap({ data }: { data: PeakHoursReport }) {
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];

  // Find peak
  let peakDay = '';
  let peakHour = 0;
  let peakCount = 0;
  dayOrder.forEach((dayIdx) => {
    HOURS_RANGE.forEach((hour) => {
      const count = data.matrix[dayIdx]?.[hour] || 0;
      if (count > peakCount) {
        peakCount = count;
        peakDay = DAYS[dayIdx];
        peakHour = hour;
      }
    });
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Horarios Pico</CardTitle>
            <CardDescription className="text-xs">
              Distribución de reservas por día y hora
            </CardDescription>
          </div>
          {peakCount > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Mayor demanda</p>
              <p className="text-sm font-semibold">
                {peakDay} {peakHour}:00{' '}
                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded bg-violet-600 text-white text-[10px] font-bold">
                  {peakCount}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            {/* Hour headers */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `48px repeat(${HOURS_RANGE.length}, 1fr)` }}>
              <div />
              {HOURS_RANGE.map((h) => (
                <div key={h} className="text-[10px] text-center text-muted-foreground/70 font-medium tabular-nums">
                  {h}h
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="grid gap-1 mt-1.5" style={{ gridTemplateColumns: `48px repeat(${HOURS_RANGE.length}, 1fr)` }}>
              {dayOrder.map((dayIdx) => (
                <div key={dayIdx} className="contents">
                  <div className="text-[11px] font-semibold text-muted-foreground/80 flex items-center">
                    {DAYS[dayIdx]}
                  </div>
                  {HOURS_RANGE.map((hour) => {
                    const count = data.matrix[dayIdx]?.[hour] || 0;
                    const cell = getCellStyle(count, data.maxCount);
                    return (
                      <div
                        key={hour}
                        className={`h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200 hover:scale-105 cursor-default ${cell.className}`}
                        style={cell.style}
                        title={`${DAYS[dayIdx]} ${hour}:00 — ${count} reservas`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-[10px] text-muted-foreground/70">Menos</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-3 rounded bg-muted/30 dark:bg-muted/15" />
                <div className="w-5 h-3 rounded" style={{ background: 'rgba(139, 92, 246, 0.1)' }} />
                <div className="w-5 h-3 rounded" style={{ background: 'rgba(139, 92, 246, 0.25)' }} />
                <div className="w-5 h-3 rounded" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} />
                <div className="w-5 h-3 rounded" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 6px rgba(124, 58, 237, 0.3)' }} />
              </div>
              <span className="text-[10px] text-muted-foreground/70">Más</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
