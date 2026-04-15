'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Search,
  ShoppingBag,
  Clock,
  Bike,
  CheckCircle2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Loader2,
  Package,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { createApiClient, Order, OrderStats, type DeliveryStaffMember } from '@/lib/api';
import { DeliveryAssignBlock } from '@/components/orders/delivery-assign-block';
import { formatPrice } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Constants ─────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'READY', label: 'Listo' },
  { value: 'SHIPPED', label: 'En camino' },
  { value: 'ARRIVED', label: 'Llegó' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; badgeClass: string }> = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  READY: {
    label: 'Listo',
    color: 'bg-teal-500',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  },
  SHIPPED: {
    label: 'En camino',
    color: 'bg-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  ARRIVED: {
    label: 'Llegó',
    color: 'bg-pink-500',
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

// Restaurant can only advance delivery orders up to READY
// SHIPPED, ARRIVED, DELIVERED are controlled by the delivery person
function getNextStatuses(status: string, orderType?: string): string[] {
  const isDelivery = orderType === 'DELIVERY';
  const map: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: isDelivery ? ['READY', 'CANCELLED'] : ['DELIVERED', 'CANCELLED'],
    PROCESSING: isDelivery ? ['READY'] : ['DELIVERED'],
    READY: [], // Delivery person takes over
    SHIPPED: [], // Delivery person controls
    ARRIVED: [], // Delivery person controls
    DELIVERED: [],
    CANCELLED: [],
  };
  return map[status] || [];
}


// ─── Status Badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}
    >
      {config.label}
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function PedidosPage() {
  const { data: session } = useSession();

  // ─── State ────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // ─── API helper ───────────────────────────────────────────
  const getApi = useCallback(() => {
    if (!session?.accessToken) throw new Error('No session');
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  // ─── Load data ────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const res = await api.getOrders(filterStatus || undefined, page, 20);
      setOrders(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (error) {
      handleApiError(error);
    }
  }, [session?.accessToken, filterStatus, page]);

  const loadStats = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const statsRes = await api.getOrderStats();
      setStats(statsRes);
    } catch (error) {
      // Stats failure is non-critical
    }
  }, [session?.accessToken]);

  const loadDeliveryStaff = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const staff = await api.getDeliveryStaff();
      setDeliveryStaff(staff);
    } catch {
      setDeliveryStaff([]);
    }
  }, [session?.accessToken]);

  const handleAssignDelivery = useCallback(async (orderId: string, employeeId: string | null) => {
    try {
      const api = getApi();
      const updated = await api.assignDeliveryEmployee(orderId, employeeId || null);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast({
        title: employeeId ? 'Repartidor asignado' : 'Asignación quitada',
      });
    } catch (error) {
      handleApiError(error);
    }
  }, [getApi]);

  useEffect(() => {
    if (!session?.accessToken) return;

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadOrders(), loadStats(), loadDeliveryStaff()]);
      setLoading(false);
    };

    loadAll();
  }, [session?.accessToken, loadOrders, loadStats, loadDeliveryStaff]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  // ─── Actions ──────────────────────────────────────────────
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const api = getApi();
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast({
        title: 'Estado actualizado',
        description: `Pedido cambiado a "${STATUS_CONFIG[newStatus]?.label || newStatus}".`,
      });
      // Refresh stats
      loadStats();
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ─── Filtered orders (client-side search) ─────────────────
  const filteredOrders = search.trim()
    ? orders.filter((o) => {
        const q = search.toLowerCase();
        return (
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.customerPhone?.toLowerCase().includes(q)
        );
      })
    : orders;

  // ─── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Pedidos</h1>
              <p className="text-white/80 text-sm sm:text-base">
                Gestioná los pedidos de tu tienda
              </p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.pendingOrders}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Pendientes</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Bike className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.shippedOrders}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Enviados</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.deliveredOrders}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Entregados</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold truncate">
                    ${typeof stats.totalRevenue === 'number' ? stats.totalRevenue.toLocaleString('es-AR') : stats.totalRevenue}
                  </p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Facturación</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Filters ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por n&uacute;mero, cliente, tel&eacute;fono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active filters indicator */}
          {(search || filterStatus) && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>
                {filteredOrders.length} de {total} pedidos
              </span>
              <button
                onClick={() => {
                  setSearch('');
                  setFilterStatus('');
                }}
                className="text-amber-600 hover:text-amber-700 underline ml-2"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Orders List ─────────────────────────────────── */}
      {orders.length === 0 && !filterStatus ? (
        <EmptyState
          icon={ShoppingBag}
          title="No hay pedidos a&uacute;n"
          description="Cuando tus clientes realicen compras, los pedidos aparecer&aacute;n ac&aacute;."
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No se encontraron pedidos con los filtros aplicados."
          action={{
            label: 'Limpiar filtros',
            onClick: () => {
              setSearch('');
              setFilterStatus('');
            },
          }}
        />
      ) : (
        <div className="grid gap-3">
          {filteredOrders.map((order) => {
            const nextStatuses = getNextStatuses(order.status, (order as any).orderType);
            const isUpdating = updatingOrderId === order.id;
            const itemCount = order._count?.items ?? order.items?.length ?? 0;

            const orderType = (order as any).orderType as string | undefined;
            const orderTypeLabel = orderType === 'DELIVERY' ? 'Delivery'
              : orderType === 'TAKE_AWAY' ? 'Retira en local'
              : orderType === 'DINE_IN' ? 'En mesa'
              : null;
            const items = (order.items || []) as any[];
            const primaryNext = nextStatuses[0];
            const cancelNext = nextStatuses.find((s) => s === 'CANCELLED');
            const otherNexts = nextStatuses.filter((s) => s !== primaryNext && s !== 'CANCELLED');
            const primaryLabel = primaryNext === 'CONFIRMED' ? 'Aceptar pedido'
              : primaryNext === 'READY' ? '🛵 Marcar listo para entrega'
              : primaryNext === 'DELIVERED' ? 'Marcar entregado'
              : primaryNext ? STATUS_CONFIG[primaryNext]?.label : null;

            return (
              <Card key={order.id} className="group transition-all hover:shadow-md">
                <CardContent className="p-0">
                  {/* ── MOBILE LAYOUT (sm and below) ── */}
                  <div className="md:hidden flex flex-col gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">#{order.orderNumber}</h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="font-medium text-foreground">{order.customerName}</span>
                          {order.customerPhone && <span>{order.customerPhone}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          <span>{format(new Date(order.createdAt), 'dd/MM HH:mm', { locale: es })}</span>
                          {orderTypeLabel && <span>· {orderTypeLabel}</span>}
                          {itemCount > 0 && <span>· {itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-base">{formatPrice(order.total)}</p>
                        {order.shippingCost > 0 && (
                          <p className="text-[10px] text-muted-foreground">+{formatPrice(order.shippingCost)} envío</p>
                        )}
                      </div>
                    </div>

                    {(order as any).deliveryToken && ['READY', 'SHIPPED', 'ARRIVED'].includes(order.status) && (
                      <DeliveryAssignBlock
                        order={order}
                        deliveryStaff={deliveryStaff}
                        onAssign={handleAssignDelivery}
                      />
                    )}

                    {nextStatuses.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 w-full" disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>Cambiar estado <ChevronDown className="h-3.5 w-3.5" /></>}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {nextStatuses.map((ns) => (
                            <DropdownMenuItem key={ns} onClick={() => handleStatusChange(order.id, ns)}>
                              <span className={`h-2 w-2 rounded-full mr-2 ${STATUS_CONFIG[ns]?.color || 'bg-gray-400'}`} />
                              {STATUS_CONFIG[ns]?.label || ns}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* ── DESKTOP / TABLET LAYOUT (md+) ── */}
                  <div className="hidden md:grid md:grid-cols-[1.4fr_2fr_auto] md:gap-5 lg:gap-6 md:p-5 lg:p-6">
                    {/* ── Left: customer + meta ── */}
                    <div className="flex flex-col gap-2 min-w-0 pr-5 lg:pr-6 border-r border-slate-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base">#{order.orderNumber}</h3>
                        <StatusBadge status={order.status} />
                        {orderTypeLabel && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            orderType === 'DELIVERY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : orderType === 'TAKE_AWAY' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {orderType === 'DELIVERY' ? '🛵' : orderType === 'TAKE_AWAY' ? '🛍️' : '🍽️'} {orderTypeLabel}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-foreground truncate">{order.customerName}</p>
                        {order.customerPhone && (
                          <a href={`tel:${order.customerPhone}`} className="text-xs text-muted-foreground hover:text-foreground block truncate">
                            📱 {order.customerPhone}
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground">
                          🕐 {format(new Date(order.createdAt), "dd 'de' MMM, HH:mm", { locale: es })}
                        </p>
                      </div>

                      <div className="mt-auto pt-2">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total</p>
                        <p className="font-bold text-2xl text-foreground tabular-nums leading-tight">{formatPrice(order.total)}</p>
                        {order.shippingCost > 0 && (
                          <p className="text-[11px] text-muted-foreground">incluye {formatPrice(order.shippingCost)} de envío</p>
                        )}
                      </div>
                    </div>

                    {/* ── Center: items detail ── */}
                    <div className="min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Detalle del pedido
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
                        </span>
                      </div>
                      {items.length > 0 ? (
                        <ul className="space-y-1.5">
                          {items.map((it: any) => {
                            let parsedOpts: any[] = [];
                            try {
                              if (it.options) {
                                const o = typeof it.options === 'string' ? JSON.parse(it.options) : it.options;
                                if (Array.isArray(o)) parsedOpts = o;
                              }
                            } catch { /* ignore */ }
                            return (
                              <li key={it.id} className="flex items-start justify-between gap-3 text-sm">
                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-neutral-300 tabular-nums shrink-0">
                                    {it.quantity}×
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-foreground font-medium leading-snug">{it.productName}</p>
                                    {it.variantName && (
                                      <p className="text-[11px] text-muted-foreground">{it.variantName}</p>
                                    )}
                                    {parsedOpts.length > 0 && (
                                      <p className="text-[11px] text-muted-foreground">{parsedOpts.map((o) => o.value).join(' · ')}</p>
                                    )}
                                    {it.itemNotes && (
                                      <p className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">&ldquo;{it.itemNotes}&rdquo;</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground tabular-nums shrink-0 mt-0.5">
                                  {formatPrice(Number(it.totalPrice ?? it.unitPrice * it.quantity))}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Sin detalle de productos</p>
                      )}

                      {(order as any).notes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                          <p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold mb-0.5">Nota del cliente</p>
                          <p className="text-xs text-amber-800 dark:text-amber-300">{(order as any).notes}</p>
                        </div>
                      )}
                    </div>

                    {/* ── Right: actions ── */}
                    <div className="flex flex-col items-end justify-between gap-2 w-[180px]">
                      {primaryNext && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(order.id, primaryNext)}
                          disabled={isUpdating}
                          className={`h-9 px-3 text-xs font-semibold shadow-sm w-full ${
                            primaryNext === 'CONFIRMED' ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : primaryNext === 'READY' ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : primaryNext === 'DELIVERED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : ''
                          }`}
                        >
                          {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : primaryLabel}
                        </Button>
                      )}

                      {(order as any).deliveryToken && ['READY', 'SHIPPED', 'ARRIVED'].includes(order.status) && (
                        <div className="flex justify-end">
                          <DeliveryAssignBlock
                            order={order}
                            deliveryStaff={deliveryStaff}
                            onAssign={handleAssignDelivery}
                          />
                        </div>
                      )}

                      {(otherNexts.length > 0 || cancelNext) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 h-8 px-2.5 text-xs w-full" disabled={isUpdating}>
                              Más acciones <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {otherNexts.map((ns) => (
                              <DropdownMenuItem key={ns} onClick={() => handleStatusChange(order.id, ns)}>
                                <span className={`h-2 w-2 rounded-full mr-2 ${STATUS_CONFIG[ns]?.color || 'bg-gray-400'}`} />
                                {STATUS_CONFIG[ns]?.label || ns}
                              </DropdownMenuItem>
                            ))}
                            {cancelNext && (
                              <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="text-red-600">
                                <span className="h-2 w-2 rounded-full mr-2 bg-red-500" />
                                Cancelar pedido
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            P&aacute;gina {page} de {totalPages} ({total} pedidos)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
