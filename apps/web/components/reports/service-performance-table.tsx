'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ServicePerformance } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

export function ServicePerformanceTable({ data }: { data: ServicePerformance[] }) {
  const maxBookings = data.length > 0 ? Math.max(...data.map((d) => d.totalBookings)) : 1;

  // Find top revenue service
  const topRevenue = data.length > 0
    ? data.reduce((best, s) => s.revenue > best.revenue ? s : best, data[0])
    : null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Rendimiento por Servicio</CardTitle>
            <CardDescription className="text-xs">
              Métricas detalladas de cada servicio ofrecido
            </CardDescription>
          </div>
          {topRevenue && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Mayor ingreso</p>
              <p className="text-sm font-semibold truncate max-w-[140px]">{topRevenue.name}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin datos de servicios</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2.5 font-medium text-xs">Servicio</th>
                  <th className="text-right py-2.5 font-medium text-xs">Reservas</th>
                  <th className="text-right py-2.5 font-medium text-xs hidden sm:table-cell">Completadas</th>
                  <th className="text-right py-2.5 font-medium text-xs">Ingresos</th>
                  <th className="text-right py-2.5 font-medium text-xs hidden sm:table-cell">Tasa</th>
                  <th className="py-2.5 pl-4 w-24 hidden md:table-cell" />
                </tr>
              </thead>
              <tbody>
                {data.map((service) => (
                  <tr key={service.serviceId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-xs">{service.name}</td>
                    <td className="py-3 text-right text-xs tabular-nums">{service.totalBookings}</td>
                    <td className="py-3 text-right text-xs tabular-nums hidden sm:table-cell">{service.completedBookings}</td>
                    <td className="py-3 text-right font-medium text-xs tabular-nums">{formatCurrency(service.revenue)}</td>
                    <td className="py-3 text-right text-xs hidden sm:table-cell">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        service.completionRate >= 80
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : service.completionRate >= 60
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {service.completionRate}%
                      </span>
                    </td>
                    <td className="py-3 pl-4 hidden md:table-cell">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(service.totalBookings / maxBookings) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
