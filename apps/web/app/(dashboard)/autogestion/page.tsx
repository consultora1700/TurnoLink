'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarCheck,
  Plus,
  Layers,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  ShoppingBag,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createApiClient, type Booking, type Service, type Product, type Employee, type Tenant, type Schedule, type Order } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { notifications, errorNotifications } from '@/lib/notifications';
import { DayNavigator } from '@/components/autogestion/day-navigator';
import { AgendaTimeline } from '@/components/autogestion/agenda-timeline';
import { BookingDetailDialog } from '@/components/autogestion/booking-detail-dialog';
import { OrderDetailSheet } from '@/components/autogestion/order-detail-sheet';
import { SaleReceipt } from '@/components/autogestion/sale-receipt';
import { NewBookingSheet } from '@/components/autogestion/new-booking-sheet';
import { useRubroTerms, useTenantConfig } from '@/contexts/tenant-config-context';
import { isMercadoRubro } from '@/lib/rubro-attributes';
import { bookingGender } from '@/lib/tenant-config';

export default function AutogestionPage() {
  const { data: session } = useSession();
  const terms = useRubroTerms();
  const { rubro } = useTenantConfig();
  const isMercado = isMercadoRubro(rubro);
  const gender = bookingGender(terms);
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [prefillTime, setPrefillTime] = useState<string | null>(null);
  const [quickMode, setQuickMode] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [dayOrders, setDayOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBookings = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const dateStr = format(date, 'yyyy-MM-dd');
      if (isMercado) {
        // Load orders for the day
        const res = await api.getOrders(undefined, 1, 100, dateStr);
        setDayOrders(res.data);
        setBookings([]);
      } else {
        const data = await api.getBookings({ date: dateStr });
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setBookings(arr as Booking[]);
        setDayOrders([]);
      }
    } catch {
      setBookings([]);
      setDayOrders([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, date, isMercado]);

  // Load bookings/orders when date changes
  useEffect(() => {
    if (mounted) loadBookings();
  }, [mounted, loadBookings]);

  // Load services, employees, tenant once
  useEffect(() => {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken as string);

    if (isMercado) {
      api.getProducts().then(setProducts).catch(() => {});
    } else {
      api.getServices().then(setServices).catch(() => {});
    }
    api.getEmployees().then(setEmployees).catch(() => {});
    api.getTenant().then(setTenant).catch(() => {});
    api.getSchedules().then(setSchedules).catch(() => {});
  }, [session?.accessToken, isMercado]);

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateBookingStatus(bookingId, newStatus);

      switch (newStatus) {
        case 'CONFIRMED': notifications.bookingConfirmed(); break;
        case 'COMPLETED': notifications.bookingCompleted(); break;
        case 'CANCELLED': notifications.bookingCancelled(); break;
      }

      // Reload and update selected
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await api.getBookings({ date: dateStr });
      const arr = (Array.isArray(data) ? data : (data?.data || [])) as Booking[];
      setBookings(arr);

      if (selectedBooking?.id === bookingId) {
        const updated = arr.find((b) => b.id === bookingId);
        setSelectedBooking(updated || null);
      }
    } catch {
      errorNotifications.saveFailed();
    }
  };

  const handleNewBooking = (prefillTimeSlot?: string) => {
    setPrefillTime(prefillTimeSlot || null);
    setQuickMode(false);
    setShowNewSheet(true);
  };

  const handleAtenderAhora = () => {
    if (!isToday(date)) setDate(new Date());
    setQuickMode(true);
    setPrefillTime(null);
    setShowNewSheet(true);
  };

  const handleBookingCreated = () => {
    if (isMercado) {
      notifications.saleCreated();
    } else {
      notifications.bookingCreated();
    }
    loadBookings();
  };

  // Compute schedule range for selected day
  const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const daySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  const scheduleStart = daySchedule ? parseInt(daySchedule.startTime.split(':')[0], 10) : 8;
  const scheduleEnd = daySchedule
    ? Math.min(parseInt(daySchedule.endTime.split(':')[0], 10), 23)
    : 21;

  // Stats
  const totalCount = isMercado ? dayOrders.length : bookings.length;
  const pendingCount = isMercado
    ? dayOrders.filter((o) => o.status === 'PENDING').length
    : bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = isMercado
    ? dayOrders.filter((o) => o.status === 'CONFIRMED' || o.status === 'DELIVERED').length
    : bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedCount = isMercado
    ? dayOrders.filter((o) => o.status === 'DELIVERED').length
    : bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalSold = isMercado
    ? dayOrders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + Number(o.total ?? 0), 0)
    : 0;

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-100" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-teal-600 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando autogestión...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-4 md:p-6 text-white">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                {isMercado ? <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" /> : <CalendarCheck className="h-5 w-5 md:h-6 md:w-6" />}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{isMercado ? 'Ventas del Día' : 'Autogestión'}</h1>
                <p className="text-white/70 text-sm hidden md:block">{isMercado ? 'Registrá y gestioná ventas presenciales' : `Creá y gestioná ${terms.bookingPlural.toLowerCase()} directamente`}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* "Atender Ahora" button — only for services (mercado has single "Nueva Venta" button) */}
              {!isMercado && (
                <Button
                  size="sm"
                  className="bg-white/20 backdrop-blur text-white hover:bg-white/30 border border-white/30 h-9 md:h-10"
                  onClick={handleAtenderAhora}
                >
                  <Zap className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Atender Ahora</span>
                </Button>
              )}
              {/* "Nueva Venta" / "Nuevo Turno" button */}
              <Button
                size="sm"
                className="bg-white text-teal-700 hover:bg-white/90 shadow-lg h-9 md:h-10"
                onClick={() => handleNewBooking()}
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{isMercado ? 'Nueva Venta' : `Nuev${gender.suffix} ${terms.bookingSingular}`}</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 pt-4 border-t border-white/20">
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{totalCount}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">{isMercado ? 'Ventas' : 'Total'}</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                {isMercado ? (
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                ) : (
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                )}
                <p className={`${isMercado ? 'text-base sm:text-lg md:text-xl' : 'text-xl sm:text-2xl md:text-3xl'} font-bold`}>
                  {isMercado ? formatPrice(totalSold) : pendingCount}
                </p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">{isMercado ? 'Vendido' : 'Pendientes'}</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{confirmedCount}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">{isMercado ? 'Entregadas' : `Confirmad${gender.suffix}s`}</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{isMercado ? pendingCount : completedCount}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">{isMercado ? 'Pendientes' : `Completad${gender.suffix}s`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Day Navigator */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <DayNavigator date={date} onDateChange={setDate} />
        </CardContent>
      </Card>

      {/* Agenda / Orders list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-teal-100 dark:border-teal-900" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando {isMercado ? 'ventas' : terms.bookingPlural.toLowerCase()}...</p>
        </div>
      ) : isMercado ? (
        /* ─── Orders list for mercado ─── */
        dayOrders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 md:p-10">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-neutral-800 dark:to-neutral-800/50 flex items-center justify-center mb-4 shadow-sm">
                  <ShoppingBag className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="font-semibold text-foreground">Sin ventas este día</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">Registrá tu primera venta del día con el botón de arriba</p>
                <Button
                  size="sm"
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => handleNewBooking()}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nueva Venta
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {dayOrders.map((order, index) => {
              const itemCount = order._count?.items ?? order.items?.length ?? 0;
              const statusConfig: Record<string, { label: string; dotColor: string; bgHover: string }> = {
                PENDING: { label: 'Pendiente', dotColor: 'bg-amber-500', bgHover: 'hover:border-amber-200 dark:hover:border-amber-800' },
                CONFIRMED: { label: 'Confirmado', dotColor: 'bg-blue-500', bgHover: 'hover:border-blue-200 dark:hover:border-blue-800' },
                SHIPPED: { label: 'Enviado', dotColor: 'bg-indigo-500', bgHover: 'hover:border-indigo-200 dark:hover:border-indigo-800' },
                DELIVERED: { label: 'Entregado', dotColor: 'bg-emerald-500', bgHover: 'hover:border-emerald-200 dark:hover:border-emerald-800' },
                CANCELLED: { label: 'Cancelado', dotColor: 'bg-red-500', bgHover: 'hover:border-red-200 dark:hover:border-red-800' },
              };
              const sc = statusConfig[order.status] || { label: order.status, dotColor: 'bg-gray-400', bgHover: '' };
              const time = format(new Date(order.createdAt), 'HH:mm');
              const isPOS = order.notes?.startsWith('[POS]');
              const isCancelled = order.status === 'CANCELLED';

              return (
                <Card
                  key={order.id}
                  className={`border shadow-sm cursor-pointer transition-all duration-200 active:scale-[0.98] ${sc.bgHover} ${isCancelled ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <CardContent className="p-3.5 md:p-4">
                    <div className="flex items-start gap-3">
                      {/* Status indicator line */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <div className={`h-2.5 w-2.5 rounded-full ${sc.dotColor} ring-4 ring-opacity-20 ${sc.dotColor.replace('bg-', 'ring-')}`} />
                        <div className="w-px flex-1 bg-slate-200 dark:bg-neutral-700 min-h-[24px]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row: order number + status + time */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-sm">{order.orderNumber}</span>
                            <span className={`text-[11px] font-semibold ${sc.dotColor.replace('bg-', 'text-').replace('-500', '-600')} dark:${sc.dotColor.replace('bg-', 'text-').replace('-500', '-400')}`}>
                              {sc.label}
                            </span>
                            {isPOS && (
                              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-1.5 py-0.5 rounded">
                                POS
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{time} hs</span>
                        </div>

                        {/* Customer + items */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {order.customerName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="text-sm text-foreground truncate">{order.customerName}</span>
                          {itemCount > 0 && (
                            <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                            </span>
                          )}
                        </div>

                        {/* Bottom: total */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                          <span className="text-xs text-muted-foreground">Total</span>
                          <span className={`text-base font-bold ${isCancelled ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* ─── Agenda timeline for services ─── */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <AgendaTimeline
              bookings={bookings}
              date={date}
              onBookingClick={setSelectedBooking}
              onSlotClick={(time) => handleNewBooking(time)}
              scheduleStart={scheduleStart}
              scheduleEnd={scheduleEnd}
              isMercado={isMercado}
            />
          </CardContent>
        </Card>
      )}

      {/* Booking Detail Dialog (services only) */}
      {!isMercado && (
        <BookingDetailDialog
          booking={selectedBooking}
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          tenantAddress={tenant?.address || undefined}
          tenantCity={tenant?.city || undefined}
        />
      )}

      {/* Order Detail Sheet (mercado only) */}
      {isMercado && session?.accessToken && (
        <OrderDetailSheet
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          accessToken={session.accessToken as string}
          onStatusChange={loadBookings}
          onShowReceipt={(order) => setReceiptOrder(order)}
        />
      )}

      {/* Sale Receipt — rendered at page level, outside any Sheet/portal */}
      {receiptOrder && session?.accessToken && (
        <SaleReceipt
          order={receiptOrder}
          open={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          accessToken={session.accessToken as string}
        />
      )}

      {/* New Booking Sheet */}
      {showNewSheet && session?.accessToken && (
        <NewBookingSheet
          open={showNewSheet}
          onClose={() => {
            setShowNewSheet(false);
            setPrefillTime(null);
            setQuickMode(false);
          }}
          api={createApiClient(session.accessToken as string)}
          services={services}
          products={products}
          isMercado={isMercado}
          employees={employees}
          initialDate={date}
          initialTime={prefillTime}
          quickMode={quickMode}
          onCreated={handleBookingCreated}
        />
      )}
    </div>
  );
}
