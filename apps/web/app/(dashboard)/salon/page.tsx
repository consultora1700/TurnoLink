'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  UtensilsCrossed,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Loader2,
  DollarSign,
  QrCode,
  Settings,
  Sparkles,
  Users,
  Banknote,
  Timer,
  Eye,
  MessageCircle,
  ChefHat,
  KeyRound,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createApiClient } from '@/lib/api';
import { useGastroSocket } from '@/lib/gastro-socket';
import { formatPrice } from '@/lib/utils';
import { QrGenerator } from '@/components/gastro/qr-generator';
import { GastroSettings } from '@/components/gastro/gastro-settings';
import { KitchenSettings } from '@/components/gastro/kitchen-settings';

interface TableInfo {
  tableNumber: number;
  status: string;
  sessionId: string | null;
  orderCount: number;
  totalAmount: number;
  openedAt: string | null;
  orders: any[];
  review?: string | null;
  tipAmount?: number;
  waiterId?: string | null;
  waiterName?: string | null;
  sessionWord?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: any }> = {
  FREE: {
    label: 'Libre',
    color: 'text-slate-400 dark:text-neutral-500',
    bg: 'bg-white/60 dark:bg-neutral-800/40',
    border: 'border-slate-200/60 dark:border-neutral-700/40',
    dot: 'bg-slate-300 dark:bg-neutral-600',
    icon: UtensilsCrossed,
  },
  OCCUPIED: {
    label: 'Ocupada',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
    icon: Users,
  },
  ORDERING: {
    label: 'Pidiendo',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
    icon: UtensilsCrossed,
  },
  BILL_REQUESTED: {
    label: 'Cuenta',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10',
    border: 'border-orange-300 dark:border-orange-700/60',
    dot: 'bg-orange-500',
    icon: Receipt,
  },
  PAYMENT_ENABLED: {
    label: 'Pagando',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800/60',
    dot: 'bg-purple-500',
    icon: CreditCard,
  },
  WAITING_PAYMENT: {
    label: 'Cobrar',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-900/10',
    border: 'border-pink-300 dark:border-pink-700/60',
    dot: 'bg-pink-500',
    icon: Banknote,
  },
  PAID: {
    label: 'Pagada',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
};

const TABS = [
  { key: 'mesas' as const, label: 'Mesas', icon: UtensilsCrossed },
  { key: 'propinas' as const, label: 'Propinas', icon: Banknote },
  { key: 'qr' as const, label: 'Códigos QR', icon: QrCode },
  { key: 'cocina' as const, label: 'Cocina', icon: ChefHat },
  { key: 'config' as const, label: 'Ajustes', icon: Settings },
];

function PropinasTab({
  getApi,
  employees,
  tipsPeriod,
  setTipsPeriod,
  tipsData,
  setTipsData,
  tipsLoading,
  setTipsLoading,
}: {
  getApi: () => ReturnType<typeof createApiClient> | null;
  employees: { id: string; name: string }[];
  tipsPeriod: string;
  setTipsPeriod: (p: string) => void;
  tipsData: any;
  setTipsData: (d: any) => void;
  tipsLoading: boolean;
  setTipsLoading: (l: boolean) => void;
}) {
  const loadTips = useCallback(async (period: string) => {
    const api = getApi();
    if (!api) return;
    setTipsLoading(true);
    try {
      const data = await api.getGastroTips(period);
      setTipsData(data);
    } catch (err) {
      console.error('Error loading tips:', err);
    } finally {
      setTipsLoading(false);
    }
  }, [getApi, setTipsData, setTipsLoading]);

  useEffect(() => {
    loadTips(tipsPeriod);
  }, [tipsPeriod, loadTips]);

  const PERIODS = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
  ];

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800/80 rounded-xl p-1 max-w-xs">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTipsPeriod(key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tipsPeriod === key
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tipsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !tipsData ? (
        <div className="text-center py-16 text-sm text-muted-foreground">No se pudieron cargar las propinas</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              <CardContent className="p-4 relative">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                  <Banknote className="h-4 w-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{formatPrice(tipsData.totalTips, 'ARS')}</p>
                <p className="text-xs text-white/80 mt-0.5">Total propinas</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              <CardContent className="p-4 relative">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                  <Receipt className="h-4 w-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{tipsData.totalSessions}</p>
                <p className="text-xs text-white/80 mt-0.5">Mesas con propina</p>
              </CardContent>
            </Card>

            {tipsData.totalSessions > 0 && (
              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-amber-600 text-white relative overflow-hidden col-span-2 md:col-span-1">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardContent className="p-4 relative">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{formatPrice(tipsData.totalTips / tipsData.totalSessions, 'ARS')}</p>
                  <p className="text-xs text-white/80 mt-0.5">Promedio por mesa</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* By waiter */}
          {tipsData.byWaiter.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Propinas por mozo
                </h3>
                <div className="space-y-2">
                  {tipsData.byWaiter.map((w: any) => {
                    const percentage = tipsData.totalTips > 0 ? (w.totalTips / tipsData.totalTips) * 100 : 0;
                    return (
                      <div key={w.waiterId} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {w.waiterName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{w.waiterName}</span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 ml-2">{formatPrice(w.totalTips, 'ARS')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 tabular-nums w-14 text-right">
                              {w.sessionCount} {w.sessionCount === 1 ? 'mesa' : 'mesas'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {tipsData.unassignedTips > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-neutral-400">Sin mozo asignado</span>
                    <span className="font-medium text-slate-600 dark:text-neutral-300">{formatPrice(tipsData.unassignedTips, 'ARS')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Individual sessions */}
          {tipsData.sessions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-500" />
                  Detalle por mesa
                </h3>
                <div className="space-y-2">
                  {tipsData.sessions.map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-neutral-800/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{s.tableNumber}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              Mesa {s.tableNumber}
                            </span>
                            {s.tipType && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                {s.tipType === 'percentage' ? '%' : s.tipType === 'fixed' ? 'Fijo' : s.tipType}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-neutral-500">
                            {s.waiterName && <span>{s.waiterName}</span>}
                            <span>{new Date(s.date).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(s.tipAmount, 'ARS')}</p>
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500">de {formatPrice(s.totalAmount, 'ARS')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {tipsData.totalSessions === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Banknote className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Sin propinas {tipsPeriod === 'today' ? 'hoy' : tipsPeriod === 'week' ? 'esta semana' : 'este mes'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Las propinas aparecerán acá a medida que los comensales paguen.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function SalonPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'mesas' | 'propinas' | 'qr' | 'config' | 'cocina'>('mesas');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [stats, setStats] = useState<{
    todayRevenue: number; todaySessionCount: number;
    weekRevenue: number; weekSessionCount: number;
    monthRevenue: number; monthSessionCount: number;
    recentReviews: { review: string; tableNumber: number; updatedAt: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [waiterAssignment, setWaiterAssignment] = useState<string>('dynamic');
  const [tableAssignments, setTableAssignments] = useState<Record<string, string>>({});
  const [tipsData, setTipsData] = useState<any>(null);
  const [tipsPeriod, setTipsPeriod] = useState<string>('today');
  const [tipsLoading, setTipsLoading] = useState(false);

  // tenantId directly from NextAuth session — no extra API call needed
  const tenantId = (session?.user as any)?.tenantId || null;

  const getApi = useCallback(() => {
    if (!session?.accessToken) return null;
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  const loadTables = useCallback(async () => {
    const api = getApi();
    if (!api) return;
    try {
      const result = await api.getGastroTables();
      setTables(result.tables);
      if (result.stats) setStats(result.stats);
      if (result.employees) setEmployees(result.employees);
      if (result.waiterAssignment) setWaiterAssignment(result.waiterAssignment);
      if (result.tableAssignments) setTableAssignments(result.tableAssignments);
    } catch (err: any) {
      console.error('Error loading tables:', err);
      // If 401, redirect to login
      if (err?.isUnauthorized || err?.statusCode === 401) {
        window.location.href = '/login?error=session_expired';
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [getApi]);

  useEffect(() => { loadTables(); }, [loadTables]);

  const playAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgkKu0o3VJPmOKo7CtiVtJV3eLnqufi1dKX3mNm6CJZlRYa4eXnJN9Z1tuf5KXkYBpYWyAjpaVg3FmZ3WIk5aJdWhncIaVn5SAcGtwhpOak4N2b3OEkpiUh3VtcISSl5WIdm5xhJGYlol3bXGEkZiWiXdscYWSmZaIdm5xhJGYlol3bXGEkZiWiXdscYWSmZaIdm5x');
      }
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  const { connected } = useGastroSocket({
    tenantId,
    onSessionOpened: useCallback(() => loadTables(), [loadTables]),
    onOrderPlaced: useCallback(() => { loadTables(); playAlert(); }, [loadTables, playAlert]),
    onOrderDelivered: useCallback(() => loadTables(), [loadTables]),
    onBillRequested: useCallback(() => { loadTables(); playAlert(); }, [loadTables, playAlert]),
    onPaymentEnabled: useCallback(() => loadTables(), [loadTables]),
    onPaymentRequested: useCallback(() => { loadTables(); playAlert(); }, [loadTables, playAlert]),
    onPaid: useCallback(() => loadTables(), [loadTables]),
    onClosed: useCallback(() => loadTables(), [loadTables]),
    onStatusChanged: useCallback(() => loadTables(), [loadTables]),
  });

  const handleEnablePayment = async (sessionId: string) => {
    const api = getApi();
    if (!api) return;
    setActionLoading(sessionId);
    try {
      await api.enableGastroPayment(sessionId);
      await loadTables();
      if (selectedTable?.sessionId === sessionId) {
        const updated = tables.find((t) => t.sessionId === sessionId);
        if (updated) setSelectedTable({ ...updated, status: 'PAYMENT_ENABLED' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPayment = async (sessionId: string) => {
    const api = getApi();
    if (!api) return;
    setActionLoading(`pay-${sessionId}`);
    try {
      await api.updateGastroSessionStatus(sessionId, 'PAID');
      await loadTables();
      if (selectedTable?.sessionId === sessionId) {
        setSelectedTable((prev) => prev ? { ...prev, status: 'PAID' } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDelivered = async (sessionId: string, orderId: string) => {
    const api = getApi();
    if (!api) return;
    setActionLoading(`deliver-${orderId}`);
    try {
      await api.markGastroOrderDelivered(sessionId, orderId);
      // Update selectedTable immediately so UI reflects the change
      setSelectedTable((prev) => {
        if (!prev) return null;
        const updatedOrders = prev.orders.map((o: any) =>
          o.id === orderId ? { ...o, status: 'DELIVERED' } : o
        );
        return { ...prev, orders: updatedOrders };
      });
      await loadTables();
    } catch (err) {
      console.error('Error marking delivered:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseTable = async (tableNumber: number) => {
    const api = getApi();
    if (!api) return;
    setActionLoading(`close-${tableNumber}`);
    try {
      await api.closeGastroTable(tableNumber);
      await loadTables();
      setSelectedTable(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Stats
  const waitingPayment = tables.filter((t) => t.status === 'WAITING_PAYMENT').length;
  const activeTables = tables.filter((t) => !['FREE', 'PAID', 'CLOSED'].includes(t.status));
  const occupied = activeTables.length;
  const billRequested = tables.filter((t) => t.status === 'BILL_REQUESTED').length;
  const paymentEnabled = tables.filter((t) => t.status === 'PAYMENT_ENABLED').length;
  const totalRevenue = stats?.todayRevenue || tables.filter((t) => t.status === 'PAID').reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTables = tables.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando salón...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero header — matches dashboard style */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-28 sm:w-36 h-28 sm:h-36 bg-white/10 rounded-full blur-xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium text-white/80">
                  {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Salón en vivo
              </h1>
              <p className="text-sm text-white/70 mt-1 hidden sm:block">
                {totalTables} mesas configuradas &middot; {occupied} activas ahora
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Connection pill */}
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all ${
                connected
                  ? 'bg-white/20 text-white'
                  : 'bg-red-500/30 text-white'
              }`}>
                {connected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    En vivo
                  </>
                ) : (
                  <><WifiOff className="w-3 h-3" /> Sin conexión</>
                )}
              </div>

              {/* Sound */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl backdrop-blur-sm transition-all ${
                  soundEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20 opacity-60'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards — gradient style matching dashboard */}
      {activeTab === 'mesas' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                {occupied > 0 && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{Math.round((occupied / Math.max(totalTables, 1)) * 100)}%</span>}
              </div>
              <p className="text-3xl font-bold">{occupied}</p>
              <p className="text-xs text-white/80 mt-0.5">Mesas activas</p>
            </CardContent>
          </Card>

          <Card className={`border-0 shadow-md relative overflow-hidden ${
            billRequested > 0
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
              : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700 text-slate-600 dark:text-neutral-300'
          }`}>
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  billRequested > 0 ? 'bg-white/20' : 'bg-slate-200 dark:bg-neutral-600'
                }`}>
                  <Receipt className={`h-4 w-4 ${billRequested > 0 ? '' : 'text-slate-400 dark:text-neutral-400'}`} />
                </div>
                {billRequested > 0 && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold">{billRequested}</p>
              <p className={`text-xs mt-0.5 ${billRequested > 0 ? 'text-white/80' : 'text-slate-500 dark:text-neutral-400'}`}>
                {billRequested > 0 ? 'Cuentas pendientes' : 'Sin cuentas'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold">{paymentEnabled}</p>
              <p className="text-xs text-white/80 mt-0.5">Esperando pago</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold truncate">{formatPrice(totalRevenue, 'ARS')}</p>
              <p className="text-xs text-white/80 mt-0.5">Recaudado hoy{stats?.todaySessionCount ? ` · ${stats.todaySessionCount} mesas` : ''}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800/80 rounded-xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ===== Propinas Tab ===== */}
      {activeTab === 'propinas' && (
        <PropinasTab
          getApi={getApi}
          employees={employees}
          tipsPeriod={tipsPeriod}
          setTipsPeriod={setTipsPeriod}
          tipsData={tipsData}
          setTipsData={setTipsData}
          tipsLoading={tipsLoading}
          setTipsLoading={setTipsLoading}
        />
      )}

      {/* ===== QR Tab ===== */}
      {activeTab === 'qr' && <QrGenerator />}

      {/* ===== Cocina Tab ===== */}
      {activeTab === 'cocina' && <KitchenSettings />}

      {/* ===== Config Tab ===== */}
      {activeTab === 'config' && <GastroSettings />}

      {/* ===== Mesas Tab ===== */}
      {activeTab === 'mesas' && (
        <>
          {tables.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  No hay mesas configuradas
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Andá a la pestaña <strong>Códigos QR</strong> para configurar la cantidad de mesas de tu salón.
                </p>
                <Button
                  onClick={() => setActiveTab('qr')}
                  className="mt-4 bg-amber-600 hover:bg-amber-700"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Configurar mesas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {tables.map((table) => {
                const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.FREE;
                const StatusIcon = config.icon;
                const isBillRequested = table.status === 'BILL_REQUESTED';
                const isWaitingPayment = table.status === 'WAITING_PAYMENT';
                const needsAttention = isBillRequested || isWaitingPayment;
                const isActive = table.status !== 'FREE';
                const elapsed = table.openedAt
                  ? Math.round((Date.now() - new Date(table.openedAt).getTime()) / 60000)
                  : 0;

                return (
                  <button
                    key={table.tableNumber}
                    onClick={() => isActive ? setSelectedTable(table) : undefined}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${config.bg} ${config.border} ${
                      isActive
                        ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
                        : 'cursor-default'
                    } ${isBillRequested ? 'ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-neutral-900' : ''} ${isWaitingPayment ? 'ring-2 ring-pink-400 ring-offset-2 dark:ring-offset-neutral-900' : ''}`}
                  >
                    {/* Alert badge */}
                    {isBillRequested && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <AlertTriangle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {isWaitingPayment && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Banknote className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    {/* Table number + status dot */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {table.tableNumber}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${config.dot} ${isBillRequested ? 'animate-pulse' : ''}`} />
                      </div>
                      {isActive && (
                        <Eye className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${config.color}`}>
                      {config.label}
                    </p>

                    {/* Active info */}
                    {isActive && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/40 dark:border-neutral-700/40 space-y-1">
                        {table.orderCount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                              {table.orderCount} {table.orderCount === 1 ? 'pedido' : 'pedidos'}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {formatPrice(table.totalAmount, 'ARS')}
                            </span>
                          </div>
                        )}
                        {elapsed > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-neutral-500">
                            <Timer className="w-2.5 h-2.5" />
                            {elapsed < 60 ? `${elapsed}min` : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`}
                          </div>
                        )}
                        {(table.waiterName || (waiterAssignment === 'pre-assigned' && tableAssignments[String(table.tableNumber)])) && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-500 dark:text-blue-400">
                            <Users className="w-2.5 h-2.5" />
                            {table.waiterName || employees.find(e => e.id === tableAssignments[String(table.tableNumber)])?.name || ''}
                          </div>
                        )}
                        {table.sessionWord && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            <KeyRound className="w-2.5 h-2.5" />
                            {table.sessionWord}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Status legend */}
          {tables.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 pt-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">{cfg.label}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== Table detail modal ===== */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTable(null)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal header */}
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-neutral-800">
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Table number circle */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                    selectedTable.status === 'BILL_REQUESTED'
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                      : selectedTable.status === 'PAYMENT_ENABLED'
                      ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                      : selectedTable.status === 'PAID'
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                      : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}>
                    {selectedTable.tableNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Mesa {selectedTable.tableNumber}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] ${STATUS_CONFIG[selectedTable.status]?.color || ''}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_CONFIG[selectedTable.status]?.dot || ''}`} />
                        {STATUS_CONFIG[selectedTable.status]?.label || selectedTable.status}
                      </Badge>
                      {selectedTable.openedAt && (
                        <span className="text-[11px] text-slate-400 dark:text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(selectedTable.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {selectedTable.sessionWord && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                          <KeyRound className="w-3 h-3" />
                          {selectedTable.sessionWord}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Order count + total summary bar */}
              {selectedTable.orders.length > 0 && (
                <div className="px-5 pb-4 flex items-center gap-3">
                  <div className="flex-1 bg-slate-50 dark:bg-neutral-800/60 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wide font-medium">Pedidos</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedTable.orders.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wide font-medium">Total</p>
                      <p className="text-lg font-bold text-amber-600">{formatPrice(selectedTable.totalAmount, 'ARS')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Orders list — scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {selectedTable.orders.length === 0 ? (
                <div className="text-center py-8">
                  <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-200 dark:text-neutral-700 mb-2" />
                  <p className="text-sm text-slate-400">Todavía no hay pedidos</p>
                </div>
              ) : (
                selectedTable.orders.map((order: any) => {
                  const isDelivered = order.status === 'DELIVERED';
                  const statusColor = order.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    : order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                    : order.status === 'PREPARING' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                    : order.status === 'READY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-neutral-700 dark:text-neutral-400';
                  const statusLabel = order.status === 'PENDING' ? 'Recibido'
                    : order.status === 'CONFIRMED' ? 'Confirmado'
                    : order.status === 'PREPARING' ? 'Preparando'
                    : order.status === 'READY' ? 'Listo'
                    : order.status === 'DELIVERED' ? 'Entregado' : order.status;
                  return (
                  <div
                    key={order.id}
                    className={`bg-slate-50 dark:bg-neutral-800/60 rounded-xl p-3.5 space-y-2 ${isDelivered ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-neutral-700 px-2 py-0.5 rounded-md">
                          #{order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                          {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {formatPrice(Number(order.subtotal), 'ARS')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(order.items as any[]).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-neutral-300">
                            <span className="text-slate-400 dark:text-neutral-500 mr-1">{item.quantity}×</span>
                            {item.name}
                          </span>
                          <span className="text-slate-500 dark:text-neutral-400 tabular-nums">
                            {formatPrice(item.price * item.quantity, 'ARS')}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Mark as delivered button — only for non-delivered orders */}
                    {!isDelivered && selectedTable.sessionId && (
                      <button
                        onClick={() => handleMarkDelivered(selectedTable.sessionId!, order.id)}
                        disabled={actionLoading === `deliver-${order.id}`}
                        className="w-full mt-1 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `deliver-${order.id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Marcar entregado
                      </button>
                    )}
                  </div>
                  );
                })
              )}
            </div>

            {/* Review from comensal */}
            {selectedTable.review && (
              <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200 dark:border-neutral-800 bg-amber-50/50 dark:bg-amber-950/10">
                <div className="flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Opinión del comensal</p>
                    <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">{selectedTable.review}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tip info */}
            {selectedTable.tipAmount && selectedTable.tipAmount > 0 ? (
              <div className="flex-shrink-0 px-5 py-2.5 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-neutral-400">Propina</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatPrice(selectedTable.tipAmount, 'ARS')}</span>
              </div>
            ) : null}

            {/* Waiter assignment */}
            {selectedTable.status !== 'FREE' && employees.length > 0 && (
              <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                  <Users className="w-3.5 h-3.5 inline mr-1" />
                  Mozo
                </span>
                <select
                  value={selectedTable.waiterId || ''}
                  onChange={async (e) => {
                    const api = getApi();
                    if (!api || !selectedTable.sessionId) return;
                    setActionLoading('waiter');
                    try {
                      await api.assignWaiter(selectedTable.sessionId, e.target.value);
                      setTables(prev => prev.map(t =>
                        t.sessionId === selectedTable.sessionId
                          ? { ...t, waiterId: e.target.value, waiterName: employees.find(emp => emp.id === e.target.value)?.name || null }
                          : t
                      ));
                      setSelectedTable(prev => prev ? {
                        ...prev,
                        waiterId: e.target.value,
                        waiterName: employees.find(emp => emp.id === e.target.value)?.name || null,
                      } : null);
                    } catch {} finally {
                      setActionLoading(null);
                    }
                  }}
                  className="text-sm bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">Sin asignar</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions footer */}
            <div className="flex-shrink-0 p-5 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/30 space-y-2">
              {selectedTable.status === 'BILL_REQUESTED' && (
                <Button
                  onClick={() => handleEnablePayment(selectedTable.sessionId!)}
                  disabled={actionLoading === selectedTable.sessionId}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md font-semibold"
                >
                  {actionLoading === selectedTable.sessionId ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Habilitar pago
                </Button>
              )}

              {selectedTable.status === 'WAITING_PAYMENT' && (
                <Button
                  onClick={() => handleConfirmPayment(selectedTable.sessionId!)}
                  disabled={actionLoading === `pay-${selectedTable.sessionId}`}
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-md font-semibold"
                >
                  {actionLoading === `pay-${selectedTable.sessionId}` ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Confirmar cobro recibido
                </Button>
              )}

              {['PAID', 'PAYMENT_ENABLED'].includes(selectedTable.status) && (
                <Button
                  onClick={() => handleCloseTable(selectedTable.tableNumber)}
                  disabled={actionLoading === `close-${selectedTable.tableNumber}`}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md font-semibold"
                >
                  {actionLoading === `close-${selectedTable.tableNumber}` ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Liberar mesa
                </Button>
              )}

              {!['FREE', 'BILL_REQUESTED'].includes(selectedTable.status) && selectedTable.status !== 'PAID' && selectedTable.status !== 'PAYMENT_ENABLED' && (
                <Button
                  onClick={() => handleCloseTable(selectedTable.tableNumber)}
                  disabled={actionLoading === `close-${selectedTable.tableNumber}`}
                  variant="outline"
                  className="w-full"
                >
                  {actionLoading === `close-${selectedTable.tableNumber}` ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Forzar cierre
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
