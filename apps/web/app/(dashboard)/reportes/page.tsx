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
  GastroSalonReport,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { isMercadoRubro, isGastronomiaRubro } from '@/lib/rubro-attributes';
import { UtensilsCrossed, DollarSign, Users, TrendingUp, Wallet, Clock, ChefHat, CreditCard, Star, ArrowUpRight } from 'lucide-react';

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
  const [gastroReport, setGastroReport] = useState<GastroSalonReport | null>(null);
  const [gastroPeriod, setGastroPeriod] = useState<string>('30d');

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
          // Gastro-specific: fetch salon report + basic stats
          const [gastroData, salonReport] = await Promise.all([
            api.getGastroTables().catch(() => null),
            api.getGastroSalonReport(gastroPeriod).catch(() => null),
          ]);

          if (!cancelled) {
            if (gastroData?.stats) setGastroStats(gastroData.stats);
            setGastroReport(salonReport);
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
  }, [api, gastroPeriod]);

  if (loading) {
    return <SkeletonPage />;
  }

  const hasAdvanced = planLevel === 'profesional' || planLevel === 'negocio';
  const hasComplete = planLevel === 'negocio';
  const hasBasicData = isGastro
    ? (gastroStats || gastroReport)
    : isMercado
    ? (orderOverview || ordersByStatus || ordersByDay || topProducts || topOrderCustomers)
    : (overview || byStatus || byDay || topServices || topCustomers);
  const currentMonth = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 sm:space-y-6 overflow-hidden">
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
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          {isGastro ? (
            <>
              {/* Period selector — segmented control */}
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="inline-flex gap-1 bg-slate-100 dark:bg-neutral-800/80 rounded-xl p-1">
                  {[
                    { value: '7d', label: '7d' },
                    { value: '30d', label: '30d' },
                    { value: 'month', label: 'Mes' },
                    { value: '90d', label: '90d' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGastroPeriod(opt.value)}
                      className={cn(
                        'whitespace-nowrap py-2 px-3 sm:px-4 rounded-lg text-sm font-medium transition-all',
                        gastroPeriod === opt.value
                          ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient KPI cards — matching finanzas style */}
              {gastroReport && (
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative group">
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Facturación</CardTitle>
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-xl sm:text-3xl font-bold tracking-tight truncate">${Math.round(gastroReport.kpis.totalRevenue).toLocaleString('es-AR')}</div>
                      <p className="text-[10px] sm:text-xs text-white/70 mt-1">{gastroReport.kpis.totalSessions} mesas</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative group">
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Propinas</CardTitle>
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-xl sm:text-3xl font-bold tracking-tight truncate">${Math.round(gastroReport.kpis.totalTips).toLocaleString('es-AR')}</div>
                      <p className="text-[10px] sm:text-xs text-white/70 mt-1">Prom. ${Math.round(gastroReport.kpis.avgTip).toLocaleString('es-AR')}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative group">
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Ticket prom.</CardTitle>
                      <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-xl sm:text-3xl font-bold tracking-tight truncate">${Math.round(gastroReport.kpis.avgTicket).toLocaleString('es-AR')}</div>
                      <p className="text-[10px] sm:text-xs text-white/70 mt-1">por mesa</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group">
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Cocina</CardTitle>
                      <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-xl sm:text-3xl font-bold tracking-tight truncate">
                        {gastroReport.kpis.avgKitchenMinutes != null ? `${gastroReport.kpis.avgKitchenMinutes} min` : '—'}
                      </div>
                      <p className="text-[10px] sm:text-xs text-white/70 mt-1">{gastroReport.kpis.totalComandasProcessed} comandas</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Daily revenue trend */}
              {gastroReport && gastroReport.dailyRevenue.length > 1 && (
                <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Facturación diaria</CardTitle>
                        <CardDescription className="text-xs">Consumo + propinas por día</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 overflow-hidden">
                    <div className="overflow-x-auto -mx-2 px-2 pb-2">
                      <div className="flex items-end gap-[3px] h-[180px] sm:h-[200px]" style={{ minWidth: gastroReport.dailyRevenue.length > 14 ? `${gastroReport.dailyRevenue.length * 24}px` : 'auto' }}>
                        {gastroReport.dailyRevenue.map((d, i) => {
                          const maxRev = Math.max(...gastroReport.dailyRevenue.map(x => x.revenue + x.tips));
                          const totalH = maxRev > 0 ? ((d.revenue + d.tips) / maxRev) * 100 : 0;
                          const tipH = maxRev > 0 ? (d.tips / maxRev) * 100 : 0;
                          const foodH = totalH - tipH;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar min-w-[14px]" title={`${d.date}: $${Math.round(d.revenue + d.tips).toLocaleString('es-AR')} (${d.sessions} mesas)`}>
                              <span className="text-[9px] font-medium text-muted-foreground opacity-0 group-hover/bar:opacity-100 transition-opacity tabular-nums whitespace-nowrap">
                                ${Math.round(d.revenue + d.tips).toLocaleString('es-AR')}
                              </span>
                              <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                                {tipH > 0 && (
                                  <div className="w-full bg-amber-400 dark:bg-amber-500 rounded-t transition-all group-hover/bar:bg-amber-500 dark:group-hover/bar:bg-amber-400" style={{ height: `${tipH}%`, minHeight: '2px' }} />
                                )}
                                <div className={cn('w-full bg-emerald-500/80 dark:bg-emerald-400/80 transition-all group-hover/bar:bg-emerald-500 dark:group-hover/bar:bg-emerald-400', tipH <= 0 && 'rounded-t')} style={{ height: `${foodH}%`, minHeight: totalH > 0 ? '2px' : '0' }} />
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                                {new Date(d.date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Consumo</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Propinas</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Top products — ranked list style */}
                {gastroReport && gastroReport.topProducts.length > 0 && (
                  <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                          <UtensilsCrossed className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <CardTitle className="text-base">Productos más vendidos</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {gastroReport.topProducts.slice(0, 10).map((p, i) => {
                          const maxRev = gastroReport.topProducts[0]?.revenue || 1;
                          const RANK_COLORS = [
                            'bg-amber-500 text-white',
                            'bg-slate-400 text-white',
                            'bg-amber-700 text-white',
                          ];
                          return (
                            <div key={i} className="group">
                              <div className="flex items-center justify-between mb-1.5 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={cn(
                                    'h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0',
                                    i < 3 ? RANK_COLORS[i] : 'bg-muted text-muted-foreground',
                                  )}>
                                    {i + 1}
                                  </span>
                                  <span className="text-sm font-medium truncate min-w-0">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">{p.quantity} uds</span>
                                  <span className="font-semibold text-xs tabular-nums">${Math.round(p.revenue).toLocaleString('es-AR')}</span>
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden ml-[30px]">
                                <div className="h-full bg-violet-500/80 rounded-full transition-all group-hover:bg-violet-500" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Per-waiter performance */}
                {gastroReport && gastroReport.byWaiter.length > 0 && (
                  <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-base">Rendimiento por mozo</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {gastroReport.byWaiter.map((w, i) => {
                          const maxRev = gastroReport.byWaiter[0]?.revenue || 1;
                          return (
                            <div key={i} className="group">
                              <div className="flex items-center justify-between mb-1.5 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                    {w.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-sm font-medium truncate block max-w-[100px] sm:max-w-none">{w.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{w.sessions} mesas</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 tabular-nums hidden sm:inline">+${Math.round(w.tips).toLocaleString('es-AR')}</span>
                                  <span className="font-semibold text-xs sm:text-sm tabular-nums">${Math.round(w.revenue).toLocaleString('es-AR')}</span>
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden ml-[30px]">
                                <div className="h-full bg-blue-500/80 rounded-full transition-all group-hover:bg-blue-500" style={{ width: `${(w.revenue / maxRev) * 100}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Payment method breakdown */}
                {gastroReport && gastroReport.byPaymentMethod.length > 0 && (
                  <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <CardTitle className="text-base">Medios de pago</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {(() => {
                          const totalRev = gastroReport.byPaymentMethod.reduce((s, x) => s + x.revenue, 0);
                          const PM_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-slate-400'];
                          const methodLabels: Record<string, string> = {
                            cash: 'Efectivo', card: 'Tarjeta', mercadopago: 'Mercado Pago', sin_registrar: 'Sin registrar',
                          };
                          return gastroReport.byPaymentMethod.map((pm, i) => {
                            const pct = totalRev > 0 ? Math.round((pm.revenue / totalRev) * 100) : 0;
                            return (
                              <div key={i} className="group">
                                <div className="flex items-center justify-between text-sm mb-1.5 gap-2">
                                  <span className="font-medium truncate min-w-0">{methodLabels[pm.method] || pm.method}</span>
                                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">{pm.count} ops</span>
                                    <span className="font-semibold text-xs tabular-nums">${Math.round(pm.revenue).toLocaleString('es-AR')}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium tabular-nums">{pct}%</span>
                                  </div>
                                </div>
                                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                  <div className={cn('h-full rounded-full transition-all', PM_COLORS[i % PM_COLORS.length])} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Peak hours */}
                {gastroReport && gastroReport.peakHours.some(h => h.orders > 0) && (
                  <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Horas pico</CardTitle>
                          <CardDescription className="text-xs">Pedidos por franja horaria</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 overflow-hidden">
                      <div className="overflow-x-auto -mx-2 px-2 pb-2">
                        <div className="flex items-end gap-[3px] h-[140px] sm:h-[160px]" style={{ minWidth: '280px' }}>
                          {gastroReport.peakHours.filter(h => h.hour >= 8 && h.hour <= 23).map((h) => {
                            const maxOrders = Math.max(...gastroReport.peakHours.map(x => x.orders));
                            const height = maxOrders > 0 ? (h.orders / maxOrders) * 100 : 0;
                            return (
                              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group/bar min-w-[16px]" title={`${h.hour}:00 — ${h.orders} pedidos`}>
                                <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground opacity-0 group-hover/bar:opacity-100 transition-opacity tabular-nums">
                                  {h.orders || ''}
                                </span>
                                <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                                  <div
                                    className={cn(
                                      'w-full rounded-t transition-all',
                                      h.orders > 0 ? 'bg-amber-500/80 group-hover/bar:bg-amber-500' : 'bg-muted/30',
                                    )}
                                    style={{ height: `${Math.max(height, h.orders > 0 ? 4 : 2)}%` }}
                                  />
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground tabular-nums">{h.hour}h</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Kitchen performance by station */}
              {gastroReport && gastroReport.kitchenByStation.length > 0 && (
                <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                        <ChefHat className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Rendimiento de cocina</CardTitle>
                        <CardDescription className="text-xs">Tiempo promedio por estación</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                      {gastroReport.kitchenByStation.map((s, i) => (
                        <div key={i} className="p-3 sm:p-4 rounded-lg border border-slate-200/60 dark:border-neutral-700/40 bg-slate-50/50 dark:bg-neutral-800/50">
                          <p className="text-xs sm:text-sm font-medium truncate">{s.station}</p>
                          <p className="text-xl sm:text-2xl font-bold tracking-tight mt-1">{s.avgMinutes} <span className="text-xs sm:text-sm font-medium text-muted-foreground">min</span></p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{s.comandaCount} comandas</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top tables */}
              {gastroReport && gastroReport.byTable.length > 0 && (
                <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <CardTitle className="text-base">Facturación por mesa</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                      {gastroReport.byTable.map((t, i) => (
                        <div key={i} className="p-2 sm:p-3 rounded-lg border border-slate-200/60 dark:border-neutral-700/40 bg-slate-50/50 dark:bg-neutral-800/50 text-center">
                          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Mesa {t.tableNumber}</p>
                          <p className="text-sm sm:text-lg font-bold tracking-tight mt-0.5">${Math.round(t.revenue).toLocaleString('es-AR')}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t.sessions} serv.</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent reviews */}
              {gastroStats?.recentReviews?.length > 0 && (
                <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                        <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <CardTitle className="text-base">Opiniones de comensales</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {gastroStats.recentReviews.map((r: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/60 dark:border-neutral-700/40 bg-slate-50/50 dark:bg-neutral-800/50">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {r.tableNumber}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Mesa {r.tableNumber}</p>
                            <p className="text-sm text-muted-foreground italic mt-0.5">&ldquo;{r.review}&rdquo;</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(r.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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

          {!isGastro && (
            hasAdvanced && api ? (
              isMercado
                ? <OrderAdvancedReportsSection api={api} hasComplete={hasComplete} />
                : <AdvancedReportsSection api={api} hasComplete={hasComplete} />
            ) : (
              <LockedReportPreview isMercado={isMercado} />
            )
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
