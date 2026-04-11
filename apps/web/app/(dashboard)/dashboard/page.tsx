'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Activity,
  ShoppingBag,
  Package,
  DollarSign,
  BarChart3,
  Tag,
  UtensilsCrossed,
  Wallet,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createApiClient } from '@/lib/api';
import { handleApiError } from '@/lib/notifications';
import { getStatusLabel, getStatusBadgeVariant, cn, parseBookingDate, formatPrice } from '@/lib/utils';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { isMercadoRubro, isGastronomiaRubro } from '@/lib/rubro-attributes';
import { bookingGender } from '@/lib/tenant-config';
import Link from 'next/link';

interface Stats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalCustomers: number;
  upcomingBookings: Booking[];
  recentCustomers: Customer[];
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  status: string;
  createdAt?: string;
  service: { name: string } | null;
  product?: { name: string; price?: number } | null;
  customer: { name: string; phone: string };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBookings: number;
}

interface ProductStats {
  total: number;
  active: number;
  featured: number;
  lowStock: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  };
  return labels[status] || status;
};

const getOrderStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { clientLabelSingular, clientLabelPlural, rubro, storeType } = useTenantConfig();
  const terms = useRubroTerms();
  const gender = bookingGender(terms);
  const isMercado = isMercadoRubro(rubro);
  const isGastro = isGastronomiaRubro(rubro);

  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [gastroStats, setGastroStats] = useState<{
    todayRevenue: number; todaySessionCount: number;
    weekRevenue: number; weekSessionCount: number;
    monthRevenue: number; monthSessionCount: number;
    recentReviews: any[];
  } | null>(null);

  const tenantType = session?.user?.tenantType;
  const isNonBusiness = tenantType === 'PROFESSIONAL';

  // Redirect non-business users (safety net — middleware handles the fast redirect)
  useEffect(() => {
    if (tenantType === 'PROFESSIONAL') {
      router.replace('/mi-perfil');
    }
  }, [tenantType, router]);

  useEffect(() => {
    if (isNonBusiness) return;
    if (session?.accessToken) {
      const api = createApiClient(session.accessToken as string);
      if (isMercado) {
        Promise.all([
          api.getProductStats(),
          api.getOrderStats(),
        ])
          .then(([prodData, ordData]) => {
            setProductStats(prodData as ProductStats);
            setOrderStats(ordData as OrderStats);
          })
          .catch((error) => {
            handleApiError(error);
            setProductStats(null);
            setOrderStats(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (isGastro) {
        Promise.all([
          api.getStats(),
          api.getGastroTables(),
        ])
          .then(([statsData, gastroData]) => {
            setStats(statsData as Stats);
            if (gastroData?.stats) setGastroStats(gastroData.stats);
          })
          .catch((error) => {
            handleApiError(error);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        api.getStats()
          .then((data) => {
            setStats(data as Stats);
          })
          .catch((error) => {
            handleApiError(error);
            setStats(null);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [session, isNonBusiness, isMercado, isGastro]);

  // Don't render business content for non-business users
  if (isNonBusiness || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-teal-600 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-28 sm:w-36 h-28 sm:h-36 bg-white/10 rounded-full blur-xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm font-medium text-white/80 truncate">
              {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {greeting()}, {session?.user?.name?.split(' ')[0] || 'Usuario'}
          </h1>
          <p className="mt-1 text-white/80 text-sm sm:text-base">
            Aquí está el resumen de tu negocio para hoy
          </p>
        </div>
      </div>


      {/* Dashboard content by rubro */}
      {isGastro ? (
        <>
          {/* Gastro Dashboard — Salón + Reservas */}
          <div data-tour="dashboard-stats">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <UtensilsCrossed className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold">Tu Salón</h2>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Hoy</CardTitle>
                  <DollarSign className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold truncate">{formatPrice(gastroStats?.todayRevenue || 0, 'ARS')}</div>
                  <p className="text-xs text-white/70 mt-1">{gastroStats?.todaySessionCount || 0} mesas cerradas</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Esta Semana</CardTitle>
                  <TrendingUp className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold truncate">{formatPrice(gastroStats?.weekRevenue || 0, 'ARS')}</div>
                  <p className="text-xs text-white/70 mt-1">{gastroStats?.weekSessionCount || 0} mesas</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Este Mes</CardTitle>
                  <Wallet className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold truncate">{formatPrice(gastroStats?.monthRevenue || 0, 'ARS')}</div>
                  <p className="text-xs text-white/70 mt-1">{gastroStats?.monthSessionCount || 0} mesas</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Reservas Hoy</CardTitle>
                  <Calendar className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.todayBookings || 0}</div>
                  <p className="text-xs text-white/70 mt-1">{format(new Date(), "EEEE", { locale: es })}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Gastro details: recent reviews + upcoming bookings */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Reviews */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Últimas opiniones
                  </CardTitle>
                  <Link href="/resenas">
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      Ver todas <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {gastroStats?.recentReviews && gastroStats.recentReviews.length > 0 ? (
                  <div className="space-y-3">
                    {gastroStats.recentReviews.map((r: any, i: number) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-sm font-bold text-amber-600">
                          {r.tableNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground line-clamp-2">{r.review}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Mesa {r.tableNumber} · {formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Todavía no hay opiniones</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Próximas reservas
                  </CardTitle>
                  <Link href="/turnos">
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      Ver todas <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {stats?.upcomingBookings && stats.upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {stats.upcomingBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{booking.customer?.name || 'Sin nombre'}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {booking.service?.name || booking.product?.name || 'Reserva'} · {booking.startTime}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(booking.status) as any} className="shrink-0 text-[10px]">
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No hay reservas próximas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : isMercado ? (
        <>
          {/* Stats section: Tu Tienda */}
          <div data-tour="dashboard-stats">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Tu Tienda</h2>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Productos activos</CardTitle>
                  <Package className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{productStats?.active || 0}</div>
                  <p className="text-xs text-white/70 mt-1">de {productStats?.total || 0} totales</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Pedidos pendientes</CardTitle>
                  <Clock className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orderStats?.pendingOrders || 0}</div>
                  <p className="text-xs text-white/70 mt-1">requieren atención</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Pedidos entregados</CardTitle>
                  <TrendingUp className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orderStats?.deliveredOrders || 0}</div>
                  <p className="text-xs text-white/70 mt-1">completados</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Facturación</CardTitle>
                  <DollarSign className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatPrice(orderStats?.totalRevenue || 0)}</div>
                  <p className="text-xs text-white/70 mt-1">ingresos totales</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pedidos Recientes */}
            <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-base">Pedidos Recientes</CardTitle>
                </div>
                <Link href="/pedidos">
                  <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    Ver todos
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {orderStats?.recentOrders && orderStats.recentOrders.length > 0 ? (
                  <div className="divide-y">
                    {orderStats.recentOrders.slice(0, 5).map((order, index) => (
                      <div
                        key={order.id}
                        className={cn(
                          "flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors",
                          index === 0 && "bg-blue-50/30 dark:bg-blue-900/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                            {order.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">
                              #{order.orderNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {formatPrice(order.total)}
                          </p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                              getOrderStatusColor(order.status)
                            )}>
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                              locale: es
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                      <ShoppingBag className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                    </div>
                    <p className="text-muted-foreground">No hay pedidos aún</p>
                    <Link href="/catalogo" className="mt-2">
                      <Button variant="link" size="sm" className="text-primary">
                        Ir a tu catálogo
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen de Stock */}
            <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-base">Resumen de Stock</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium">Productos activos</span>
                    </div>
                    <span className="text-sm font-bold">{productStats?.active || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50/50 dark:bg-violet-900/20">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-sm font-medium">Destacados</span>
                    </div>
                    <span className="text-sm font-bold">{productStats?.featured || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium">Stock bajo</span>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      (productStats?.lowStock || 0) > 0 && "text-red-600 dark:text-red-400"
                    )}>
                      {productStats?.lowStock || 0}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <Link href="/catalogo" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      Ver productos
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/categorias-productos" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      Ver categorías
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/pedidos" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      Ver pedidos
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Resumen de Turnos */}
          <div data-tour="dashboard-stats">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Resumen de {terms.bookingPlural}</h2>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">{terms.bookingPlural} Hoy</CardTitle>
                  <Calendar className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.todayBookings || 0}</div>
                  <p className="text-xs text-white/70 mt-1">
                    {format(new Date(), "EEEE", { locale: es })}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Esta Semana</CardTitle>
                  <TrendingUp className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.weekBookings || 0}</div>
                  <p className="text-xs text-white/70 mt-1">{terms.bookingPlural.toLowerCase()}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Este Mes</CardTitle>
                  <Clock className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.monthBookings || 0}</div>
                  <p className="text-xs text-white/70 mt-1">{terms.bookingPlural.toLowerCase()}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">{clientLabelPlural}</CardTitle>
                  <Users className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalCustomers || 0}</div>
                  <p className="text-xs text-white/70 mt-1">{clientLabelPlural.toLowerCase()} registrados</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Bookings */}
            <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-base">Próxim{gender.suffix}s {terms.bookingPlural}</CardTitle>
                </div>
                <Link href="/turnos">
                  <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    Ver todos
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {stats?.upcomingBookings && stats.upcomingBookings.length > 0 ? (
                  <div className="divide-y">
                    {stats.upcomingBookings.slice(0, 5).map((booking, index) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors",
                          index === 0 && "bg-blue-50/30 dark:bg-blue-900/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                            {booking.customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{booking.customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(booking.service?.name ?? booking.product?.name ?? 'Sin detalle')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(parseBookingDate(booking.date), 'dd/MM')} - {booking.startTime}
                          </p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <Badge variant={getStatusBadgeVariant(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                          {booking.createdAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(booking.createdAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                      <Calendar className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                    </div>
                    <p className="text-muted-foreground">No hay {terms.bookingPlural.toLowerCase()} próxim{gender.suffix}s</p>
                    <Link href="/turnos" className="mt-2">
                      <Button variant="link" size="sm" className="text-primary">
                        Ver calendario de {terms.bookingPlural.toLowerCase()}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-base">{clientLabelPlural} Recientes</CardTitle>
                </div>
                <Link href="/clientes">
                  <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                    Ver todos
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {stats?.recentCustomers && stats.recentCustomers.length > 0 ? (
                  <div className="divide-y">
                    {stats.recentCustomers.map((customer, index) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-white font-medium",
                            index === 0 && "bg-gradient-to-br from-amber-500 to-orange-500",
                            index === 1 && "bg-gradient-to-br from-emerald-500 to-emerald-600",
                            index === 2 && "bg-gradient-to-br from-violet-500 to-violet-600",
                            index > 2 && "bg-gradient-to-br from-slate-400 to-slate-500"
                          )}>
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.phone}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                          {customer.totalBookings} {customer.totalBookings === 1 ? terms.bookingSingular.toLowerCase() : terms.bookingPlural.toLowerCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                    </div>
                    <p className="text-muted-foreground">No hay {clientLabelPlural.toLowerCase()} aún</p>
                    <Link href="/clientes" className="mt-2">
                      <Button variant="link" size="sm" className="text-primary">
                        Agregar primer {clientLabelSingular.toLowerCase()}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

    </div>
  );
}
