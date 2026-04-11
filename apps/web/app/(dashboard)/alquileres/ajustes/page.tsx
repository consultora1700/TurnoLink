'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, Calendar, Clock, AlertTriangle, CheckCircle2, ArrowUpRight,
  Building2, User, DollarSign, Info,
} from 'lucide-react';

const INDEX_LABELS: Record<string, string> = {
  ICL: 'ICL (Índice de Contratos de Locación)',
  IPC: 'IPC (Índice de Precios al Consumidor)',
  custom: 'Índice personalizado',
};

function formatCurrency(n: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AjustesPage() {
  const { api } = useApi();
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const data = await api.getUpcomingAdjustments();
      setAdjustments(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { loadData(); }, [loadData]);

  const overdue = adjustments.filter(a => a.daysUntilAdjustment <= 0);
  const upcoming30 = adjustments.filter(a => a.daysUntilAdjustment > 0 && a.daysUntilAdjustment <= 30);
  const future = adjustments.filter(a => a.daysUntilAdjustment > 30);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-xl bg-muted" />
      <div className="grid gap-4 grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted" />)}</div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Ajustes de Contratos</h1>
            <p className="text-sm text-white/70">
              {adjustments.length} contrato{adjustments.length !== 1 ? 's' : ''} con ajuste automático
              {overdue.length > 0 && ` · ${overdue.length} pendiente${overdue.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Info card */}
      <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Ajuste automático activado</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              El sistema revisa diariamente (7 AM) los contratos activos. Cuando llega la fecha de ajuste,
              calcula el nuevo monto según el índice pactado (ICL, IPC o personalizado), actualiza el alquiler
              y envía notificación por email al inquilino.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card className={overdue.length > 0 ? 'border-red-300 dark:border-red-900/30' : ''}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${overdue.length > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
              <AlertTriangle className={`h-4 w-4 ${overdue.length > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdue.length}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcoming30.length}</p>
              <p className="text-xs text-muted-foreground">Próximos 30 días</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{future.length}</p>
              <p className="text-xs text-muted-foreground">Futuros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue section */}
      {overdue.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Ajustes pendientes (el cron los procesará automáticamente)
          </h3>
          <div className="space-y-2">
            {overdue.map(a => <AdjustmentCard key={a.contractId} adj={a} variant="overdue" />)}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming30.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Próximos 30 días
          </h3>
          <div className="space-y-2">
            {upcoming30.map(a => <AdjustmentCard key={a.contractId} adj={a} variant="upcoming" />)}
          </div>
        </div>
      )}

      {/* Future */}
      {future.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Próximos ajustes
          </h3>
          <div className="space-y-2">
            {future.map(a => <AdjustmentCard key={a.contractId} adj={a} variant="future" />)}
          </div>
        </div>
      )}

      {adjustments.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay contratos con ajuste automático configurado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Configurá el índice de ajuste (ICL, IPC) al crear o editar un contrato
          </p>
        </div>
      )}
    </div>
  );
}

function AdjustmentCard({ adj, variant }: { adj: any; variant: 'overdue' | 'upcoming' | 'future' }) {
  const borderColor = variant === 'overdue' ? 'border-l-red-500' : variant === 'upcoming' ? 'border-l-amber-500' : 'border-l-slate-300 dark:border-l-slate-600';
  const days = adj.daysUntilAdjustment;
  const daysLabel = days <= 0
    ? `Vencido hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`
    : days === 1 ? 'Mañana' : `En ${days} días`;

  return (
    <Card className={`border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-sm">{adj.property}</span>
              {adj.contractNumber && (
                <span className="text-xs text-muted-foreground">#{adj.contractNumber}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <User className="h-3 w-3" /> {adj.tenant}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs">Alquiler actual:</span>
                <span className="font-bold">{formatCurrency(adj.currentRent, adj.currency)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs">Índice:</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {adj.adjustmentIndex}
                </Badge>
                <span className="text-xs text-muted-foreground">cada {adj.frequency} meses</span>
              </div>
            </div>
            {adj.lastAdjustmentDate && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Último ajuste: {formatDate(adj.lastAdjustmentDate)}
              </p>
            )}
          </div>
          <div className="text-right ml-4">
            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              variant === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              variant === 'upcoming' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {daysLabel}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{formatDate(adj.nextAdjustmentDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
