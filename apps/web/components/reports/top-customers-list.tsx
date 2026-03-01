'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { TopCustomer } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

const AVATAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
];

export function TopCustomersList({ data }: { data: TopCustomer[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Clientes</CardTitle>
        <CardDescription className="text-xs">Los más frecuentes del mes</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sin datos este mes</p>
        ) : (
          <div className="space-y-2.5">
            {data.map((customer, i) => (
              <div key={customer.customerId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors -mx-2">
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm`}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{customer.name}</p>
                  <p className="text-[11px] text-muted-foreground">{customer.phone}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold tabular-nums">{customer.bookings}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">{formatCurrency(customer.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
