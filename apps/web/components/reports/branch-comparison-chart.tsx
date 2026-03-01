'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { BranchComparison } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

export function BranchComparisonChart({ data }: { data: BranchComparison[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Comparación entre Sucursales</CardTitle>
        <CardDescription className="text-xs">
          Reservas y métricas por cada ubicación activa
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay sucursales activas</p>
        ) : (
          <>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-[0.08]" />
                  <XAxis
                    dataKey="branchName"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => (v.length > 14 ? v.slice(0, 14) + '…' : v)}
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
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [formatCurrency(value), 'Ingresos'];
                      const labels: Record<string, string> = {
                        completedBookings: 'Completadas',
                        cancelledBookings: 'Canceladas',
                        noShowBookings: 'No-Show',
                      };
                      return [value, labels[name] || name];
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="completedBookings" name="Completadas" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="cancelledBookings" name="Canceladas" fill="#ef4444" radius={[0, 0, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="noShowBookings" name="No-Show" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2.5 font-medium text-xs">Sucursal</th>
                    <th className="text-right py-2.5 font-medium text-xs">Reservas</th>
                    <th className="text-right py-2.5 font-medium text-xs">Ingresos</th>
                    <th className="text-right py-2.5 font-medium text-xs">Tasa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((b) => (
                    <tr key={b.branchId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-medium text-xs">{b.branchName}</td>
                      <td className="py-2.5 text-right text-xs tabular-nums">{b.totalBookings}</td>
                      <td className="py-2.5 text-right text-xs tabular-nums">{formatCurrency(b.revenue)}</td>
                      <td className="py-2.5 text-right text-xs">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          b.completionRate >= 80
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : b.completionRate >= 60
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {b.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
