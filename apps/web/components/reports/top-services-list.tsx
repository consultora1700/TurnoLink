'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { TopService } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

const RANK_COLORS = [
  'bg-amber-500 text-white',
  'bg-slate-400 text-white',
  'bg-amber-700 text-white',
  'bg-muted text-muted-foreground',
  'bg-muted text-muted-foreground',
];

export function TopServicesList({ data }: { data: TopService[] }) {
  const maxBookings = data.length > 0 ? data[0].bookings : 1;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Servicios</CardTitle>
        <CardDescription className="text-xs">Los más reservados del mes</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sin datos este mes</p>
        ) : (
          <div className="space-y-3">
            {data.map((service, i) => (
              <div key={service.serviceId} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${RANK_COLORS[i] || RANK_COLORS[3]}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium truncate">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{service.bookings}</span>
                    <span className="font-medium text-xs tabular-nums">{formatCurrency(service.revenue)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden ml-[30px]">
                  <div
                    className="h-full bg-blue-500/80 rounded-full transition-all group-hover:bg-blue-500"
                    style={{ width: `${(service.bookings / maxBookings) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
