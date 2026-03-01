'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { EmployeePerformance } from '@/lib/api';

export function EmployeePerformanceChart({ data }: { data: EmployeePerformance[] }) {
  const topPerformer = data.length > 0
    ? data.reduce((best, emp) => emp.completed > best.completed ? emp : best, data[0])
    : null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Rendimiento por Empleado</CardTitle>
            <CardDescription className="text-xs">
              Reservas atendidas por cada miembro del equipo
            </CardDescription>
          </div>
          {topPerformer && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Mejor</p>
              <p className="text-sm font-semibold truncate max-w-[120px]">{topPerformer.name}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin datos de empleados</p>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="empCompletedGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="empCancelledGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="empNoShowGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.06]" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={95}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => (v.length > 13 ? v.slice(0, 13) + '…' : v)}
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
                  formatter={(value: any, name: any) => {
                    const labels: Record<string, string> = {
                      completed: 'Completadas',
                      cancelled: 'Canceladas',
                      noShow: 'No-Show',
                    };
                    return [value, labels[name] || name];
                  }}
                  cursor={false}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconSize={8}
                />
                <Bar
                  dataKey="completed"
                  name="Completadas"
                  stackId="a"
                  fill="url(#empCompletedGrad)"
                  maxBarSize={26}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  name="Canceladas"
                  stackId="a"
                  fill="url(#empCancelledGrad)"
                  maxBarSize={26}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="noShow"
                  name="No-Show"
                  stackId="a"
                  fill="url(#empNoShowGrad)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
