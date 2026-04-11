'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  Calendar,
} from 'lucide-react';
import { createApiClient } from '@/lib/api';
import type {
  ReportOverview,
  BookingsByStatus,
  BookingsByDay,
  TopService,
  TopCustomer,
  OrderReportOverview,
  OrdersByStatus,
  TopProduct,
  TopOrderCustomer,
} from '@/lib/api';
import { OverviewKpis } from '@/components/reports/overview-kpis';
import { BookingsByStatusChart } from '@/components/reports/bookings-by-status-chart';
import { BookingsByDayChart } from '@/components/reports/bookings-by-day-chart';
import { TopServicesList } from '@/components/reports/top-services-list';
import { TopCustomersList } from '@/components/reports/top-customers-list';
import { OrderOverviewKpis } from '@/components/reports/order-overview-kpis';
import { OrdersByStatusChart } from '@/components/reports/orders-by-status-chart';
import { OrdersByDayChart } from '@/components/reports/orders-by-day-chart';
import { TopProductsList } from '@/components/reports/top-products-list';
import { TopOrderCustomersList } from '@/components/reports/top-order-customers-list';
import { AdvancedReportsSection } from '@/components/reports/advanced-reports-section';
import { OrderAdvancedReportsSection } from '@/components/reports/order-advanced-reports-section';
import { LockedReportPreview } from '@/components/reports/locked-report-preview';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { isMercadoRubro, isGastronomiaRubro } from '@/lib/rubro-attributes';
import { UtensilsCrossed, DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';

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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="h-[300px] rounded-xl bg-muted" />
        <div className="h-[300px] rounded-xl bg-muted" />
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============

export default function ReportesPage() {
  const { data: session } = useSession();
  const { rubro, storeType } = useTenantConfig();
  const terms = useRubroTerms();
  const isMercado = isMercadoRubro(rubro);
  const isGastro = isGastronomiaRubro(rubro);
  const [loading, setLoading] = useState(true);
  const [planLevel, setPlanLevel] = useState<PlanLevel>('gratis');
  // Booking-based state (non-mercado)
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [byStatus, setByStatus] = useState<BookingsByStatus[] | null>(null);
  const [byDay, setByDay] = useState<BookingsByDay[] | null>(null);
  const [topServices, setTopServices] = useState<TopService[] | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[] | null>(null);

  // Order-based state (mercado)
  const [orderOverview, setOrderOverview] = useState<OrderReportOverview | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[] | null>(null);
  const [ordersByDay, setOrdersByDay] = useState<BookingsByDay[] | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[] | null>(null);
  const [topOrderCustomers, setTopOrderCustomers] = useState<TopOrderCustomer[] | null>(null);

  // Gastro state
  const [gastroStats, setGastroStats] = useState<any>(null);

  const api = useMemo(
    () => (session?.accessToken ? createApiClient(session.accessToken as string) : null),
    [session?.accessToken],
  );

  useEffect(() => {
    if (!api) return;
    let cancelled = false;

    const load = async () => {
      try {
        const sub = await api.getSubscription();
        const features = (sub.plan as any).features || [];
        const parsedFeatures: string[] = typeof features === 'string' ? JSON.parse(features) : features;
        if (!cancelled) {
          setPlanLevel(getPlanLevel(parsedFeatures));
        }
      } catch (error) {
        handleApiError(error);
      }

      try {
        if (isGastro) {
          // Gastro-specific: fetch salon stats + booking data (reservas)
          const [gastroData, ov, bs, bd, ts, tc] = await Promise.all([
            api.getGastroTables().catch(() => null),
            api.getReportOverview().catch(() => null),
            api.getBookingsByStatus().catch(() => null),
            api.getBookingsByDay().catch(() => null),
            api.getTopServices().catch(() => null),
            api.getTopCustomers().catch(() => null),
          ]);

          if (!cancelled) {
            if (gastroData?.stats) setGastroStats(gastroData.stats);
            setOverview(ov);
            setByStatus(bs);
            setByDay(bd);
            setTopServices(ts);
            setTopCustomers(tc);
          }
        } else if (isMercado) {
          // Order-based reports for mercado/ecommerce
          const [ov, bs, bd, tp, tc] = await Promise.all([
            api.getOrderReportOverview().catch(() => null),
            api.getOrdersByStatus().catch(() => null),
            api.getOrdersByDay().catch(() => null),
            api.getTopProducts().catch(() => null),
            api.getTopOrderCustomers().catch(() => null),
          ]);

          if (!cancelled) {
            setOrderOverview(ov);
            setOrdersByStatus(bs);
            setOrdersByDay(bd);
            setTopProducts(tp);
            setTopOrderCustomers(tc);
          }
        } else {
          // Booking-based reports for other industries
          const [ov, bs, bd, ts, tc] = await Promise.all([
            api.getReportOverview().catch((error) => { handleApiError(error); return null; }),
            api.getBookingsByStatus().catch((error) => { handleApiError(error); return null; }),
            api.getBookingsByDay().catch((error) => { handleApiError(error); return null; }),
            api.getTopServices().catch((error) => { handleApiError(error); return null; }),
            api.getTopCustomers().catch((error) => { handleApiError(error); return null; }),
          ]);

          if (!cancelled) {
            setOverview(ov);
            setByStatus(bs);
            setByDay(bd);
            setTopServices(ts);
            setTopCustomers(tc);
          }
        }
      } catch (error) {
        handleApiError(error);
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
  const hasBasicData = isGastro
    ? (gastroStats || overview || byStatus || byDay || topServices || topCustomers)
    : isMercado
    ? (orderOverview || ordersByStatus || ordersByDay || topProducts || topOrderCustomers)
    : (overview || byStatus || byDay || topServices || topCustomers);
  const currentMonth = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Reportes</h1>
              <p className="text-white/80 text-sm sm:text-base">
                {hasAdvanced ? 'Análisis completo de tu negocio' : 'Resumen del mes actual'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/20 text-white">
              {PLAN_LABELS[planLevel].label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/20 text-white">
              <Calendar className="h-3 w-3" />
              {currentMonth}
            </span>
          </div>
        </div>
      </div>

      {/* Reports content */}
      <div className="space-y-6 animate-in fade-in duration-200">
          {isGastro ? (
            <>
              {/* Gastro Salon KPIs */}
              {gastroStats && (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <div className="bg-card rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${Math.round(gastroStats.todayRevenue).toLocaleString('es-AR')}</p>
                        <p className="text-xs text-muted-foreground">Recaudado hoy</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{gastroStats.todaySessionCount} mesas atendidas</p>
                  </div>
                  <div className="bg-card rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${Math.round(gastroStats.weekRevenue).toLocaleString('es-AR')}</p>
                        <p className="text-xs text-muted-foreground">Esta semana</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{gastroStats.weekSessionCount} mesas</p>
                  </div>
                  <div className="bg-card rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${Math.round(gastroStats.monthRevenue).toLocaleString('es-AR')}</p>
                        <p className="text-xs text-muted-foreground">Este mes</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{gastroStats.monthSessionCount} mesas</p>
                  </div>
                  <div className="bg-card rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <UtensilsCrossed className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {gastroStats.monthSessionCount > 0
                            ? `$${Math.round(gastroStats.monthRevenue / gastroStats.monthSessionCount).toLocaleString('es-AR')}`
                            : '$0'}
                        </p>
                        <p className="text-xs text-muted-foreground">Ticket promedio</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gastro recent reviews */}
              {gastroStats?.recentReviews?.length > 0 && (
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-500" />
                    Últimas opiniones de comensales
                  </h3>
                  <div className="space-y-3">
                    {gastroStats.recentReviews.map((r: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {r.tableNumber}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Mesa {r.tableNumber}</p>
                          <p className="text-sm text-muted-foreground italic">&ldquo;{r.review}&rdquo;</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(r.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Also show booking reports if they have reservas */}
              {overview && <OverviewKpis data={overview} />}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {byStatus && <BookingsByStatusChart data={byStatus} />}
                {byDay && <BookingsByDayChart data={byDay} />}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {topServices && <TopServicesList data={topServices} />}
                {topCustomers && <TopCustomersList data={topCustomers} />}
              </div>
            </>
          ) : isMercado ? (
            <>
              {orderOverview && <OrderOverviewKpis data={orderOverview} />}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {ordersByStatus && <OrdersByStatusChart data={ordersByStatus} />}
                {ordersByDay && <OrdersByDayChart data={ordersByDay} />}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {topProducts && <TopProductsList data={topProducts} />}
                {topOrderCustomers && <TopOrderCustomersList data={topOrderCustomers} />}
              </div>
            </>
          ) : (
            <>
              {overview && <OverviewKpis data={overview} />}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {byStatus && <BookingsByStatusChart data={byStatus} />}
                {byDay && <BookingsByDayChart data={byDay} />}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {topServices && <TopServicesList data={topServices} />}
                {topCustomers && <TopCustomersList data={topCustomers} />}
              </div>
            </>
          )}

          {hasAdvanced && api ? (
            isMercado
              ? <OrderAdvancedReportsSection api={api} hasComplete={hasComplete} />
              : <AdvancedReportsSection api={api} hasComplete={hasComplete} />
          ) : (
            <LockedReportPreview isMercado={isMercado} />
          )}

          {!hasBasicData && (isMercado || !hasAdvanced) && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/50 mb-4">
                <BarChart3 className="h-8 w-8 opacity-40" />
              </div>
              <p className="font-medium">A&uacute;n no hay datos suficientes</p>
              <p className="text-sm mt-1 max-w-sm mx-auto">
                Los reportes se generan autom&aacute;ticamente a partir de {isGastro ? 'la actividad de tu salón' : isMercado ? 'tus pedidos y ventas' : `tus ${terms.bookingPlural.toLowerCase()}`} del mes actual.
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
