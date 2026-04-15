'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bike,
  ShoppingBag,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  Phone,
  MapPin,
  User,
  Volume2,
  VolumeX,
  WifiOff,
  Sparkles,
  Package,
  PackageCheck,
  Timer,
  Ban,
  ChevronRight,
  ChefHat,
  Eye,
  EyeOff,
  FileText,
  Banknote,
  CreditCard,
  Wallet,
  AlertCircle,
  CircleDot,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createApiClient, Order, type DeliveryStaffMember } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useGastroSocket } from '@/lib/gastro-socket';
import { DeliveryAssignBlock } from '@/components/orders/delivery-assign-block';
import { Printer } from 'lucide-react';

// ─── Status config ──────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  icon: any;
  gradient: string;
}> = {
  PENDING: {
    label: 'Nuevo',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10',
    border: 'border-amber-200/80 dark:border-amber-700/40',
    dot: 'bg-amber-500',
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10',
    border: 'border-blue-200/80 dark:border-blue-800/40',
    dot: 'bg-blue-500',
    icon: CheckCircle2,
    gradient: 'from-blue-500 to-blue-600',
  },
  PROCESSING: {
    label: 'Preparando',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10',
    border: 'border-violet-200/80 dark:border-violet-800/40',
    dot: 'bg-violet-500',
    icon: ChefHat,
    gradient: 'from-violet-500 to-violet-600',
  },
  READY: {
    label: 'Listo',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-900/10',
    border: 'border-teal-200/80 dark:border-teal-800/40',
    dot: 'bg-teal-500',
    icon: PackageCheck,
    gradient: 'from-teal-500 to-teal-600',
  },
  SHIPPED: {
    label: 'En camino',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-900/10',
    border: 'border-indigo-200/80 dark:border-indigo-800/40',
    dot: 'bg-indigo-500',
    icon: Bike,
    gradient: 'from-indigo-500 to-indigo-600',
  },
  ARRIVED: {
    label: 'Llegó',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-900/10',
    border: 'border-pink-200/80 dark:border-pink-800/40',
    dot: 'bg-pink-500',
    icon: CircleDot,
    gradient: 'from-pink-500 to-pink-600',
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10',
    border: 'border-emerald-200/80 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-emerald-600',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10',
    border: 'border-red-200/80 dark:border-red-800/40',
    dot: 'bg-red-500',
    icon: Ban,
    gradient: 'from-red-500 to-red-600',
  },
};

// For DELIVERY orders: restaurant only goes up to READY, delivery person handles the rest
// For other orders (DINE_IN, TAKE_AWAY): restaurant handles the full flow
function getNextStatuses(status: string, orderType?: string, awaitingPayment?: boolean): { status: string; label: string; color: string; icon: any }[] {
  const isDelivery = orderType === 'DELIVERY';

  // Si el pedido está esperando que el cliente elija pago, NO mostramos acciones.
  // El comercio debe esperar que el cliente confirme.
  if (status === 'CONFIRMED' && awaitingPayment) {
    return [];
  }

  const map: Record<string, { status: string; label: string; color: string; icon: any }[]> = {
    PENDING: [
      { status: 'CONFIRMED', label: 'Aceptar pedido', color: 'bg-blue-600 hover:bg-blue-700', icon: CheckCircle2 },
      { status: 'CANCELLED', label: 'Rechazar', color: 'bg-red-500 hover:bg-red-600', icon: X },
    ],
    // CONFIRMED + pago resuelto (efectivo) → comercio decide cuándo enviar a cocina.
    // Si fue MP, el webhook ya lo paso a PROCESSING automáticamente.
    CONFIRMED: isDelivery
      ? [
          { status: 'PROCESSING', label: 'Enviar a cocinar', color: 'bg-orange-600 hover:bg-orange-700', icon: ChefHat },
          { status: 'CANCELLED', label: 'Cancelar', color: 'bg-red-500 hover:bg-red-600', icon: X },
        ]
      : [
          { status: 'PROCESSING', label: 'Enviar a cocinar', color: 'bg-orange-600 hover:bg-orange-700', icon: ChefHat },
          { status: 'CANCELLED', label: 'Cancelar', color: 'bg-red-500 hover:bg-red-600', icon: X },
        ],
    PROCESSING: isDelivery
      ? [{ status: 'READY', label: 'Listo para delivery', color: 'bg-teal-600 hover:bg-teal-700', icon: PackageCheck }]
      : [{ status: 'READY', label: 'Listo para retirar', color: 'bg-teal-600 hover:bg-teal-700', icon: PackageCheck }],
    READY: isDelivery
      ? [] // Delivery person takes over from here
      : [{ status: 'DELIVERED', label: 'Entregado', color: 'bg-emerald-600 hover:bg-emerald-700', icon: CheckCircle2 }],
    SHIPPED: [], // Controlled by delivery person
    ARRIVED: [], // Controlled by delivery person
    DELIVERED: [],
    CANCELLED: [],
  };

  return map[status] || [];
}

const ORDER_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  DELIVERY: { label: 'Delivery', icon: Bike, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50' },
  TAKE_AWAY: { label: 'Retira en local', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' },
  DINE_IN: { label: 'Salón', icon: Package, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' },
};

// Urgency levels based on elapsed time
function getUrgency(elapsed: number, status: string): 'normal' | 'warning' | 'urgent' {
  if (status === 'DELIVERED' || status === 'CANCELLED') return 'normal';
  if (status === 'PENDING') {
    if (elapsed > 10) return 'urgent';
    if (elapsed > 5) return 'warning';
  }
  if (status === 'CONFIRMED' || status === 'PROCESSING') {
    if (elapsed > 30) return 'urgent';
    if (elapsed > 15) return 'warning';
  }
  return 'normal';
}

const URGENCY_STYLES = {
  normal: 'text-slate-400 dark:text-neutral-500',
  warning: 'text-amber-500 dark:text-amber-400',
  urgent: 'text-red-500 dark:text-red-400 font-semibold',
};

type TabFilter = 'active' | 'completed';

export default function PedidosCocinaPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('active');
  const [newOrderFlash, setNewOrderFlash] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [agentOffline, setAgentOffline] = useState<{ agents: any[]; pendingComandas: number } | null>(null);
  const [printFailCount, setPrintFailCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playAlertRef = useRef<(() => void) | null>(null);

  const tenantId = (session?.user as any)?.tenantId || null;

  // Update elapsed times every 30s
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const getApi = useCallback(() => {
    if (!session?.accessToken) return null;
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  const loadOrders = useCallback(async () => {
    const api = getApi();
    if (!api) return;
    try {
      const [pending, confirmed, processing, ready, shipped, arrived, delivered] = await Promise.all([
        api.getOrders('PENDING', 1, 50),
        api.getOrders('CONFIRMED', 1, 50),
        api.getOrders('PROCESSING', 1, 50),
        api.getOrders('READY', 1, 50),
        api.getOrders('SHIPPED', 1, 50),
        api.getOrders('ARRIVED', 1, 50),
        api.getOrders('DELIVERED', 1, 20),
      ]);
      const all = [
        ...pending.data,
        ...confirmed.data,
        ...processing.data,
        ...ready.data,
        ...shipped.data,
        ...arrived.data,
        ...delivered.data,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Detectar pedidos donde el cliente acaba de elegir EFECTIVO
      // (estaba awaitingPayment=true y ahora awaitingPayment=false en CONFIRMED).
      // Esos requieren atención del comercio: sonido + flash.
      setOrders(prev => {
        const prevMap = new Map(prev.map(o => [o.id, o]));
        const justChoseCash = all.some((o: any) => {
          if (o.status !== 'CONFIRMED' || o.awaitingPayment) return false;
          const before = prevMap.get(o.id);
          if (!before) return false;
          const wasAwaiting = (before as any).awaitingPayment === true;
          const isCash = o.payments?.[0]?.paymentMethod === 'efectivo';
          return wasAwaiting && isCash;
        });
        if (justChoseCash) {
          playAlertRef.current?.();
          setNewOrderFlash(true);
          setTimeout(() => setNewOrderFlash(false), 3000);
        }
        return all;
      });
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [getApi]);

  const loadDeliveryStaff = useCallback(async () => {
    const api = getApi();
    if (!api) return;
    try {
      const staff = await api.getDeliveryStaff();
      setDeliveryStaff(staff);
    } catch {
      setDeliveryStaff([]);
    }
  }, [getApi]);

  const handleAssignDelivery = useCallback(async (orderId: string, employeeId: string | null) => {
    const api = getApi();
    if (!api) return;
    try {
      const updated = await api.assignDeliveryEmployee(orderId, employeeId || null);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
    } catch (err) {
      console.error('Error assigning delivery:', err);
    }
  }, [getApi]);

  useEffect(() => { loadOrders(); loadDeliveryStaff(); }, [loadOrders, loadDeliveryStaff]);

  useEffect(() => {
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const playAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgkKu0o3VJPmOKo7CtiVtJV3eLnqufi1dKX3mNm6CJZlRYa4eXnJN9Z1tuf5KXkYBpYWyAjpaVg3FmZ3WIk5aJdWhncIaVn5SAcGtwhpOak4N2b3OEkpiUh3VtcISSl5WIdm5xhJGYlol3bXGEkZiWiXdscYWSmZaIdm5xhJGYlol3bXGEkZiWiXdscYWSmZaIdm5x');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  // Mantener ref actualizada para usar en loadOrders sin dependencia circular
  useEffect(() => { playAlertRef.current = playAlert; }, [playAlert]);

  const handleNewOrderAlert = useCallback(() => {
    loadOrders();
    playAlert();
    setNewOrderFlash(true);
    setTimeout(() => setNewOrderFlash(false), 3000);
  }, [loadOrders, playAlert]);

  const { connected } = useGastroSocket({
    tenantId,
    onNewOrder: useCallback(() => handleNewOrderAlert(), [handleNewOrderAlert]),
    onAgentOffline: useCallback((data: any) => {
      setAgentOffline({ agents: data.agents || [], pendingComandas: data.pendingComandas || 0 });
    }, []),
    onAgentConnected: useCallback((data: any) => {
      if (data?.connected) setAgentOffline(null);
    }, []),
    onPrintFailed: useCallback(() => {
      setPrintFailCount((prev) => prev + 1);
    }, []),
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const api = getApi();
    if (!api) return;
    setActionLoading(prev => new Set(prev).add(orderId));
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'ARRIVED'].includes(o.status));
  const completedOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));
  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;
  const enRouteCount = orders.filter(o => ['SHIPPED', 'ARRIVED'].includes(o.status)).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
        newOrderFlash
          ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900'
      }`}>
        {/* Decorative */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <ChefHat className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium text-white/50">
                  {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {newOrderFlash ? 'Nuevo pedido!' : 'Centro de pedidos'}
              </h1>
              <p className="text-sm text-white/40 mt-1">
                {activeOrders.length} {activeOrders.length === 1 ? 'pedido activo' : 'pedidos activos'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Connection status */}
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                connected ? 'bg-white/10 text-white/80' : 'bg-red-500/20 text-red-300'
              }`}>
                {connected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    En vivo
                  </>
                ) : (
                  <><WifiOff className="w-3 h-3" /> Desconectado</>
                )}
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl transition-all ${
                  soundEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/5 text-white/30'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Agent Offline Banner ─────────────────── */}
      {agentOffline && (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-red-300 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <Printer className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Impresora desconectada
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              El agente de impresión no responde.
              {agentOffline.pendingComandas > 0 && (
                <span className="font-bold"> {agentOffline.pendingComandas} comanda(s) pendiente(s) sin imprimir.</span>
              )}
              {' '}Verificá que la PC del local esté encendida y el programa abierto.
            </p>
          </div>
        </div>
      )}

      {/* ─── Print Failure Banner ──────────────────── */}
      {printFailCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{printFailCount}</span> comanda(s) fallaron al imprimir en esta sesión.
            Revisá el agente de impresión.
          </p>
          <button
            onClick={() => setPrintFailCount(0)}
            className="ml-auto text-xs text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
          >
            Descartar
          </button>
        </div>
      )}

      {/* ─── KPI Strip ──────────────────────────── */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: 'Nuevos', count: pendingCount, icon: Clock, gradient: 'from-amber-500 to-orange-500', hasAlert: pendingCount > 0 },
          { label: 'Confirmados', count: confirmedCount, icon: CheckCircle2, gradient: 'from-blue-500 to-blue-600', hasAlert: false },
          { label: 'Preparando', count: processingCount, icon: ChefHat, gradient: 'from-violet-500 to-violet-600', hasAlert: false },
          { label: 'Listos', count: readyCount, icon: PackageCheck, gradient: 'from-teal-500 to-teal-600', hasAlert: readyCount > 0 },
          { label: 'En camino', count: enRouteCount, icon: Bike, gradient: 'from-indigo-500 to-indigo-600', hasAlert: false },
        ].map((kpi) => {
          const KpiIcon = kpi.icon;
          const isActive = kpi.count > 0;
          return (
            <div
              key={kpi.label}
              className={`relative rounded-xl p-3 sm:p-4 md:p-5 transition-all overflow-hidden ${
                isActive
                  ? `bg-gradient-to-br ${kpi.gradient} text-white shadow-lg`
                  : 'bg-slate-100 dark:bg-neutral-800/80 text-slate-400 dark:text-neutral-500'
              }`}
            >
              {isActive && <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full" />}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <KpiIcon className={`h-4 w-4 md:h-5 md:w-5 ${isActive ? 'text-white/80' : ''}`} />
                  {kpi.hasAlert && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                  )}
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums">{kpi.count}</p>
                <p className={`text-[11px] sm:text-xs md:text-sm mt-0.5 md:mt-1 ${isActive ? 'text-white/70' : ''}`}>{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Tab toggle ─────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800/80 rounded-xl p-1 max-w-xs">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-neutral-400'
          }`}
        >
          Activos
          {activeOrders.length > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-neutral-400'
          }`}
        >
          Historial
        </button>
      </div>

      {/* ─── Orders ─────────────────────────────── */}
      {displayOrders.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-slate-300 dark:text-neutral-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              {activeTab === 'active' ? 'Sin pedidos activos' : 'Sin historial'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
              {activeTab === 'active'
                ? 'Los pedidos nuevos apareceran aca con alerta sonora.'
                : 'Los pedidos completados apareceran aca.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 auto-rows-fr">
          {displayOrders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = config.icon;
            const orderType = ORDER_TYPE_LABELS[order.orderType || ''] || ORDER_TYPE_LABELS.TAKE_AWAY;
            const TypeIcon = orderType.icon;
            const isPending = order.status === 'PENDING';
            const elapsed = Math.round((now - new Date(order.createdAt).getTime()) / 60000);
            const urgency = getUrgency(elapsed, order.status);
            const itemCount = order._count?.items ?? order.items?.length ?? 0;
            const isExpanded = expandedOrder === order.id;

            const shippingData = order.shippingAddress ? (() => {
              try {
                const parsed = JSON.parse(order.shippingAddress);
                return { address: parsed.address || parsed.direccion || null };
              } catch {
                return { address: order.shippingAddress };
              }
            })() : null;

            const paymentMethod = (order as any).payments?.[0]?.paymentMethod;
            const paymentStatus = (order as any).payments?.[0]?.status;

            return (
              <div
                key={order.id}
                className={`h-full flex flex-col rounded-xl border bg-white dark:bg-neutral-900 shadow-sm overflow-hidden transition-all duration-300 ${
                  isPending
                    ? 'border-amber-300 dark:border-amber-600/50 ring-1 ring-amber-200/60 dark:ring-amber-700/30'
                    : `border-slate-200/80 dark:border-neutral-800 ${config.border}`
                }`}
              >
                {/* Urgency top bar for pending orders */}
                {isPending && (
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 animate-pulse" />
                )}

                {/* Main content */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Header row */}
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-base">{order.orderNumber}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${orderType.color}`}>
                          <TypeIcon className="w-2.5 h-2.5" />
                          {orderType.label}
                        </span>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 animate-pulse">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Requiere accion
                          </span>
                        )}
                        {/* Esperando que el cliente elija método de pago */}
                        {order.status === 'CONFIRMED' && (order as any).awaitingPayment && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700">
                            <Timer className="w-2.5 h-2.5" />
                            Esperando que el cliente elija pago
                          </span>
                        )}
                        {/* Cliente eligió EFECTIVO — comercio debe enviar a cocina */}
                        {order.status === 'CONFIRMED' && !(order as any).awaitingPayment && paymentMethod === 'efectivo' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50 animate-pulse">
                            <Wallet className="w-2.5 h-2.5" />
                            Cliente eligio EFECTIVO
                          </span>
                        )}
                        {/* Pagado por MP (no debería verse mucho porque el webhook lo pasa a PROCESSING, pero por seguridad) */}
                        {order.status === 'CONFIRMED' && !(order as any).awaitingPayment && paymentMethod === 'mercadopago' && paymentStatus === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-300 dark:border-sky-700/50">
                            <CreditCard className="w-2.5 h-2.5" />
                            Pagado con MP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`flex items-center gap-1 text-xs ${URGENCY_STYLES[urgency]}`}>
                          <Timer className="w-3 h-3" />
                          {elapsed < 60 ? `${elapsed} min` : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`}
                        </span>
                        <span className="text-[11px] text-slate-300 dark:text-neutral-600">
                          {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Total + expand */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(order.total, 'ARS')}</p>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 mt-0.5 transition-colors"
                      >
                        {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </button>
                    </div>
                  </div>

                  {/* Customer row */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {order.customerName && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-neutral-300">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                        {order.customerName}
                      </span>
                    )}
                    {order.customerPhone && (
                      <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <Phone className="w-3.5 h-3.5" />
                        {order.customerPhone}
                      </a>
                    )}
                    {shippingData?.address && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-neutral-400">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span className="truncate max-w-[200px]">{shippingData.address}</span>
                      </span>
                    )}
                    {paymentMethod && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-neutral-500">
                        {paymentMethod === 'mercadopago' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                        {paymentMethod === 'mercadopago' ? 'MP' : 'Efectivo'}
                        {paymentStatus === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      </span>
                    )}
                  </div>

                  {/* Expanded: Items detail */}
                  {isExpanded && order.items && order.items.length > 0 && (
                    <div className="mt-3 bg-slate-50 dark:bg-neutral-800/50 rounded-xl p-3 border border-slate-100 dark:border-neutral-700/50">
                      <div className="space-y-2">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <span className="shrink-0 w-6 h-6 rounded-md bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-neutral-400">
                                {item.quantity}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-neutral-200 leading-snug">
                                  {item.productName || item.name || 'Producto'}
                                </p>
                                {item.variantName && (
                                  <p className="text-[11px] text-slate-400 dark:text-neutral-500">{item.variantName}</p>
                                )}
                                {item.notes && (
                                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                                    <FileText className="w-3 h-3" />
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-slate-600 dark:text-neutral-300 tabular-nums shrink-0">
                              {formatPrice((item.unitPrice || item.price || 0) * item.quantity, 'ARS')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order notes */}
                  {order.notes && (
                    <div className="mt-2.5 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">{order.notes}</p>
                    </div>
                  )}

                  {/* Spacer to push action area to bottom of card */}
                  <div className="flex-1" />

                  {/* Delivery assignment (only DELIVERY orders in READY/SHIPPED/ARRIVED) */}
                  {order.orderType === 'DELIVERY' &&
                    (order as any).deliveryToken &&
                    ['READY', 'SHIPPED', 'ARRIVED'].includes(order.status) && (
                      <div className="mt-3">
                        <DeliveryAssignBlock
                          order={order}
                          deliveryStaff={deliveryStaff}
                          onAssign={handleAssignDelivery}
                        />
                      </div>
                    )}

                  {/* Action buttons */}
                  {getNextStatuses(order.status, order.orderType, (order as any).awaitingPayment).length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {getNextStatuses(order.status, order.orderType, (order as any).awaitingPayment).map(({ status, label, color, icon: ActionIcon }) => (
                        <Button
                          key={status}
                          onClick={() => handleStatusChange(order.id, status)}
                          disabled={actionLoading.has(order.id)}
                          className={`flex-1 h-11 text-white shadow-md font-semibold text-sm gap-1.5 ${color}`}
                        >
                          {actionLoading.has(order.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ActionIcon className="w-4 h-4" />
                          )}
                          {label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
