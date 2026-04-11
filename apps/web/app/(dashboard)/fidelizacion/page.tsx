'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Star, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight,
  Settings, Save, Loader2, Search, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowUp, ArrowDown, Settings2,
  Trophy, Plus, Pencil, Trash2, Gift, Ticket, Send, Tag,
  CalendarDays, Play, AlertTriangle, Calculator, Info,
} from 'lucide-react';
import Link from 'next/link';
import { PrizeEditor } from '@/components/loyalty/prize-editor';
import { PrizeWheel } from '@/components/loyalty/prize-wheel';
import { SorteoWinnerModal } from '@/components/loyalty/sorteo-winner-modal';
import { usePlanFeatures } from '@/lib/hooks/use-plan-features';
import { UpgradeWall } from '@/components/dashboard/upgrade-wall';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { bookingGender, type RubroTerms } from '@/lib/tenant-config';

// ──────────────────────────────────────────────
// Reward types
// ──────────────────────────────────────────────
const REWARD_TYPES = [
  { value: 'PERCENTAGE_DISCOUNT', label: '% Descuento' },
  { value: 'FIXED_DISCOUNT', label: '$ Descuento fijo' },
  { value: 'FREE_SERVICE', label: 'Servicio gratis' },
  { value: 'FREE_PRODUCT', label: 'Producto gratis' },
];
const rewardTypeLabel = (type: string) => REWARD_TYPES.find(t => t.value === type)?.label || type;

const sorteoStatusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  COMPLETED: { label: 'Completado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const redemptionStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  ACTIVE: { label: 'Activo', variant: 'default' },
  USED: { label: 'Usado', variant: 'secondary' },
  EXPIRED: { label: 'Expirado', variant: 'destructive' },
};

export default function FidelizacionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { hasFeature, planTier, isLoaded } = usePlanFeatures();
  const canAccess = hasFeature('loyalty_program') || hasFeature('advanced_reports') || hasFeature('complete_reports');
  const { clientLabelSingular, clientLabelPlural } = useTenantConfig();
  const terms = useRubroTerms();
  const gender = bookingGender(terms);
  const [tab, setTab] = useState('programa');
  const [clientesSub, setClientesSub] = useState<'saldos' | 'canjes' | 'ajustar'>('saldos');

  // ── Programa / Metrics ──
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // ── Config ──
  const [program, setProgram] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configForm, setConfigForm] = useState({
    isActive: false, programName: 'Programa de Puntos',
    pointsPerBooking: 10, pointsPerCurrencyUnit: '' as string | number, currencyPerPoint: 1,
  });

  // ── Clientes ──
  const [balances, setBalances] = useState<any>(null);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesSearch, setBalancesSearch] = useState('');
  const [balancesPage, setBalancesPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  // ── Tiers ──
  const [tiers, setTiers] = useState<any[]>([]);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [tierDialog, setTierDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [tierSaving, setTierSaving] = useState(false);
  const [tierForm, setTierForm] = useState({ name: '', minPoints: 0, color: '#CD7F32', icon: '', benefitDescription: '', pointsMultiplier: 1 });

  // ── Rewards ──
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardDialog, setRewardDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [rewardSaving, setRewardSaving] = useState(false);
  const [rewardForm, setRewardForm] = useState({
    name: '', description: '', pointsCost: 100, rewardType: 'PERCENTAGE_DISCOUNT',
    discountValue: 10, maxRedemptions: '' as string | number, isActive: true, minTierSlug: '',
  });

  // ── Canjes ──
  const [redemptions, setRedemptions] = useState<any>(null);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionsPage, setRedemptionsPage] = useState(1);

  // ── Ajuste manual ──
  const [adjustSearch, setAdjustSearch] = useState('');
  const [adjustCustomers, setAdjustCustomers] = useState<any[]>([]);
  const [adjustSearching, setAdjustSearching] = useState(false);
  const [adjustSelected, setAdjustSelected] = useState<any>(null);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustDesc, setAdjustDesc] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // ── Sorteos ──
  const [sorteos, setSorteos] = useState<any[]>([]);
  const [sorteosLoading, setSorteosLoading] = useState(false);

  // ── API helper ──
  const api = session?.accessToken ? createApiClient(session.accessToken as string) : null;

  // ──────────────────────────────────────────────
  // Load data per tab
  // ──────────────────────────────────────────────
  const loadMetrics = useCallback(async () => {
    if (!api) return;
    setMetricsLoading(true);
    try { setMetrics(await api.get('/loyalty/metrics')); } catch {}
    setMetricsLoading(false);
  }, [session?.accessToken]);

  const loadConfig = useCallback(async () => {
    if (!api) return;
    setConfigLoading(true);
    try {
      const p = await api.get('/loyalty/program');
      if (p) {
        setProgram(p);
        setConfigForm({
          isActive: (p as any).isActive, programName: (p as any).programName,
          pointsPerBooking: (p as any).pointsPerBooking,
          pointsPerCurrencyUnit: (p as any).pointsPerCurrencyUnit || '',
          currencyPerPoint: Number((p as any).currencyPerPoint) || 1,
        });
      }
    } catch {}
    setConfigLoading(false);
  }, [session?.accessToken]);

  const loadBalances = useCallback(async () => {
    if (!api) return;
    setBalancesLoading(true);
    try {
      const params = new URLSearchParams({ page: String(balancesPage), limit: '20' });
      if (balancesSearch) params.set('search', balancesSearch);
      setBalances(await api.get(`/loyalty/balances?${params}`));
    } catch {}
    setBalancesLoading(false);
  }, [session?.accessToken, balancesPage, balancesSearch]);

  const loadCustomerDetail = useCallback(async (id: string) => {
    if (!api) return;
    setCustomerLoading(true);
    try { setCustomerDetail(await api.get(`/loyalty/balances/${id}`)); } catch {}
    setCustomerLoading(false);
  }, [session?.accessToken]);

  const loadTiers = useCallback(async () => {
    if (!api) return;
    setTiersLoading(true);
    try { const d = await api.get('/loyalty/tiers'); setTiers(Array.isArray(d) ? d : []); } catch {}
    setTiersLoading(false);
  }, [session?.accessToken]);

  const loadRewards = useCallback(async () => {
    if (!api) return;
    setRewardsLoading(true);
    try {
      const [r, t] = await Promise.all([api.get('/loyalty/rewards'), api.get('/loyalty/tiers')]);
      setRewards(Array.isArray(r) ? r : []);
      setTiers(Array.isArray(t) ? t : []);
    } catch {}
    setRewardsLoading(false);
  }, [session?.accessToken]);

  const loadRedemptions = useCallback(async () => {
    if (!api) return;
    setRedemptionsLoading(true);
    try {
      setRedemptions(await api.get(`/loyalty/redemptions?page=${redemptionsPage}&limit=20`));
    } catch {}
    setRedemptionsLoading(false);
  }, [session?.accessToken, redemptionsPage]);

  const loadSorteos = useCallback(async () => {
    if (!api) return;
    setSorteosLoading(true);
    try { const d = await api.get('/loyalty/sorteos'); setSorteos(Array.isArray(d) ? d : (d as any)?.data || []); } catch {}
    setSorteosLoading(false);
  }, [session?.accessToken]);

  // Load on tab change
  useEffect(() => {
    if (!session?.accessToken) return;
    if (tab === 'programa') loadMetrics();
    else if (tab === 'config') { loadConfig(); loadRewards(); loadTiers(); }
    else if (tab === 'clientes') { loadBalances(); loadRedemptions(); }
    else if (tab === 'recompensas') loadRewards();
    else if (tab === 'sorteos') loadSorteos();
  }, [tab, session?.accessToken]);

  // Clientes search debounce
  useEffect(() => { setBalancesPage(1); }, [balancesSearch]);
  useEffect(() => { if (tab === 'clientes') loadBalances(); }, [balancesPage, balancesSearch]);

  // Redemptions page
  useEffect(() => { if (tab === 'canjes') loadRedemptions(); }, [redemptionsPage]);

  // Adjust search debounce
  useEffect(() => {
    if (!api || !adjustSearch || adjustSearch.length < 2) { setAdjustCustomers([]); return; }
    const t = setTimeout(async () => {
      setAdjustSearching(true);
      try {
        const d = await api.get(`/customers?search=${encodeURIComponent(adjustSearch)}&limit=10`);
        setAdjustCustomers(Array.isArray(d) ? d : (d as any)?.data || []);
      } catch {}
      setAdjustSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [adjustSearch, session?.accessToken]);

  // ── Loading state (avoid flash of UpgradeWall) ──
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  // ── Access gate (after all hooks) ──
  if (planTier === 'free' || (!canAccess && planTier !== null)) {
    return (
      <UpgradeWall
        title="Programa de Fidelización"
        description={`Creá un programa de puntos, niveles y sorteos para fidelizar a tus ${clientLabelPlural.toLowerCase()}. Disponible en planes superiores.`}
        planName="Profesional"
        previewLabels={['Clientes activos', 'Puntos otorgados', 'Canjes realizados', 'Tasa de retención']}
      />
    );
  }

  // ──────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────
  const saveConfig = async () => {
    if (!api) return;
    setConfigSaving(true);
    try {
      const data: any = {
        isActive: configForm.isActive, programName: configForm.programName,
        pointsPerBooking: Number(configForm.pointsPerBooking),
        currencyPerPoint: Number(configForm.currencyPerPoint),
        pointsPerCurrencyUnit: configForm.pointsPerCurrencyUnit ? Number(configForm.pointsPerCurrencyUnit) : null,
      };
      if (program) await api.patch('/loyalty/program', data);
      else await api.post('/loyalty/program', data);
      setProgram({ ...program, ...data });
      toast({ title: 'Configuracion guardada' });
    } catch { toast({ title: 'Error al guardar', variant: 'destructive' }); }
    setConfigSaving(false);
  };

  const saveTier = async () => {
    if (!api) return;
    setTierSaving(true);
    try {
      const data = { ...tierForm, minPoints: Number(tierForm.minPoints), pointsMultiplier: Number(tierForm.pointsMultiplier) };
      if (editingTier) await api.patch(`/loyalty/tiers/${editingTier.id}`, data);
      else await api.post('/loyalty/tiers', data);
      toast({ title: editingTier ? 'Nivel actualizado' : 'Nivel creado' });
      setTierDialog(false);
      loadTiers();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    setTierSaving(false);
  };

  const deleteTier = async (id: string) => {
    if (!api || !confirm('¿Eliminar este nivel?')) return;
    try { await api.delete(`/loyalty/tiers/${id}`); toast({ title: 'Nivel eliminado' }); loadTiers(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const saveReward = async () => {
    if (!api) return;
    setRewardSaving(true);
    try {
      const data: any = {
        name: rewardForm.name, description: rewardForm.description || null,
        pointsCost: Number(rewardForm.pointsCost), rewardType: rewardForm.rewardType,
        discountValue: Number(rewardForm.discountValue),
        maxRedemptions: rewardForm.maxRedemptions ? Number(rewardForm.maxRedemptions) : null,
        isActive: rewardForm.isActive, minTierSlug: rewardForm.minTierSlug || null,
      };
      if (editingReward) await api.patch(`/loyalty/rewards/${editingReward.id}`, data);
      else await api.post('/loyalty/rewards', data);
      toast({ title: editingReward ? 'Recompensa actualizada' : 'Recompensa creada' });
      setRewardDialog(false);
      loadRewards();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    setRewardSaving(false);
  };

  const deleteReward = async (id: string) => {
    if (!api || !confirm('¿Eliminar esta recompensa?')) return;
    try { await api.delete(`/loyalty/rewards/${id}`); toast({ title: 'Recompensa eliminada' }); loadRewards(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const submitAdjust = async () => {
    if (!api || !adjustSelected || !adjustPoints || !adjustDesc) return;
    setAdjustSubmitting(true);
    try {
      await api.post('/loyalty/points/adjust', { customerId: adjustSelected.id, points: Number(adjustPoints), description: adjustDesc });
      toast({ title: 'Puntos ajustados correctamente' });
      setAdjustSelected(null); setAdjustPoints(0); setAdjustDesc(''); setAdjustSearch('');
    } catch { toast({ title: 'Error al ajustar puntos', variant: 'destructive' }); }
    setAdjustSubmitting(false);
  };

  // ── Switch toggle helper ──
  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-200 dark:bg-neutral-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  // Customer detail sub-view
  if (selectedCustomer) {
    const d = customerDetail;
    const typeIcon = (type: string) => {
      if (type === 'EARN') return <ArrowUp className="h-4 w-4 text-green-600" />;
      if (type === 'REDEEM') return <ArrowDown className="h-4 w-4 text-red-600" />;
      return <Settings2 className="h-4 w-4 text-amber-600" />;
    };
    const typeLabel = (type: string) => type === 'EARN' ? 'Ganado' : type === 'REDEEM' ? 'Canjeado' : 'Ajuste';

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedCustomer(null); setCustomerDetail(null); }} className="p-2 rounded-md hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold">Detalle de puntos</h2>
        </div>
        {customerLoading ? <div className="h-48 animate-pulse bg-muted rounded-lg" /> : !d ? <p className="text-muted-foreground">No se encontro el cliente</p> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Saldo actual</p><p className="text-2xl font-bold flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> {d.balance?.currentBalance ?? 0}</p></CardContent></Card>
              <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Total ganado</p><p className="text-xl font-bold text-green-600">{d.balance?.totalEarned ?? 0}</p></CardContent></Card>
              <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Total canjeado</p><p className="text-xl font-bold text-red-600">{d.balance?.totalRedeemed ?? 0}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-sm">Historial</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b bg-muted/30">
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Descripcion</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Puntos</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                    </tr></thead>
                    <tbody>
                      {!d.transactions?.length ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sin transacciones</td></tr> : d.transactions.map((tx: any) => (
                        <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2"><div className="flex items-center gap-1.5">{typeIcon(tx.type)}<span className="text-sm">{typeLabel(tx.type)}</span></div></td>
                          <td className="px-3 py-2 text-sm">{tx.description}</td>
                          <td className={`px-3 py-2 text-sm text-right font-medium ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.points > 0 ? '+' : ''}{tx.points}</td>
                          <td className="px-3 py-2 text-sm text-right text-muted-foreground hidden sm:table-cell">{new Date(tx.createdAt).toLocaleDateString('es-AR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  const monthChange = metrics?.lastMonthPoints > 0
    ? ((metrics.thisMonthPoints - metrics.lastMonthPoints) / metrics.lastMonthPoints * 100).toFixed(0) : null;

  return (
    <div className="space-y-6">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3 mb-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Fidelizacion</h1>
            <p className="text-white/70 text-sm hidden md:block">Puntos, niveles, recompensas y sorteos para tus {clientLabelPlural.toLowerCase()}</p>
          </div>
        </div>
        {metrics && !metricsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm">
              <p className="text-[11px] sm:text-xs text-white/60">Puntos en circulacion</p>
              <p className="text-lg sm:text-xl font-bold">{(metrics.circulatingPoints ?? 0).toLocaleString('es-AR')}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm">
              <p className="text-[11px] sm:text-xs text-white/60">Valor monetario</p>
              <p className="text-lg sm:text-xl font-bold">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(metrics.monetaryValue ?? 0)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm">
              <p className="text-[11px] sm:text-xs text-white/60">{clientLabelPlural} activos</p>
              <p className="text-lg sm:text-xl font-bold">{metrics.activeCustomers ?? 0}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm">
              <p className="text-[11px] sm:text-xs text-white/60">Puntos este mes</p>
              <p className="text-lg sm:text-xl font-bold">{(metrics.thisMonthPoints ?? 0).toLocaleString('es-AR')}</p>
              {monthChange && (
                <div className={`flex items-center gap-0.5 text-[10px] ${Number(monthChange) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {Number(monthChange) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(Number(monthChange))}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Smart Banner: "Empezar por acá" — contextual según estado ── */}
      {(() => {
        // Determine next step based on current state
        if (!program && !configLoading) {
          return (
            <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">Paso 1: Configurá tu programa de puntos</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Definí cuántos puntos ganan tus {clientLabelPlural.toLowerCase()} por cada {terms.bookingSingular.toLowerCase()} o compra. Es lo primero para arrancar.</p>
                    <button onClick={() => setTab('config')} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
                      <Settings className="h-3.5 w-3.5" /> Ir a Configuración
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (program && rewards.length === 0 && !rewardsLoading) {
          return (
            <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">Paso 2: Creá tu primera recompensa</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Tus {clientLabelPlural.toLowerCase()} ya acumulan puntos. Ahora definí en qué pueden canjearlos: descuentos, {terms.servicePlural.toLowerCase()} gratis, productos.</p>
                    <button onClick={() => setTab('recompensas')} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                      <Gift className="h-3.5 w-3.5" /> Crear recompensa
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (program && rewards.length > 0 && sorteos.length === 0 && !sorteosLoading) {
          return (
            <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">Paso 3: Lanzá tu primer sorteo</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Los sorteos son el motor de marketing: tus {clientLabelPlural.toLowerCase()} los comparten, hacen lives, y atraen nuevos {clientLabelPlural.toLowerCase()}.</p>
                    <Link href="/fidelizacion/sorteos/nuevo" className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline">
                      <Trophy className="h-3.5 w-3.5" /> Crear sorteo
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        return null;
      })()}

      {/* ── Navigation — 5 tabs lógicos ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="w-full rounded-xl bg-muted/50 border border-border/40 p-1">
          <TabsList className="grid w-full h-auto p-0 bg-transparent gap-0.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {([
              { value: 'programa', icon: TrendingUp, label: 'Resumen', desc: 'Vista general' },
              { value: 'recompensas', icon: Gift, label: 'Premios', desc: 'Premios canjeables' },
              { value: 'clientes', icon: Users, label: clientLabelPlural, desc: 'Puntos y canjes' },
              { value: 'sorteos', icon: Star, label: 'Sorteos', desc: 'Ruleta y marketing' },
              { value: 'config', icon: Settings, label: 'Config', desc: 'Reglas del programa' },
            ] as const).map(({ value, icon: Icon, label, desc }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 sm:px-2 py-2 text-[10px] sm:text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground/70"
              >
                <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                <span className="leading-none truncate max-w-full">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ═══════════ PROGRAMA / RESUMEN ═══════════ */}
        <TabsContent value="programa" className="space-y-6 mt-4">
          {metricsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>)}
            </div>
          ) : !metrics ? (
            /* ── No program configured yet ── */
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <CardContent className="py-12 sm:py-16 text-center px-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-2">Activá tu programa de fidelización</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-2">
                  Recompensá a tus {clientLabelPlural.toLowerCase()} frecuentes con puntos por cada {terms.bookingSingular.toLowerCase()} o compra. Acumulan, canjean premios, y vuelven.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  <button onClick={() => setTab('config')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm">
                    <Settings className="h-4 w-4" /> Configurar programa
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 text-left max-w-lg mx-auto">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <span className="text-lg">1</span>
                    <div><p className="text-xs font-medium">Configurá las reglas</p><p className="text-[11px] text-muted-foreground">Cuántos puntos por {terms.bookingSingular.toLowerCase()} o compra</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <span className="text-lg">2</span>
                    <div><p className="text-xs font-medium">Creá premios</p><p className="text-[11px] text-muted-foreground">Descuentos, {terms.servicePlural.toLowerCase()} gratis, etc.</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <span className="text-lg">3</span>
                    <div><p className="text-xs font-medium">Lanzá sorteos</p><p className="text-[11px] text-muted-foreground">Marketing viral con ruleta</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ── KPI Cards — siempre visibles ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Puntos en circulación', value: (metrics.circulatingPoints ?? 0).toLocaleString('es-AR'), icon: Star, gradient: 'from-violet-500 to-fuchsia-500', iconBg: 'from-violet-500/15 to-fuchsia-500/15' },
                  { label: `${clientLabelPlural} activos`, value: String(metrics.activeCustomers ?? 0), icon: Users, gradient: 'from-blue-500 to-cyan-500', iconBg: 'from-blue-500/15 to-cyan-500/15' },
                  { label: 'Canjes realizados', value: String(metrics.totalRedemptions ?? 0), icon: Gift, gradient: 'from-emerald-500 to-teal-500', iconBg: 'from-emerald-500/15 to-teal-500/15' },
                  { label: 'Valor monetario', value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(metrics.monetaryValue ?? 0), icon: DollarSign, gradient: 'from-amber-500 to-orange-500', iconBg: 'from-amber-500/15 to-orange-500/15' },
                ].map(({ label, value, icon: Icon, gradient, iconBg }) => (
                  <Card key={label} className="border-0 shadow-sm overflow-hidden">
                    <div className={`h-0.5 bg-gradient-to-r ${gradient}`} />
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center`}>
                          <Icon className="h-3.5 w-3.5 text-foreground/70" />
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{label}</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ── Estado del programa ── */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" /> Estado del programa
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Recompensas */}
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${rewards.length > 0 ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30' : 'bg-amber-50/50 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30'}`}>
                      <Gift className={`h-5 w-5 mt-0.5 flex-shrink-0 ${rewards.length > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                      <div>
                        <p className="text-sm font-medium">{rewards.length > 0 ? `${rewards.length} recompensa${rewards.length > 1 ? 's' : ''} activa${rewards.length > 1 ? 's' : ''}` : 'Sin recompensas'}</p>
                        {rewards.length === 0 ? (
                          <button onClick={() => setTab('recompensas')} className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-0.5">Crear primera recompensa →</button>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">Tus {clientLabelPlural.toLowerCase()} pueden canjear puntos</p>
                        )}
                      </div>
                    </div>

                    {/* Sorteos */}
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${sorteos.length > 0 ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30' : 'bg-amber-50/50 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30'}`}>
                      <Trophy className={`h-5 w-5 mt-0.5 flex-shrink-0 ${sorteos.length > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                      <div>
                        <p className="text-sm font-medium">{sorteos.length > 0 ? `${sorteos.length} sorteo${sorteos.length > 1 ? 's' : ''}` : 'Sin sorteos'}</p>
                        {sorteos.length === 0 ? (
                          <button onClick={() => setTab('sorteos')} className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-0.5">Lanzar primer sorteo →</button>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">Marketing viral activo</p>
                        )}
                      </div>
                    </div>

                    {/* Niveles */}
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${tiers.length > 0 ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30' : 'bg-muted/50 border-border/50'}`}>
                      <TrendingUp className={`h-5 w-5 mt-0.5 flex-shrink-0 ${tiers.length > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="text-sm font-medium">{tiers.length > 0 ? `${tiers.length} nivel${tiers.length > 1 ? 'es' : ''}` : 'Sin niveles (opcional)'}</p>
                        {tiers.length === 0 ? (
                          <button onClick={() => setTab('config')} className="text-xs text-muted-foreground hover:underline mt-0.5">Configurar niveles →</button>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">{clientLabelPlural} suben de categoría</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Puntos este mes vs anterior ── */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-sm font-semibold mb-3">Actividad de puntos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Este mes</p>
                      <p className="text-2xl font-bold">{(metrics.thisMonthPoints ?? 0).toLocaleString('es-AR')}</p>
                      <p className="text-xs text-muted-foreground">puntos otorgados</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Mes anterior</p>
                      <p className="text-2xl font-bold text-muted-foreground">{(metrics.lastMonthPoints ?? 0).toLocaleString('es-AR')}</p>
                      {monthChange && (
                        <div className={`flex items-center gap-0.5 text-xs ${Number(monthChange) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {Number(monthChange) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(Number(monthChange))}% vs mes anterior
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Top clientes ── */}
              {metrics.topCustomers?.length > 0 && (
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className="h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"><Trophy className="h-3.5 w-3.5 text-white" /></div>
                      Top {clientLabelPlural.toLowerCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {metrics.topCustomers.map((item: any, i: number) => (
                        <div key={item.customer?.id || i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium">{item.customer?.name}</p>
                              <p className="text-xs text-muted-foreground">{item.customer?.phone}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{item.currentBalance} pts</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* ═══════════ CLIENTES (incluye saldos, canjes y ajuste manual) ═══════════ */}
        <TabsContent value="clientes" className="space-y-4 mt-4">
          {/* Sub-navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: 'saldos', icon: Users, label: 'Saldos' },
              { key: 'canjes', icon: Ticket, label: 'Canjes' },
              { key: 'ajustar', icon: ArrowUp, label: 'Ajustar puntos' },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setClientesSub(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  clientesSub === key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Sub: Saldos */}
          {clientesSub === 'saldos' && (<>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, telefono o email..." value={balancesSearch} onChange={e => setBalancesSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
          </div>
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-3 md:px-4 py-2.5 text-xs font-medium text-muted-foreground">{clientLabelSingular}</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Teléfono</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Ganados</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Canjeados</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Saldo</th>
              </tr></thead>
              <tbody>
                {balancesLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : !balances?.data?.length ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay {clientLabelPlural.toLowerCase()} con puntos</td></tr>
                ) : balances.data.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => { setSelectedCustomer(item.customer); loadCustomerDetail(item.customer.id); }}>
                    <td className="px-3 md:px-4 py-2.5">
                      <p className="text-sm font-medium">{item.customer?.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{item.customer?.phone}</p>
                    </td>
                    <td className="px-3 py-2.5 text-sm hidden sm:table-cell">{item.customer?.phone}</td>
                    <td className="px-3 py-2.5 text-sm text-right">{item.totalEarned}</td>
                    <td className="px-3 py-2.5 text-sm text-right">{item.totalRedeemed}</td>
                    <td className="px-3 py-2.5 text-right"><Badge variant={item.currentBalance > 0 ? 'default' : 'secondary'}>{item.currentBalance}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {balances?.meta && balances.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pagina {balances.meta.page} de {balances.meta.totalPages}</p>
              <div className="flex gap-2">
                <button disabled={balancesPage <= 1} onClick={() => setBalancesPage(p => p - 1)} className="p-2 rounded-md border disabled:opacity-50 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
                <button disabled={balancesPage >= balances.meta.totalPages} onClick={() => setBalancesPage(p => p + 1)} className="p-2 rounded-md border disabled:opacity-50 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
          </>)}

          {/* Sub: Canjes */}
          {clientesSub === 'canjes' && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{clientLabelSingular}</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Recompensa</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Puntos</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Codigo</th>
                <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground">Estado</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
              </tr></thead>
              <tbody>
                {redemptionsLoading ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Cargando...</td></tr>
                : !redemptions?.data?.length ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2"><Ticket className="h-6 w-6" /></div>Todavía no hay canjes. Cuando tus {clientLabelPlural.toLowerCase()} canjeen puntos por premios, aparecerán acá.
                  </td></tr>
                : redemptions.data.map((item: any) => {
                    const st = redemptionStatusConfig[item.status] || { label: item.status, variant: 'secondary' as const };
                    return (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2.5"><p className="text-sm font-medium">{item.customer?.name || '-'}</p><p className="text-xs text-muted-foreground sm:hidden">{item.reward?.name}</p></td>
                        <td className="px-3 py-2.5 text-sm hidden sm:table-cell">{item.reward?.name || '-'}</td>
                        <td className="px-3 py-2.5 text-sm text-right font-medium">{item.pointsSpent}</td>
                        <td className="px-3 py-2.5 text-sm hidden md:table-cell"><code className="px-1.5 py-0.5 rounded bg-muted text-xs">{item.couponCode}</code></td>
                        <td className="px-3 py-2.5 text-center"><Badge variant={st.variant}>{st.label}</Badge></td>
                        <td className="px-3 py-2.5 text-sm text-right text-muted-foreground hidden sm:table-cell">{new Date(item.createdAt).toLocaleDateString('es-AR')}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          )}

          {/* Sub: Ajustar puntos */}
          {clientesSub === 'ajustar' && (
          <Card className="max-w-xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Send className="h-4 w-4" /> Ajustar puntos de un {clientLabelSingular.toLowerCase()}</CardTitle>
              <CardDescription>Sumá o restá puntos manualmente. Usá valores negativos para restar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!adjustSelected ? (
                <div className="space-y-2">
                  <Label>Buscar cliente</Label>
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Nombre, telefono o email..." value={adjustSearch} onChange={e => setAdjustSearch(e.target.value)} className="pl-9 rounded-xl" /></div>
                  {adjustSearching && <p className="text-sm text-muted-foreground">Buscando...</p>}
                  {adjustCustomers.length > 0 && (
                    <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                      {adjustCustomers.map((c: any) => (
                        <button key={c.id} onClick={() => { setAdjustSelected(c); setAdjustSearch(''); setAdjustCustomers([]); }}
                          className="w-full text-left p-3 hover:bg-muted transition-colors">
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone} {c.email ? `· ${c.email}` : ''}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{adjustSelected.name}</p><p className="text-xs text-muted-foreground">{adjustSelected.phone}</p></div></div>
                    <button onClick={() => setAdjustSelected(null)} className="text-xs text-primary hover:underline">Cambiar</button>
                  </div>
                  <div className="space-y-2"><Label>Puntos</Label><Input type="number" value={adjustPoints} onChange={e => setAdjustPoints(Number(e.target.value))} placeholder="Ej: 50 o -20" /><p className="text-xs text-muted-foreground">Negativos para restar</p></div>
                  <div className="space-y-2"><Label>Motivo</Label><Input value={adjustDesc} onChange={e => setAdjustDesc(e.target.value)} placeholder="Ej: Bonificación por inconveniente" /></div>
                  <button onClick={submitAdjust} disabled={adjustSubmitting || !adjustPoints || !adjustDesc}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {adjustSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{adjustPoints >= 0 ? 'Sumar puntos' : 'Restar puntos'}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* ═══════════ RECOMPENSAS ═══════════ */}
        <TabsContent value="recompensas" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingReward(null); setRewardForm({ name: '', description: '', pointsCost: 100, rewardType: 'PERCENTAGE_DISCOUNT', discountValue: 10, maxRedemptions: '', isActive: true, minTierSlug: '' }); setRewardDialog(true); }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nueva recompensa
            </button>
          </div>
          {rewardsLoading ? <div className="h-32 animate-pulse bg-muted rounded-lg" /> : rewards.length === 0 ? (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="py-12 text-center px-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20"><Gift className="h-7 w-7 text-white" /></div>
                <h3 className="font-semibold mb-1">Creá tu primera recompensa</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">Definí qué pueden canjear tus {clientLabelPlural.toLowerCase()} con sus puntos: un descuento, {gender.articleUn} {terms.serviceSingular.toLowerCase()} gratis, un producto. Vos elegís.</p>
                <button onClick={() => { setEditingReward(null); setRewardForm({ name: '', description: '', pointsCost: 100, rewardType: 'PERCENTAGE_DISCOUNT', discountValue: 10, maxRedemptions: '', isActive: true, minTierSlug: '' }); setRewardDialog(true); }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" /> Crear recompensa
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewards.map(reward => (
                <Card key={reward.id} className={`border-0 shadow-sm ${!reward.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div><p className="font-medium">{reward.name}</p>{reward.description && <p className="text-sm text-muted-foreground mt-0.5">{reward.description}</p>}</div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditingReward(reward); setRewardForm({ name: reward.name, description: reward.description || '', pointsCost: reward.pointsCost, rewardType: reward.rewardType, discountValue: Number(reward.discountValue) || 0, maxRedemptions: reward.maxRedemptions ? String(reward.maxRedemptions) : '', isActive: reward.isActive, minTierSlug: reward.minTierSlug || '' }); setRewardDialog(true); }} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteReward(reward.id)} className="p-1.5 rounded-md hover:bg-muted text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="flex items-center gap-1"><Star className="h-3 w-3" /> {reward.pointsCost} pts</Badge>
                      <Badge variant="outline">{rewardTypeLabel(reward.rewardType)}</Badge>
                      <Badge variant={reward.isActive ? 'default' : 'secondary'}>{reward.isActive ? 'Activa' : 'Inactiva'}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={rewardDialog} onOpenChange={setRewardDialog}>
            <DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingReward ? 'Editar recompensa' : 'Nueva recompensa'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={rewardForm.name} onChange={e => setRewardForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: 10% de descuento" /></div>
                <div className="space-y-2"><Label>Descripcion</Label><Input value={rewardForm.description} onChange={e => setRewardForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Costo en puntos</Label><Input type="number" min={1} value={rewardForm.pointsCost} onChange={e => setRewardForm(f => ({ ...f, pointsCost: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>Tipo</Label>
                  <Select value={rewardForm.rewardType} onValueChange={v => setRewardForm(f => ({ ...f, rewardType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{REWARD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Valor descuento</Label><Input type="number" min={0} step={0.01} value={rewardForm.discountValue} onChange={e => setRewardForm(f => ({ ...f, discountValue: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>Max. canjes</Label><Input type="number" min={0} value={rewardForm.maxRedemptions} onChange={e => setRewardForm(f => ({ ...f, maxRedemptions: e.target.value }))} placeholder="Sin limite" /></div>
                {tiers.length > 0 && (
                  <div className="space-y-2"><Label>Nivel minimo</Label>
                    <Select value={rewardForm.minTierSlug} onValueChange={v => setRewardForm(f => ({ ...f, minTierSlug: v }))}>
                      <SelectTrigger><SelectValue placeholder="Sin restriccion" /></SelectTrigger>
                      <SelectContent><SelectItem value="">Sin restriccion</SelectItem>{tiers.map((t: any) => <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center justify-between"><Label>Activa</Label><Toggle value={rewardForm.isActive} onChange={v => setRewardForm(f => ({ ...f, isActive: v }))} /></div>
                <button onClick={saveReward} disabled={rewardSaving || !rewardForm.name} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {rewardSaving && <Loader2 className="h-4 w-4 animate-spin" />}{editingReward ? 'Guardar' : 'Crear recompensa'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════ SORTEOS ═══════════ */}
        <TabsContent value="sorteos" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Link href="/fidelizacion/sorteos/nuevo" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nuevo sorteo
            </Link>
          </div>
          {sorteosLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">{[1,2].map(i => <div key={i} className="h-40 animate-pulse bg-muted rounded-lg" />)}</div>
          ) : sorteos.length === 0 ? (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <CardContent className="py-12 text-center px-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20"><Trophy className="h-7 w-7 text-white" /></div>
                <h3 className="font-semibold mb-1">Lanzá tu primer sorteo</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">Los sorteos son tu herramienta de marketing más potente. Tus {clientLabelPlural.toLowerCase()} participan, comparten en redes, hacen lives y atraen nuevos {clientLabelPlural.toLowerCase()} a tu negocio.</p>
                <Link href="/fidelizacion/sorteos/nuevo" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" /> Crear sorteo
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sorteos.map(sorteo => {
                const st = sorteoStatusConfig[sorteo.status] || { label: sorteo.status, color: 'bg-gray-100 text-gray-800' };
                let prizes: any[] = [];
                try { prizes = JSON.parse(sorteo.prizes || '[]'); } catch {}
                return (
                  <Link key={sorteo.id} href={`/fidelizacion/sorteos/${sorteo.id}`}>
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0"><h3 className="font-semibold text-base truncate">{sorteo.title}</h3>{sorteo.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{sorteo.description}</p>}</div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${st.color}`}>{st.label}</span>
                        </div>
                        {prizes.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {prizes.slice(0, 3).map((p: any, i: number) => <Badge key={i} variant="outline" className="text-xs">{p.name}</Badge>)}
                            {prizes.length > 3 && <Badge variant="outline" className="text-xs">+{prizes.length - 3}</Badge>}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{sorteo._count?.participants ?? 0}</span>
                          {sorteo.drawDate && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(sorteo.drawDate).toLocaleDateString('es-AR')}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══════════ CONFIG (incluye niveles) ═══════════ */}
        <TabsContent value="config" className="mt-4 space-y-6">
          {configLoading ? <div className="h-64 animate-pulse bg-muted rounded-lg" /> : (
            <ConfigTab
              configForm={configForm}
              setConfigForm={setConfigForm}
              configSaving={configSaving}
              saveConfig={saveConfig}
              rewards={rewards}
              terms={terms}
              clientLabelSingular={clientLabelSingular}
              clientLabelPlural={clientLabelPlural}
            />
          )}

          {/* Niveles — dentro de config */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"><Trophy className="h-4 w-4 text-white" /></div>
                <div>
                  <h3 className="font-semibold text-sm">Niveles de {clientLabelPlural.toLowerCase()}</h3>
                  <p className="text-xs text-muted-foreground">Bronce, Plata, Oro... Motivá a acumular más puntos</p>
                </div>
              </div>
              <button onClick={() => { setEditingTier(null); setTierForm({ name: '', minPoints: 0, color: '#CD7F32', icon: '', benefitDescription: '', pointsMultiplier: 1 }); setTierDialog(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" /> Nuevo nivel
              </button>
            </div>
            {tiersLoading ? <div className="h-20 animate-pulse bg-muted rounded-lg" /> : tiers.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                No hay niveles. Los niveles son opcionales — tus {clientLabelPlural.toLowerCase()} igual acumulan puntos sin ellos.
              </div>
            ) : (
              <div className="grid gap-3">
                {tiers.map(tier => (
                  <Card key={tier.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm" style={{ backgroundColor: tier.color }}>
                          {tier.icon || tier.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{tier.name}</p>
                          <p className="text-sm text-muted-foreground">{tier.minPoints} pts minimo · x{Number(tier.pointsMultiplier)} puntos</p>
                          {tier.benefitDescription && <p className="text-xs text-muted-foreground mt-0.5">{tier.benefitDescription}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingTier(tier); setTierForm({ name: tier.name, minPoints: tier.minPoints, color: tier.color, icon: tier.icon || '', benefitDescription: tier.benefitDescription || '', pointsMultiplier: Number(tier.pointsMultiplier) || 1 }); setTierDialog(true); }}
                          className="p-2 rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => deleteTier(tier.id)} className="p-2 rounded-md hover:bg-muted text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Tier Dialog */}
          <Dialog open={tierDialog} onOpenChange={setTierDialog}>
            <DialogContent><DialogHeader><DialogTitle>{editingTier ? 'Editar nivel' : 'Nuevo nivel'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={tierForm.name} onChange={e => setTierForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Bronce, Plata, Oro" /></div>
                <div className="space-y-2"><Label>Puntos minimos</Label><Input type="number" min={0} value={tierForm.minPoints} onChange={e => setTierForm(f => ({ ...f, minPoints: Number(e.target.value) }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Color</Label><div className="flex gap-2"><input type="color" value={tierForm.color} onChange={e => setTierForm(f => ({ ...f, color: e.target.value }))} className="h-9 w-12 rounded border cursor-pointer" /><Input value={tierForm.color} onChange={e => setTierForm(f => ({ ...f, color: e.target.value }))} className="flex-1" /></div></div>
                  <div className="space-y-2"><Label>Icono (emoji)</Label><Input value={tierForm.icon} onChange={e => setTierForm(f => ({ ...f, icon: e.target.value }))} placeholder="Ej: medalla" /></div>
                </div>
                <div className="space-y-2"><Label>Multiplicador de puntos</Label><Input type="number" min={1} step={0.1} value={tierForm.pointsMultiplier} onChange={e => setTierForm(f => ({ ...f, pointsMultiplier: Number(e.target.value) }))} /><p className="text-xs text-muted-foreground">1.5 = 50% más puntos por {terms.bookingSingular.toLowerCase()}</p></div>
                <div className="space-y-2"><Label>Beneficio</Label><Input value={tierForm.benefitDescription} onChange={e => setTierForm(f => ({ ...f, benefitDescription: e.target.value }))} placeholder="Acceso a descuentos exclusivos" /></div>
                <button onClick={saveTier} disabled={tierSaving || !tierForm.name} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {tierSaving && <Loader2 className="h-4 w-4 animate-spin" />}{editingTier ? 'Guardar' : 'Crear nivel'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════
// Config Tab with Simulator
// ══════════════════════════════════════════════
function ConfigTab({
  configForm, setConfigForm, configSaving, saveConfig, rewards, terms, clientLabelSingular, clientLabelPlural,
}: {
  configForm: any;
  setConfigForm: (fn: (f: any) => any) => void;
  configSaving: boolean;
  saveConfig: () => void;
  rewards: any[];
  terms: RubroTerms;
  clientLabelSingular: string;
  clientLabelPlural: string;
}) {
  const bookingLower = terms.bookingSingular.toLowerCase();
  const serviceLower = terms.serviceSingular.toLowerCase();
  const gender = bookingGender(terms);
  // Service gender (may differ from booking gender)
  const svcFem = serviceLower.endsWith('a') || serviceLower.endsWith('ón') || serviceLower === 'clase' || serviceLower === 'sesión';
  const svcPrep = svcFem ? 'de la' : 'del';
  const [simServicePriceStr, setSimServicePriceStr] = useState('5000');
  const simServicePrice = Number(simServicePriceStr) || 0;

  const ppu = Number(configForm.pointsPerCurrencyUnit) || 0;
  const ppb = Number(configForm.pointsPerBooking) || 0;
  const cpp = Number(configForm.currencyPerPoint) || 0;

  // Calculate what a client earns per service
  const usesAmount = ppu > 0;
  const pointsEarned = usesAmount ? Math.floor(simServicePrice * ppu) : ppb;
  const moneyValue = pointsEarned * cpp;
  const cashbackPct = simServicePrice > 0 ? (moneyValue / simServicePrice) * 100 : 0;

  const cashbackLevel =
    cashbackPct > 15 ? 'danger' :
    cashbackPct > 10 ? 'warning' :
    cashbackPct > 5 ? 'caution' : 'ok';

  const cashbackColors: Record<string, string> = {
    ok: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/40',
    caution: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
    warning: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40',
    danger: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40',
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-200 dark:bg-neutral-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
      {/* Left: Config form */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Programa de puntos</CardTitle>
          <CardDescription>Configurá cómo tus {clientLabelPlural.toLowerCase()} acumulan y usan puntos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Programa activo</Label>
            <Toggle value={configForm.isActive} onChange={v => setConfigForm(f => ({ ...f, isActive: v }))} />
          </div>
          <div className="space-y-2">
            <Label>Nombre del programa</Label>
            <Input value={configForm.programName} onChange={e => setConfigForm(f => ({ ...f, programName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Puntos por {bookingLower} completado</Label>
            <Input type="number" min={1} value={configForm.pointsPerBooking} onChange={e => setConfigForm(f => ({ ...f, pointsPerBooking: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground">Se usa cuando no se configura puntos por monto</p>
          </div>
          <div className="space-y-2">
            <Label>Puntos por $1 gastado</Label>
            <Input type="number" min={0} step={0.01} value={configForm.pointsPerCurrencyUnit} onChange={e => setConfigForm(f => ({ ...f, pointsPerCurrencyUnit: e.target.value }))} placeholder={`Vacío = puntos fijos por ${bookingLower}`} />
            <p className="text-xs text-muted-foreground">Si se completa, los puntos se calculan según el precio {svcPrep} {serviceLower}</p>
          </div>
          <div className="space-y-2">
            <Label>Valor de 1 punto en $</Label>
            <Input type="number" min={0.0001} step={0.01} value={configForm.currencyPerPoint} onChange={e => setConfigForm(f => ({ ...f, currencyPerPoint: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground">Cuanto vale cada punto al canjearlo (en pesos)</p>
          </div>

          {/* Effective cashback alert */}
          {ppu > 0 && cpp > 0 && (
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${cashbackColors[cashbackLevel]}`}>
              {cashbackLevel === 'danger' || cashbackLevel === 'warning' ? (
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  Cashback efectivo: {cashbackPct.toFixed(1)}%
                </p>
                <p className="text-xs mt-0.5 opacity-80">
                  {cashbackLevel === 'danger' && 'Esto es insostenible. Vas a perder plata. Recomendado: 3-5%'}
                  {cashbackLevel === 'warning' && 'Muy alto. Revisalo antes de activar. Recomendado: 3-5%'}
                  {cashbackLevel === 'caution' && 'Un poco alto pero viable si tus margenes lo permiten'}
                  {cashbackLevel === 'ok' && 'Rango saludable para un programa de fidelizacion'}
                </p>
                <p className="text-[10px] mt-1 opacity-60">
                  Formula: puntos_por_peso x valor_punto = {ppu} x ${cpp} = {(ppu * cpp * 100).toFixed(1)}% devolucion
                </p>
              </div>
            </div>
          )}

          <button onClick={saveConfig} disabled={configSaving}
            className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {configSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Guardar configuracion
          </button>
        </CardContent>
      </Card>

      {/* Right: Simulator */}
      <div className="space-y-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4 text-amber-500" /> Simulador</CardTitle>
            <CardDescription>Probá con un precio de {serviceLower} para ver cuánto gana tu {clientLabelSingular.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Precio {svcPrep} {serviceLower}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="text" inputMode="numeric"
                  className="pl-7"
                  value={simServicePriceStr}
                  onChange={e => setSimServicePriceStr(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ej: 5000"
                />
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/30 p-3">
                <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Puntos ganados</p>
                <p className="text-2xl font-black text-violet-700 dark:text-violet-300">{pointsEarned.toLocaleString('es-AR')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {usesAmount ? `${ppu} pts x $${simServicePrice.toLocaleString('es-AR')}` : `${ppb} pts fijos por ${bookingLower}`}
                </p>
              </div>
              <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30 p-3">
                <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Equivalen a</p>
                <p className="text-2xl font-black text-green-700 dark:text-green-300">${moneyValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {cashbackPct.toFixed(1)}% {svcPrep} {serviceLower}
                </p>
              </div>
            </div>

            {/* How many visits for each reward */}
            {rewards.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{terms.bookingPlural} necesari{gender.suffix}s por recompensa</p>
                {rewards.filter(r => r.isActive).map((reward: any) => {
                  const visitsNeeded = pointsEarned > 0 ? Math.ceil(reward.pointsCost / pointsEarned) : Infinity;
                  const totalSpend = visitsNeeded * simServicePrice;
                  const rewardValue =
                    reward.rewardType === 'PERCENTAGE_DISCOUNT' ? `${reward.discountValue}% desc.` :
                    reward.rewardType === 'FIXED_DISCOUNT' ? `$${Number(reward.discountValue).toLocaleString('es-AR')} desc.` :
                    reward.rewardType === 'FREE_SERVICE' ? `${terms.serviceSingular} gratis` : 'Producto gratis';
                  const roi = reward.rewardType === 'FIXED_DISCOUNT' && totalSpend > 0
                    ? ((Number(reward.discountValue) / totalSpend) * 100).toFixed(1)
                    : reward.rewardType === 'PERCENTAGE_DISCOUNT' && totalSpend > 0
                    ? ((Number(reward.discountValue) / 100 * simServicePrice) / totalSpend * 100).toFixed(1)
                    : null;

                  return (
                    <div key={reward.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/30">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Gift className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{reward.name}</p>
                        <p className="text-[10px] text-muted-foreground">{reward.pointsCost} pts — {rewardValue}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold">
                          {visitsNeeded === Infinity ? '—' : `${visitsNeeded} ${terms.bookingPlural.toLowerCase()}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {visitsNeeded !== Infinity && `gasta $${totalSpend.toLocaleString('es-AR')}`}
                          {roi && ` (${roi}% ROI)`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick reference */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4 text-green-500" /> Referencia rapida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                <span className="text-muted-foreground">Belleza / Salud</span>
                <span className="font-semibold text-green-700 dark:text-green-400">3-5% cashback</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                <span className="text-muted-foreground">Gastronomia</span>
                <span className="font-semibold text-green-700 dark:text-green-400">5-8% cashback</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                <span className="text-muted-foreground">E-commerce</span>
                <span className="font-semibold text-green-700 dark:text-green-400">1-3% cashback</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Un cashback mayor al 10% es riesgoso. El ideal para la mayoria de rubros es entre 3% y 5%: lo suficiente para fidelizar sin comprometer tu margen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
