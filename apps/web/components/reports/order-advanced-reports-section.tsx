'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, ShoppingBag, Sparkles } from 'lucide-react';
import type { ApiClient, ReportParams, RevenueReport, OrderTrend, PeakHoursReport, OrderCancellationTrend, CustomerRetention, ProductPerformance } from '@/lib/api';
import { DateRangeSelector } from './date-range-selector';
import { OrderExportCsvButton } from './order-export-csv-button';
import { RevenueChart } from './revenue-chart';
import { OrderTrendsChart } from './order-trends-chart';
import { PeakHoursHeatmap } from './peak-hours-heatmap';
import { OrderCancellationChart } from './order-cancellation-chart';
import { CustomerRetentionChart } from './customer-retention-chart';
import { ProductPerformanceTable } from './product-performance-table';

interface Props {
  api: ApiClient;
  hasComplete: boolean;
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-8 w-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="h-4 w-40 bg-muted rounded animate-pulse mb-1" />
        <div className="h-3 w-56 bg-muted/60 rounded animate-pulse mb-4" />
        <div className={`${tall ? 'h-[300px]' : 'h-[260px]'} bg-muted/30 rounded-lg animate-pulse`} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonCard tall />
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function OrderAdvancedReportsSection({ api, hasComplete }: Props) {
  const [params, setParams] = useState<ReportParams>({ period: '30d' });
  const [loading, setLoading] = useState(true);

  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [trends, setTrends] = useState<OrderTrend[] | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursReport | null>(null);
  const [cancellations, setCancellations] = useState<OrderCancellationTrend[] | null>(null);
  const [retention, setRetention] = useState<CustomerRetention[] | null>(null);
  const [products, setProducts] = useState<ProductPerformance[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchAll = async () => {
      try {
        await Promise.allSettled([
          api.getOrderRevenue(params).then((d) => { if (!cancelled) setRevenue(d); }),
          api.getOrderTrends(params).then((d) => { if (!cancelled) setTrends(d); }),
          api.getOrderPeakHours(params).then((d) => { if (!cancelled) setPeakHours(d); }),
          api.getOrderCancellationTrends(params).then((d) => { if (!cancelled) setCancellations(d); }),
          api.getOrderCustomerRetention(params).then((d) => { if (!cancelled) setRetention(d); }),
          api.getProductPerformance(params).then((d) => { if (!cancelled) setProducts(d); }),
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [api, params, hasComplete]);

  return (
    <div className="space-y-8 mt-10">
      {/* Section divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">Reportes Avanzados</span>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </span>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/40 dark:bg-muted/20 rounded-xl p-4 border border-border/50">
        <div>
          <p className="text-sm font-medium">Per&iacute;odo de an&aacute;lisis</p>
          <p className="text-xs text-muted-foreground">Selecciona el rango de fechas para tus reportes</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangeSelector value={params} onChange={setParams} />
          <div className="h-6 w-px bg-border hidden sm:block" />
          <OrderExportCsvButton params={params} />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-8">
          {/* === VENTAS === */}
          <div className="space-y-4">
            <SectionHeader
              icon={TrendingUp}
              title="An&aacute;lisis de Ventas"
              description="Ingresos, tendencias y evoluci&oacute;n de tu negocio"
            />
            {revenue && <RevenueChart data={revenue} subtitle="Evoluci&oacute;n de ingresos por pedidos completados" />}
          </div>

          {/* === OPERACIONES === */}
          <div className="space-y-4">
            <SectionHeader
              icon={Activity}
              title="Operaciones"
              description="Flujo de pedidos, horarios y cancelaciones"
            />
            <div className="grid gap-6 md:grid-cols-2">
              {trends && <OrderTrendsChart data={trends} />}
              {cancellations && <OrderCancellationChart data={cancellations} />}
            </div>
            {peakHours && <PeakHoursHeatmap data={peakHours} subtitle="Distribuci&oacute;n de pedidos por d&iacute;a y hora" />}
            {retention && <CustomerRetentionChart data={retention} />}
          </div>

          {/* === PRODUCTOS === */}
          <div className="space-y-4">
            <SectionHeader
              icon={ShoppingBag}
              title="Cat&aacute;logo y Productos"
              description="Rendimiento detallado de cada producto"
            />
            {products && <ProductPerformanceTable data={products} />}
          </div>
        </div>
      )}
    </div>
  );
}
