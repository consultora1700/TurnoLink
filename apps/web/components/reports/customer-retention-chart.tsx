'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CustomerRetention } from '@/lib/api';

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
};

export function CustomerRetentionChart({ data }: { data: CustomerRetention[] }) {
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const total = latest ? latest.returningCustomers + latest.newCustomers : 0;
  const retentionRate = total > 0
    ? Math.round((latest!.returningCustomers / total) * 100)
    : 0;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Retención de Clientes</CardTitle>
            <CardDescription className="text-xs">
              Clientes nuevos vs. recurrentes por mes
            </CardDescription>
          </div>
          {latest && total > 0 && (
            <div className="text-center px-3 py-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 shrink-0">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Retención</p>
              <p className="text-sm font-bold text-blue-500">{retentionRate}%</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="returningGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.06]" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatMonth}
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
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
                labelFormatter={(label) => formatMonth(String(label))}
                cursor={false}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconSize={8}
              />
              <Bar
                dataKey="returningCustomers"
                name="Recurrentes"
                stackId="a"
                fill="url(#returningGradient)"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="newCustomers"
                name="Nuevos"
                stackId="a"
                fill="url(#newGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
