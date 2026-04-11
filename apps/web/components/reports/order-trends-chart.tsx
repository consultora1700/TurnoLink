'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { OrderTrend } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DELIVERED: { label: 'Entregados', color: '#10b981' },
  CONFIRMED: { label: 'Confirmados', color: '#3b82f6' },
  PROCESSING: { label: 'En proceso', color: '#8b5cf6' },
  SHIPPED: { label: 'Enviados', color: '#06b6d4' },
  PENDING: { label: 'Pendientes', color: '#f59e0b' },
  CANCELLED: { label: 'Cancelados', color: '#ef4444' },
};

export function OrderTrendsChart({ data }: { data: OrderTrend[] }) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  const chartData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
  }));

  const toggleLine = (key: string) => {
    setHiddenLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalDelivered = data.reduce((s, d) => s + d.DELIVERED, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Tendencia de Pedidos</CardTitle>
            <CardDescription className="text-xs">Volumen diario de pedidos por estado</CardDescription>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Entregados</p>
            <p className="text-sm font-bold text-emerald-600">{totalDelivered}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.08]" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  fontSize: '12px',
                }}
              />
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={cfg.label}
                  stroke={cfg.color}
                  strokeWidth={2}
                  dot={false}
                  hide={hiddenLines.has(key)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all ${
                hiddenLines.has(key)
                  ? 'opacity-40 line-through'
                  : 'opacity-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
