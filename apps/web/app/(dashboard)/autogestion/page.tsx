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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createApiClient, type Booking, type Service, type Employee, type Tenant, type Schedule } from '@/lib/api';
import { notifications, errorNotifications } from '@/lib/notifications';
import { DayNavigator } from '@/components/autogestion/day-navigator';
import { AgendaTimeline } from '@/components/autogestion/agenda-timeline';
import { BookingDetailDialog } from '@/components/autogestion/booking-detail-dialog';
import { NewBookingSheet } from '@/components/autogestion/new-booking-sheet';

export default function AutogestionPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [prefillTime, setPrefillTime] = useState<string | null>(null);
  const [quickMode, setQuickMode] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBookings = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await api.getBookings({ date: dateStr });
      const arr = Array.isArray(data) ? data : (data?.data || []);
      setBookings(arr as Booking[]);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, date]);

  // Load bookings when date changes
  useEffect(() => {
    if (mounted) loadBookings();
  }, [mounted, loadBookings]);

  // Load services, employees, tenant once
  useEffect(() => {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken as string);

    api.getServices().then(setServices).catch(() => {});
    api.getEmployees().then(setEmployees).catch(() => {});
    api.getTenant().then(setTenant).catch(() => {});
    api.getSchedules().then(setSchedules).catch(() => {});
  }, [session?.accessToken]);

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
    notifications.bookingCreated();
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
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

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
                <CalendarCheck className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Autogestión</h1>
                <p className="text-white/70 text-sm hidden md:block">Creá y gestioná turnos directamente</p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* "Atender Ahora" button */}
              <Button
                size="sm"
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30 border border-white/30 h-9 md:h-10"
                onClick={handleAtenderAhora}
              >
                <Zap className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Atender Ahora</span>
              </Button>
              {/* "Nuevo Turno" button */}
              <Button
                size="sm"
                className="bg-white text-teal-700 hover:bg-white/90 shadow-lg h-9 md:h-10"
                onClick={() => handleNewBooking()}
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Nuevo Turno</span>
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
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{pendingCount}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Pendientes</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{confirmedCount}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Confirmados</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{completedCount}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Completados</p>
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

      {/* Agenda */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-teal-100 dark:border-teal-900" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando turnos...</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <AgendaTimeline
              bookings={bookings}
              date={date}
              onBookingClick={setSelectedBooking}
              onSlotClick={(time) => handleNewBooking(time)}
              scheduleStart={scheduleStart}
              scheduleEnd={scheduleEnd}
            />
          </CardContent>
        </Card>
      )}

      {/* Booking Detail Dialog */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        tenantAddress={tenant?.address || undefined}
        tenantCity={tenant?.city || undefined}
      />

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
