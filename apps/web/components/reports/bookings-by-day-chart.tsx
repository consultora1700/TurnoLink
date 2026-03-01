'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { BookingsByDay } from '@/lib/api';

export function BookingsByDayChart({ data }: { data: BookingsByDay[] }) {
  // Reorder: Monday first
  const ordered = [...data.slice(1), data[0]];

  // Find busiest day
  const busiest = ordered.reduce((best, d) => d.count > best.count ? d : best, ordered[0]);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Reservas por Día</CardTitle>
            <CardDescription className="text-xs">Distribución semanal del mes actual</CardDescription>
          </div>
          {busiest && busiest.count > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Día más activo</p>
              <p className="text-sm font-semibold">{busiest.day}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordered} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.08]" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => v.slice(0, 3)}
                axisLine={false}
                tickLine={false}
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
                formatter={(value: any) => [value, 'Reservas']}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
