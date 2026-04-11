'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { OrderCancellationTrend } from '@/lib/api';

export function OrderCancellationChart({ data }: { data: OrderCancellationTrend[] }) {
  const chartData = data.map((d) => ({
    ...d,
    weekLabel: new Date(d.week + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
  }));

  const avgRate = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.cancellationRate, 0) / data.length)
    : 0;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Cancelaciones</CardTitle>
            <CardDescription className="text-xs">Tendencia semanal de tasa de cancelaci&oacute;n</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Prom. {avgRate}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.08]" />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                unit="%"
                domain={[0, 'auto']}
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
                formatter={(value: any) => [`${value}%`, 'Cancelaci\u00f3n']}
              />
              <Line
                type="monotone"
                dataKey="cancellationRate"
                name="Cancelaci&oacute;n"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
