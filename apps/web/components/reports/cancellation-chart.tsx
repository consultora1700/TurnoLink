'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CancellationTrend } from '@/lib/api';

const formatWeek = (weekStr: string) => {
  const d = new Date(weekStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

export function CancellationChart({ data }: { data: CancellationTrend[] }) {
  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Cancelaciones y No-Show</CardTitle>
            <CardDescription className="text-xs">
              Tendencia semanal de tasas negativas
            </CardDescription>
          </div>
          {latest && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-2.5 py-1 rounded-lg bg-red-500/10 dark:bg-red-500/15">
                <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">Cancel.</p>
                <p className="text-sm font-bold text-red-500">{latest.cancellationRate}%</p>
              </div>
              <div className="text-center px-2.5 py-1 rounded-lg bg-violet-500/10 dark:bg-violet-500/15">
                <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">No-Show</p>
                <p className="text-sm font-bold text-violet-500">{latest.noShowRate}%</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="cancelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="noShowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <filter id="cancelGlow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="noShowGlow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.06]" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatWeek}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
                labelFormatter={(label) => formatWeek(String(label))}
                formatter={(value: any, name: any) => [
                  `${value}%`,
                  name === 'cancellationRate' ? 'Cancelación' : 'No-Show',
                ]}
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.3 }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconSize={8}
                formatter={(value) =>
                  value === 'cancellationRate' ? 'Cancelación' : 'No-Show'
                }
              />
              <Area
                type="monotone"
                dataKey="cancellationRate"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#cancelGradient)"
                fillOpacity={1}
                filter="url(#cancelGlow)"
                activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="noShowRate"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#noShowGradient)"
                fillOpacity={1}
                filter="url(#noShowGlow)"
                activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
