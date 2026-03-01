'use client';

import { Calendar, DollarSign, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ReportOverview } from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

export function OverviewKpis({ data }: { data: ReportOverview }) {
  const kpis = [
    {
      title: 'Reservas del Mes',
      value: data.totalBookings,
      subtitle: `${data.completionRate}% completadas`,
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Ingresos',
      value: formatCurrency(data.totalRevenue),
      subtitle: `${data.completedBookings} completadas`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Cancelaciones',
      value: `${data.cancellationRate}%`,
      subtitle: `${data.cancelledBookings} canceladas`,
      icon: XCircle,
      gradient: 'from-violet-500 to-violet-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'No-Show',
      value: `${data.noShowRate}%`,
      subtitle: `${data.noShowBookings} ausencias`,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className={`border-0 shadow-md bg-gradient-to-br ${kpi.gradient} text-white overflow-hidden relative group`}>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full transition-transform group-hover:scale-110" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wider">{kpi.title}</p>
              <div className={`h-8 w-8 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{kpi.value}</p>
            <p className="text-xs text-white/70 mt-1">{kpi.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
