'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet, Loader2, ChevronLeft, ChevronRight, CheckCircle2,
  Clock, FileText, ArrowLeft, DollarSign, Landmark, Receipt, Info, X,
} from 'lucide-react';

const MONTHS = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function LiquidacionesPage() {
  const { api } = useApi();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [hideGuide, setHideGuide] = useState(true);
  useEffect(() => { setHideGuide(!!localStorage.getItem('hide-guide-liquidaciones')); }, []);
  const [owners, setOwners] = useState<any[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [liquidations, setLiquidations] = useState<Record<string, any>>({});
  const [selectedLiq, setSelectedLiq] = useState<any>(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const ownersData = await api.getPropertyOwners();
      setOwners(ownersData);
      const liqMap: Record<string, any> = {};
      await Promise.all(ownersData.map(async (o: any) => {
        try {
          const liqs = await api.getOwnerLiquidations(o.id);
          const match = liqs.find((l: any) => l.periodMonth === month && l.periodYear === year);
          if (match) liqMap[o.id] = match;
        } catch {}
      }));
      setLiquidations(liqMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, month, year]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async (ownerId: string) => {
    if (!api) return;
    setGenerating(ownerId);
    try {
      const liq = await api.generateLiquidation({ ownerId, periodMonth: month, periodYear: year });
      setLiquidations(prev => ({ ...prev, [ownerId]: liq }));
    } catch (e) { console.error(e); }
    finally { setGenerating(null); }
  };

  const handleMarkPaid = async (liqId: string) => {
    if (!api) return;
    setMarkingPaid(true);
    try {
      await api.markLiquidationPaid(liqId);
      if (selectedLiq) {
        const updated = await api.getLiquidation(liqId);
        setSelectedLiq(updated);
      }
      loadData();
    } catch (e) { console.error(e); }
    finally { setMarkingPaid(false); }
  };

  const openDetail = async (liqId: string) => {
    if (!api) return;
    try {
      const liq = await api.getLiquidation(liqId);
      setSelectedLiq(liq);
    } catch (e) { console.error(e); }
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
    paid: { label: 'Pagada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  };

  // Detail view
  if (selectedLiq) {
    const liq = selectedLiq;
    const st = STATUS_MAP[liq.status] || STATUS_MAP.draft;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-neutral-700" onClick={() => setSelectedLiq(null)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold dark:text-white">Liquidación - {liq.owner?.name}</h1>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">{MONTHS[liq.periodMonth]} {liq.periodYear}</p>
          </div>
          <Badge className={st.color}>{st.label}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 dark:from-emerald-900/20 dark:to-emerald-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Cobrado bruto</p>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(liq.grossCollected))}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/5 to-amber-600/5 dark:from-amber-900/20 dark:to-amber-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/5 dark:bg-amber-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-1">
                <Landmark className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Comisión</p>
              </div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">- {formatCurrency(Number(liq.commissionAmount))}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-500/5 to-red-600/5 dark:from-red-900/20 dark:to-red-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-red-500/5 dark:bg-red-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-4 w-4 text-red-500 dark:text-red-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Gastos deducidos</p>
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">- {formatCurrency(Number(liq.expensesAmount))}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-600/5 dark:from-blue-900/20 dark:to-blue-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-500/5 dark:bg-blue-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Neto a pagar</p>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(Number(liq.netToPay))}</p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses detail */}
        {liq.expenses?.length > 0 && (
          <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-neutral-700/30 dark:border-neutral-700">
              <CardTitle className="text-base dark:text-white">Gastos deducidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-neutral-700">
                {liq.expenses.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
                    <Receipt className="h-4 w-4 text-muted-foreground dark:text-neutral-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white">{e.description || e.expenseType}</p>
                      <p className="text-xs text-muted-foreground dark:text-neutral-500">{e.property?.name || 'General'}</p>
                    </div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(Number(e.amount))}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {liq.status !== 'paid' && (
          <div className="flex justify-end">
            <Button onClick={() => handleMarkPaid(liq.id)} disabled={markingPaid}>
              {markingPaid ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
              Marcar como pagada
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Liquidaciones</h1>
          <p className="text-muted-foreground dark:text-neutral-400 text-sm mt-1">Liquidaciones mensuales a propietarios</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 rounded-xl p-1">
          <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 transition-colors" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
          </button>
          <span className="text-sm font-medium min-w-[130px] text-center dark:text-white">{MONTHS[month]} {year}</span>
          <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 transition-colors" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Info Guide */}
      {hideGuide ? (
        <button onClick={() => { localStorage.removeItem('hide-guide-liquidaciones'); setHideGuide(false); }} className="flex items-center gap-1.5 text-[11px] text-blue-500/70 dark:text-blue-400/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Info className="h-3 w-3" /> Ver guía de uso
        </button>
      ) : (
        <div className="relative rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/20 p-4 sm:p-5 shadow-sm">
          <button onClick={() => { localStorage.setItem('hide-guide-liquidaciones', '1'); setHideGuide(true); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors">
            <X className="h-3.5 w-3.5 text-blue-400" />
          </button>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 h-fit shrink-0">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1.5 text-xs text-blue-800/80 dark:text-blue-200/80">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Liquidaciones mensuales</p>
              <p>Seleccioná el mes y hacé click en <strong>"Generar"</strong> para cada propietario. El sistema calcula: cobros del mes - tu comisión - gastos deducibles = <strong>neto a pagar</strong>.</p>
              <p>Una vez transferido, marcá la liquidación como <strong>"Pagada"</strong> para llevar el registro.</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted dark:bg-neutral-700" />)}</div>
      ) : owners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-violet-500/50 dark:text-violet-400/50" />
          </div>
          <p className="font-medium text-muted-foreground dark:text-neutral-400">No hay propietarios para liquidar</p>
          <p className="text-sm text-muted-foreground/70 dark:text-neutral-500 mt-1">Creá propietarios con propiedades y contratos activos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {owners.map(o => {
            const liq = liquidations[o.id];
            const st = liq ? (STATUS_MAP[liq.status] || STATUS_MAP.draft) : null;
            return (
              <Card key={o.id} className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 dark:from-violet-900/30 dark:to-violet-900/20 shrink-0">
                      <Landmark className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold dark:text-white">{o.name}</p>
                      <p className="text-xs text-muted-foreground dark:text-neutral-500">{o.properties?.length || 0} propiedad{(o.properties?.length || 0) !== 1 ? 'es' : ''}</p>
                    </div>
                    {liq ? (
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold dark:text-white">{formatCurrency(Number(liq.netToPay))}</p>
                          <p className="text-xs text-muted-foreground dark:text-neutral-500">neto</p>
                        </div>
                        <Badge className={st!.color}>{st!.label}</Badge>
                        <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => openDetail(liq.id)}>Ver</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" disabled={generating === o.id} onClick={() => handleGenerate(o.id)}>
                        {generating === o.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <DollarSign className="h-4 w-4 mr-1" />}
                        Generar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
