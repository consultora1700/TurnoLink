'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RevenueReport } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

export function RevenueChart({ data }: { data: RevenueReport }) {
  const mid = Math.floor(data.data.length / 2);
  const firstHalf = data.data.slice(0, mid).reduce((s, d) => s + d.revenue, 0);
  const secondHalf = data.data.slice(mid).reduce((s, d) => s + d.revenue, 0);
  const trendUp = secondHalf >= firstHalf;

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Ingresos en el Tiempo</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Evolución de ingresos por reservas completadas
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(data.summary.total)}</p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {trendUp ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <p className="text-xs text-muted-foreground">
                Prom. diario: {formatCurrency(data.summary.average)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                {/* Blue light gradient fading down */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                  <stop offset="40%" stopColor="#60a5fa" stopOpacity={0.2} />
                  <stop offset="75%" stopColor="#93c5fd" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0} />
                </linearGradient>
                {/* Blue glow filter for the line */}
                <filter id="revenueGlow" x="-15%" y="-30%" width="130%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.05]" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
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
                formatter={(value: any) => [formatCurrency(Number(value)), 'Ingresos']}
                labelFormatter={(label) => formatDate(String(label))}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.4 }}
              />
              {/* Glow layer — wide soft blue light behind the line */}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={5}
                strokeOpacity={0.2}
                fill="none"
                filter="url(#revenueGlow)"
              />
              {/* Main line + gradient fill */}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 5,
                  fill: '#3b82f6',
                  stroke: '#fff',
                  strokeWidth: 2,
                  style: { filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' },
                }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
