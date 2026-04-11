'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProductPerformance } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

export function ProductPerformanceTable({ data }: { data: ProductPerformance[] }) {
  const topRevenue = data.length > 0
    ? data.reduce((best, p) => p.revenue > best.revenue ? p : best, data[0])
    : null;

  const maxUnits = data.length > 0 ? Math.max(...data.map((p) => p.totalUnits)) : 1;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Rendimiento por Producto</CardTitle>
            <CardDescription className="text-xs">M&eacute;tricas detalladas de cada producto vendido</CardDescription>
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
          <p className="text-sm text-muted-foreground text-center py-8">Sin datos en este per&iacute;odo</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left py-2 px-1 font-medium">Producto</th>
                  <th className="text-right py-2 px-1 font-medium">Uds.</th>
                  <th className="text-right py-2 px-1 font-medium hidden sm:table-cell">Entregadas</th>
                  <th className="text-right py-2 px-1 font-medium">Ingresos</th>
                  <th className="text-right py-2 px-1 font-medium hidden sm:table-cell">Tasa</th>
                  <th className="py-2 px-1 w-24 hidden md:table-cell"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((product) => (
                  <tr key={product.productId || product.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-1 font-medium truncate max-w-[160px]">{product.name}</td>
                    <td className="py-2.5 px-1 text-right tabular-nums">{product.totalUnits}</td>
                    <td className="py-2.5 px-1 text-right tabular-nums hidden sm:table-cell">{product.deliveredUnits}</td>
                    <td className="py-2.5 px-1 text-right tabular-nums font-medium">{formatCurrency(product.revenue)}</td>
                    <td className={cn(
                      'py-2.5 px-1 text-right tabular-nums font-medium hidden sm:table-cell',
                      product.fulfillmentRate >= 80 ? 'text-emerald-600' :
                      product.fulfillmentRate >= 50 ? 'text-amber-600' : 'text-red-600',
                    )}>
                      {product.fulfillmentRate}%
                    </td>
                    <td className="py-2.5 px-1 hidden md:table-cell">
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-400 dark:bg-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${(product.totalUnits / maxUnits) * 100}%` }}
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
