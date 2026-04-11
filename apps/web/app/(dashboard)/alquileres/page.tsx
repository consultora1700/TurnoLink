'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Users, FileText, Wallet, AlertTriangle, ArrowRight,
  CheckCircle2, Clock, DollarSign, KeyRound, Landmark, Receipt,
  ChevronLeft, ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight,
  TrendingUp, Calendar, Info, X,
} from 'lucide-react';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function AlquileresSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-[100px] rounded-xl sm:rounded-2xl bg-muted" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-[130px] rounded-xl bg-muted" />)}
      </div>
      <div className="h-[350px] rounded-xl bg-muted" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-[56px] rounded-xl bg-muted" />)}
      </div>
    </div>
  );
}

export default function AlquileresPage() {
  const router = useRouter();
  const { api } = useApi();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [hideGuide, setHideGuide] = useState(true);
  useEffect(() => { setHideGuide(!!localStorage.getItem('hide-guide-alquileres')); }, []);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        api.getRentalStats(),
        api.getRentalPaymentDashboard(year, month),
      ]);
      setStats(s);
      setDashboard(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, month, year]);

  useEffect(() => { loadData(); }, [loadData]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  if (loading) return <AlquileresSkeleton />;

  const payments = dashboard?.payments || [];
  const summary = dashboard?.summary || {};
  const collectionRate = summary.collectionRate || 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-teal-600 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="absolute -top-24 -right-24 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-28 sm:w-36 h-28 sm:h-36 bg-white/10 rounded-full blur-xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium text-white/80">Gestión inmobiliaria</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Alquileres</h1>
            <p className="mt-1 text-white/80 text-sm sm:text-base">Propiedades, contratos, cobros y liquidaciones</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm" onClick={() => router.push('/alquileres/propietarios')}>
              <Landmark className="h-4 w-4 mr-1.5" /> Propietarios
            </Button>
            <Button size="sm" className="bg-white text-primary hover:bg-white/90 shadow-sm" onClick={() => router.push('/alquileres/contratos')}>
              <FileText className="h-4 w-4 mr-1.5" /> Contratos
            </Button>
          </div>
        </div>
      </div>

      {/* Info Guide */}
      {hideGuide ? (
        <button onClick={() => { localStorage.removeItem('hide-guide-alquileres'); setHideGuide(false); }} className="flex items-center gap-1.5 text-[11px] text-blue-500/70 dark:text-blue-400/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Info className="h-3 w-3" /> Ver guía de uso
        </button>
      ) : (
        <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/20 shadow-sm relative">
          <button onClick={() => { localStorage.setItem('hide-guide-alquileres', '1'); setHideGuide(true); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors">
            <X className="h-3.5 w-3.5 text-blue-400" />
          </button>
          <CardContent className="p-4 sm:p-5">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 h-fit shrink-0">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold">Como usar la gestión de alquileres</p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-blue-800/80 dark:text-blue-200/80">
                  <p><strong>1.</strong> Cargá <strong>Propietarios</strong> con sus datos bancarios (CBU/alias) para liquidarles.</p>
                  <p><strong>2.</strong> Subí las <strong>Propiedades</strong> desde Catálogo — se vinculan al propietario.</p>
                  <p><strong>3.</strong> Registrá <strong>Inquilinos</strong> con DNI, contacto e ingreso mensual.</p>
                  <p><strong>4.</strong> Creá un <strong>Contrato</strong> vinculando propiedad + inquilino + monto + ajuste ICL/IPC.</p>
                  <p><strong>5.</strong> Los <strong>cobros mensuales</strong> se generan automáticamente — marcalos como pagados acá.</p>
                  <p><strong>6.</strong> Registrá <strong>Gastos</strong> (expensas, luz, agua) y asignalos al propietario o inquilino.</p>
                  <p><strong>7.</strong> Generá la <strong>Liquidación</strong> mensual: cobra - comisión - gastos = neto a pagar.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all" onClick={() => router.push('/alquileres/propietarios')}>
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Propietarios</CardTitle>
            <Landmark className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.owners || 0}</div>
            <p className="text-xs text-white/70 mt-1">activos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all" onClick={() => router.push('/catalogo')}>
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Propiedades</CardTitle>
            <Building2 className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.properties || 0}</div>
            <p className="text-xs text-white/70 mt-1">en cartera</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all" onClick={() => router.push('/alquileres/contratos')}>
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Contratos</CardTitle>
            <FileText className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeContracts || 0}</div>
            <p className="text-xs text-white/70 mt-1">activos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden relative cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all" onClick={() => router.push('/alquileres/inquilinos')}>
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Inquilinos</CardTitle>
            <Users className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.tenants || 0}</div>
            <p className="text-xs text-white/70 mt-1">registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats?.expiringContracts > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {stats.expiringContracts} contrato{stats.expiringContracts > 1 ? 's' : ''} vence{stats.expiringContracts > 1 ? 'n' : ''} en los próximos 60 días
              </p>
              <p className="text-xs text-amber-700/70 dark:text-amber-300/70 mt-0.5">Revisá los contratos por vencer para renovar o gestionar la desocupación</p>
            </div>
            <Button variant="outline" size="sm" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 shrink-0" onClick={() => router.push('/alquileres/contratos')}>
              Ver contratos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Monthly Collection */}
      <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-neutral-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg">Cobranzas del Mes</CardTitle>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 rounded-xl p-1">
              <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 transition-colors" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm font-medium min-w-[120px] text-center">{MONTHS[month - 1]} {year}</span>
              <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 transition-colors" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Cobrado</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(summary.totalCollected || 0)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700">
              <p className="text-xs text-muted-foreground font-medium">Esperado</p>
              <p className="text-lg sm:text-xl font-bold">{formatCurrency(summary.totalExpected || 0)}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Tasa cobro</p>
              <p className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300">{collectionRate.toFixed(0)}%</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">Pendientes</p>
              <p className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-300">{summary.pending || 0}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  collectionRate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                  collectionRate >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                  'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-end gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {summary.paid || 0} pagados</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> {summary.partial || 0} parciales</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> {summary.pending || 0} pendientes</span>
            </div>
          </div>

          {/* Payment list */}
          {payments.length > 0 ? (
            <div className="divide-y rounded-xl border dark:border-neutral-700 overflow-hidden max-h-[400px] overflow-y-auto">
              {payments.map((p: any) => {
                const isPaid = p.status === 'paid';
                const isPartial = p.status === 'partial';
                const coverage = Number(p.coveragePercent || 0);
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors group">
                    <div className={`p-2 rounded-xl shrink-0 ${isPaid ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : isPartial ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                      {isPaid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{p.contract?.property?.name || 'Propiedad'}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.contract?.rentalTenant?.name || 'Inquilino'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(Number(p.expectedAmount))}</p>
                      <Badge className={`text-[10px] border-0 ${isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : isPartial ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                        {isPaid ? 'Cobrado' : isPartial ? `${coverage.toFixed(0)}%` : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No hay cobros para este período</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Creá contratos para generar cobros automáticos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Gastos', href: '/alquileres/gastos', icon: Receipt, gradient: 'from-red-500/10 to-red-600/10 dark:from-red-900/20 dark:to-red-900/10', iconColor: 'text-red-500 dark:text-red-400' },
          { label: 'Liquidaciones', href: '/alquileres/liquidaciones', icon: Wallet, gradient: 'from-violet-500/10 to-violet-600/10 dark:from-violet-900/20 dark:to-violet-900/10', iconColor: 'text-violet-500 dark:text-violet-400' },
          { label: 'Inquilinos', href: '/alquileres/inquilinos', icon: Users, gradient: 'from-blue-500/10 to-blue-600/10 dark:from-blue-900/20 dark:to-blue-900/10', iconColor: 'text-blue-500 dark:text-blue-400' },
          { label: 'Propietarios', href: '/alquileres/propietarios', icon: Landmark, gradient: 'from-emerald-500/10 to-emerald-600/10 dark:from-emerald-900/20 dark:to-emerald-900/10', iconColor: 'text-emerald-500 dark:text-emerald-400' },
        ].map(link => (
          <Card
            key={link.href}
            className="group border shadow-sm hover:shadow-md bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
            onClick={() => router.push(link.href)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${link.gradient}`}>
                <link.icon className={`h-4 w-4 ${link.iconColor}`} />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{link.label}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
