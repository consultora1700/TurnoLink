'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { BookingTrend } from '@/lib/api';

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

const LINES = [
  { key: 'COMPLETED', name: 'Completadas', color: '#10b981' },
  { key: 'CONFIRMED', name: 'Confirmadas', color: '#3b82f6' },
  { key: 'PENDING', name: 'Pendientes', color: '#f59e0b' },
  { key: 'CANCELLED', name: 'Canceladas', color: '#ef4444' },
  { key: 'NO_SHOW', name: 'No-Show', color: '#8b5cf6' },
];

export function BookingTrendsChart({ data }: { data: BookingTrend[] }) {
  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    () => new Set(LINES.map((l) => l.key))
  );

  const toggleLine = (key: string) => {
    setVisibleLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        // Don't allow hiding all lines
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Compute total for quick stat
  const totalCompleted = data.reduce((s, d) => s + ((d as any).COMPLETED || 0), 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Tendencia de Reservas</CardTitle>
            <CardDescription className="text-xs">
              Volumen diario de reservas por estado
            </CardDescription>
          </div>
          {totalCompleted > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Completadas</p>
              <p className="text-sm font-semibold text-emerald-500">{totalCompleted}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Interactive legend toggles */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {LINES.map((line) => {
            const active = visibleLines.has(line.key);
            return (
              <button
                key={line.key}
                type="button"
                onClick={() => toggleLine(line.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  active
                    ? 'border-transparent shadow-sm'
                    : 'border-slate-200 dark:border-neutral-700 bg-transparent text-slate-400 dark:text-neutral-500'
                }`}
                style={active ? {
                  backgroundColor: `${line.color}18`,
                  color: line.color,
                  borderColor: `${line.color}30`,
                } : undefined}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-opacity"
                  style={{
                    backgroundColor: line.color,
                    opacity: active ? 1 : 0.3,
                  }}
                />
                {line.name}
              </button>
            );
          })}
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                {LINES.map((line) => (
                  <linearGradient key={`grad-${line.key}`} id={`trend-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={line.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={line.color} stopOpacity={0} />
                  </linearGradient>
                ))}
                {LINES.map((line) => (
                  <filter key={`filter-${line.key}`} id={`glow-${line.key}`}>
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.05]" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
                labelFormatter={(label) => formatDate(String(label))}
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.3 }}
              />
              {/* Render areas — reversed order so COMPLETED renders on top */}
              {[...LINES].reverse().map((line) =>
                visibleLines.has(line.key) ? (
                  <Area
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.color}
                    strokeWidth={2}
                    fill={`url(#trend-${line.key})`}
                    fillOpacity={1}
                    filter={`url(#glow-${line.key})`}
                    activeDot={{ r: 4, fill: line.color, stroke: '#fff', strokeWidth: 2 }}
                    dot={false}
                  />
                ) : null
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
