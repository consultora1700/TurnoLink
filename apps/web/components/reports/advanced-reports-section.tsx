'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Users2, Building2, Sparkles } from 'lucide-react';
import type { ApiClient, ReportParams, RevenueReport, BookingTrend, PeakHoursReport, CancellationTrend, CustomerRetention, EmployeePerformance, ServicePerformance, BranchComparison } from '@/lib/api';
import { DateRangeSelector } from './date-range-selector';
import { ExportCsvButton } from './export-csv-button';
import { RevenueChart } from './revenue-chart';
import { BookingTrendsChart } from './booking-trends-chart';
import { PeakHoursHeatmap } from './peak-hours-heatmap';
import { CancellationChart } from './cancellation-chart';
import { CustomerRetentionChart } from './customer-retention-chart';
import { EmployeePerformanceChart } from './employee-performance-chart';
import { ServicePerformanceTable } from './service-performance-table';
import { BranchComparisonChart } from './branch-comparison-chart';

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
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard />
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function AdvancedReportsSection({ api, hasComplete }: Props) {
  const [params, setParams] = useState<ReportParams>({ period: '30d' });
  const [loading, setLoading] = useState(true);

  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [trends, setTrends] = useState<BookingTrend[] | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursReport | null>(null);
  const [cancellations, setCancellations] = useState<CancellationTrend[] | null>(null);
  const [retention, setRetention] = useState<CustomerRetention[] | null>(null);
  const [employees, setEmployees] = useState<EmployeePerformance[] | null>(null);
  const [services, setServices] = useState<ServicePerformance[] | null>(null);
  const [branches, setBranches] = useState<BranchComparison[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchAll = async () => {
      try {
        const promises: Promise<void>[] = [
          api.getRevenue(params).then((d) => { if (!cancelled) setRevenue(d); }),
          api.getBookingTrends(params).then((d) => { if (!cancelled) setTrends(d); }),
          api.getPeakHours(params).then((d) => { if (!cancelled) setPeakHours(d); }),
          api.getCancellationTrends(params).then((d) => { if (!cancelled) setCancellations(d); }),
          api.getCustomerRetention(params).then((d) => { if (!cancelled) setRetention(d); }),
          api.getEmployeePerformance(params).then((d) => { if (!cancelled) setEmployees(d); }),
          api.getServicePerformance(params).then((d) => { if (!cancelled) setServices(d); }),
        ];

        if (hasComplete) {
          promises.push(
            api.getBranchComparison(params).then((d) => { if (!cancelled) setBranches(d); }),
          );
        }

        await Promise.allSettled(promises);
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
          <p className="text-sm font-medium">Periodo de análisis</p>
          <p className="text-xs text-muted-foreground">Selecciona el rango de fechas para tus reportes</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangeSelector value={params} onChange={setParams} />
          <div className="h-6 w-px bg-border hidden sm:block" />
          <ExportCsvButton params={params} />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-8">
          {/* === FINANCIAL SECTION === */}
          <div className="space-y-4">
            <SectionHeader
              icon={TrendingUp}
              title="Análisis Financiero"
              description="Ingresos, tendencias y métricas de negocio"
            />
            {revenue && <RevenueChart data={revenue} />}
          </div>

          {/* === OPERATIONS SECTION === */}
          <div className="space-y-4">
            <SectionHeader
              icon={Activity}
              title="Operaciones"
              description="Patrones de reservas, horarios y cancelaciones"
            />
            <div className="grid gap-6 lg:grid-cols-2">
              {trends && <BookingTrendsChart data={trends} />}
              {cancellations && <CancellationChart data={cancellations} />}
            </div>
            {peakHours && <PeakHoursHeatmap data={peakHours} />}
            {retention && <CustomerRetentionChart data={retention} />}
          </div>

          {/* === TEAM & SERVICES SECTION === */}
          <div className="space-y-4">
            <SectionHeader
              icon={Users2}
              title="Equipo y Servicios"
              description="Rendimiento individual de empleados y servicios"
            />
            <div className="grid gap-6 lg:grid-cols-2">
              {employees && <EmployeePerformanceChart data={employees} />}
              {services && <ServicePerformanceTable data={services} />}
            </div>
          </div>

          {/* === BRANCH COMPARISON (Complete plan only) === */}
          {hasComplete && branches && (
            <div className="space-y-4">
              <SectionHeader
                icon={Building2}
                title="Sucursales"
                description="Comparación de rendimiento entre tus ubicaciones"
              />
              <BranchComparisonChart data={branches} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
