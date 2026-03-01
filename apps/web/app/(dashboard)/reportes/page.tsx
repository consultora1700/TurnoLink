'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart3, Calendar } from 'lucide-react';
import { createApiClient } from '@/lib/api';
import type {
  ReportOverview,
  BookingsByStatus,
  BookingsByDay,
  TopService,
  TopCustomer,
} from '@/lib/api';
import { OverviewKpis } from '@/components/reports/overview-kpis';
import { BookingsByStatusChart } from '@/components/reports/bookings-by-status-chart';
import { BookingsByDayChart } from '@/components/reports/bookings-by-day-chart';
import { TopServicesList } from '@/components/reports/top-services-list';
import { TopCustomersList } from '@/components/reports/top-customers-list';
import { AdvancedReportsSection } from '@/components/reports/advanced-reports-section';
import { LockedReportPreview } from '@/components/reports/locked-report-preview';

type PlanLevel = 'gratis' | 'profesional' | 'negocio';

function getPlanLevel(features: string[]): PlanLevel {
  if (features.includes('complete_reports')) return 'negocio';
  if (features.includes('advanced_reports')) return 'profesional';
  return 'gratis';
}

const PLAN_LABELS: Record<PlanLevel, { label: string; color: string }> = {
  gratis: { label: 'Plan Gratis', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  profesional: { label: 'Plan Profesional', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  negocio: { label: 'Plan Negocio', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
};

function SkeletonPage() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted" />
        <div>
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted/60 rounded mt-1" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[300px] rounded-xl bg-muted" />
        <div className="h-[300px] rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function ReportesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [planLevel, setPlanLevel] = useState<PlanLevel>('gratis');

  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [byStatus, setByStatus] = useState<BookingsByStatus[] | null>(null);
  const [byDay, setByDay] = useState<BookingsByDay[] | null>(null);
  const [topServices, setTopServices] = useState<TopService[] | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[] | null>(null);

  const api = useMemo(
    () => (session?.accessToken ? createApiClient(session.accessToken as string) : null),
    [session?.accessToken],
  );

  useEffect(() => {
    if (!api) return;
    let cancelled = false;

    const load = async () => {
      // 1. Determine plan level (non-blocking — default to 'gratis' on error)
      try {
        const sub = await api.getSubscription();
        const features = (sub.plan as any).features || [];
        const parsedFeatures: string[] = typeof features === 'string' ? JSON.parse(features) : features;
        if (!cancelled) setPlanLevel(getPlanLevel(parsedFeatures));
      } catch {
        // No subscription or error — stay on 'gratis' level
      }

      // 2. Always load basic reports (regardless of subscription)
      try {
        const [ov, bs, bd, ts, tc] = await Promise.all([
          api.getReportOverview().catch(() => null),
          api.getBookingsByStatus().catch(() => null),
          api.getBookingsByDay().catch(() => null),
          api.getTopServices().catch(() => null),
          api.getTopCustomers().catch(() => null),
        ]);

        if (!cancelled) {
          setOverview(ov);
          setByStatus(bs);
          setByDay(bd);
          setTopServices(ts);
          setTopCustomers(tc);
        }
      } catch {
        // silently fail
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [api]);

  if (loading) {
    return <SkeletonPage />;
  }

  const hasAdvanced = planLevel === 'profesional' || planLevel === 'negocio';
  const hasComplete = planLevel === 'negocio';
  const hasBasicData = overview || byStatus || byDay || topServices || topCustomers;

  const currentMonth = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <p className="text-sm text-muted-foreground">
              {hasAdvanced
                ? 'Análisis completo de tu negocio'
                : 'Resumen del mes actual'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${PLAN_LABELS[planLevel].color}`}>
            {PLAN_LABELS[planLevel].label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {currentMonth}
          </span>
        </div>
      </div>

      {/* KPIs */}
      {overview && <OverviewKpis data={overview} />}

      {/* Basic charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {byStatus && <BookingsByStatusChart data={byStatus} />}
        {byDay && <BookingsByDayChart data={byDay} />}
      </div>

      {/* Top lists row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {topServices && <TopServicesList data={topServices} />}
        {topCustomers && <TopCustomersList data={topCustomers} />}
      </div>

      {/* Advanced reports OR upsell preview */}
      {hasAdvanced && api ? (
        <AdvancedReportsSection api={api} hasComplete={hasComplete} />
      ) : (
        <LockedReportPreview />
      )}

      {/* Empty state if absolutely no data */}
      {!hasBasicData && !hasAdvanced && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/50 mb-4">
            <BarChart3 className="h-8 w-8 opacity-40" />
          </div>
          <p className="font-medium">Aún no hay datos suficientes</p>
          <p className="text-sm mt-1 max-w-sm mx-auto">
            Los reportes se generan automáticamente a partir de tus reservas del mes actual.
          </p>
        </div>
      )}
    </div>
  );
}
