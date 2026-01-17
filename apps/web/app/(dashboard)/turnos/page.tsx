'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Sparkles,
  Phone,
  X,
  User,
  Scissors,
  MapPin,
  MessageSquare,
  CalendarDays,
  LayoutGrid,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createApiClient } from '@/lib/api';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  service: { id: string; name: string; duration: number; price?: number };
  customer: { id: string; name: string; phone: string; email?: string };
}

type ViewMode = 'week' | 'month';

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ElementType; label: string; dot: string }> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertCircle,
    label: 'Pendiente',
    dot: 'bg-amber-500'
  },
  CONFIRMED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CheckCircle2,
    label: 'Confirmado',
    dot: 'bg-blue-500'
  },
  COMPLETED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    label: 'Completado',
    dot: 'bg-emerald-500'
  },
  CANCELLED: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
    label: 'Cancelado',
    dot: 'bg-red-500'
  },
  NO_SHOW: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: XCircle,
    label: 'No asistió',
    dot: 'bg-slate-500'
  },
};

export default function TurnosPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Calculate date ranges based on view mode
  const getDateRange = () => {
    if (viewMode === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      const api = createApiClient(session.accessToken as string);
      api
        .getBookings({
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        })
        .then((data) => {
          const bookingsArray = Array.isArray(data) ? data : (data?.data || []);
          setBookings(bookingsArray as Booking[]);
        })
        .catch(() => {
          setBookings([]);
        })
        .finally(() => setLoading(false));
    }
  }, [session, currentDate, viewMode]);

  const handleStatusChange = async (bookingId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW') => {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken as string);
    await api.updateBookingStatus(bookingId, newStatus);
    const data = await api.getBookings({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
    const bookingsArray = Array.isArray(data) ? data : (data?.data || []);
    setBookings(bookingsArray as Booking[]);
    if (selectedBooking?.id === bookingId) {
      const updated = bookingsArray.find((b: Booking) => b.id === bookingId);
      if (updated) setSelectedBooking(updated);
    }
  };

  const navigatePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getBookingsForDay = (day: Date) => {
    return bookings
      .filter((b) => format(new Date(b.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Stats
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalPeriod = bookings.length;

  // Generate days for current view
  const days = viewMode === 'week'
    ? Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
    : eachDayOfInterval({ start: startOfWeek(startDate, { weekStartsOn: 1 }), end: endOfWeek(endDate, { weekStartsOn: 1 }) });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 md:p-6 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Turnos</h1>
                <p className="text-white/70 text-sm hidden md:block">Gestiona los turnos de tu negocio</p>
              </div>
            </div>
            <Button size="sm" className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg h-9 md:h-10">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Nuevo Turno</span>
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold">{totalPeriod}</p>
              <p className="text-white/70 text-[10px] md:text-xs">{viewMode === 'week' ? 'Esta Semana' : 'Este Mes'}</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold">{pendingCount}</p>
              <p className="text-white/70 text-[10px] md:text-xs">Pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold">{confirmedCount}</p>
              <p className="text-white/70 text-[10px] md:text-xs">Confirmados</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold">{completedCount}</p>
              <p className="text-white/70 text-[10px] md:text-xs">Completados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & View Toggle */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center justify-between gap-2">
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Semana</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Mes</span>
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={navigatePrev} className="h-9 w-9 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[140px] md:min-w-[180px]">
                <p className="font-semibold text-sm md:text-base">
                  {viewMode === 'week'
                    ? `${format(startDate, "d MMM", { locale: es })} - ${format(endDate, "d MMM", { locale: es })}`
                    : format(currentDate, "MMMM yyyy", { locale: es })
                  }
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={navigateNext} className="h-9 w-9 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Today Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="hidden sm:flex h-9"
            >
              Hoy
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando turnos...</p>
        </div>
      ) : (
        <>
          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <>
              {/* Mobile: Day Pills + List */}
              <div className="md:hidden space-y-3">
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                  {days.map((day) => {
                    const dayBookings = getBookingsForDay(day);
                    const dayIsToday = isToday(day);
                    const isSelected = selectedDay ? isSameDay(selectedDay, day) : dayIsToday;

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(day)}
                        className={`flex flex-col items-center min-w-[52px] px-3 py-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <span className={`text-[10px] uppercase font-medium ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {format(day, 'EEE', { locale: es })}
                        </span>
                        <span className="text-lg font-bold">{format(day, 'd')}</span>
                        {dayBookings.length > 0 && (
                          <span className={`text-[10px] font-medium ${isSelected ? 'text-white/90' : 'text-indigo-600'}`}>
                            {dayBookings.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Bookings List */}
                <div className="space-y-2">
                  {(() => {
                    const activeDay = selectedDay || days.find(d => isToday(d)) || days[0];
                    const dayBookings = getBookingsForDay(activeDay);

                    if (dayBookings.length === 0) {
                      return (
                        <Card className="border-0 shadow-sm">
                          <CardContent className="py-10 text-center">
                            <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Sin turnos para este día</p>
                          </CardContent>
                        </Card>
                      );
                    }

                    return dayBookings.map((booking) => {
                      const config = statusConfig[booking.status] || statusConfig.PENDING;
                      return (
                        <Card
                          key={booking.id}
                          className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${config.bg}`}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-center shrink-0 w-14">
                                <p className="text-lg font-bold">{booking.startTime}</p>
                                <p className="text-[10px] text-muted-foreground">{booking.service.duration} min</p>
                              </div>
                              <div className={`w-1 self-stretch rounded-full ${config.dot}`} />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{booking.customer.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{booking.service.name}</p>
                              </div>
                              <Badge className={`${config.bg} ${config.text} border-0 text-[10px] shrink-0`}>
                                {config.label}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Desktop: Week Grid */}
              <div className="hidden md:grid md:grid-cols-7 gap-2">
                {days.map((day) => {
                  const dayBookings = getBookingsForDay(day);
                  const dayIsToday = isToday(day);

                  return (
                    <Card
                      key={day.toISOString()}
                      className={`border-0 shadow-sm overflow-hidden ${dayIsToday ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                      <CardHeader className={`p-2 ${dayIsToday ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>
                        <div className="text-center">
                          <span className={`text-[10px] uppercase ${dayIsToday ? 'text-white/80' : 'text-slate-500'}`}>
                            {format(day, 'EEE', { locale: es })}
                          </span>
                          <p className="text-xl font-bold">{format(day, 'd')}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-1.5 space-y-1 min-h-[180px] max-h-[300px] overflow-y-auto">
                        {dayBookings.length === 0 ? (
                          <div className="flex items-center justify-center h-20 text-slate-400">
                            <span className="text-xs">Sin turnos</span>
                          </div>
                        ) : (
                          dayBookings.map((booking) => {
                            const config = statusConfig[booking.status] || statusConfig.PENDING;
                            return (
                              <div
                                key={booking.id}
                                onClick={() => setSelectedBooking(booking)}
                                className={`p-2 rounded-lg ${config.bg} border ${config.border} cursor-pointer hover:shadow-md transition-all`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock className="h-3 w-3 text-slate-500" />
                                  <span className="text-xs font-semibold">{booking.startTime}</span>
                                  <div className={`ml-auto h-2 w-2 rounded-full ${config.dot}`} />
                                </div>
                                <p className="text-xs font-medium truncate">{booking.customer.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{booking.service.name}</p>
                              </div>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-2 md:p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName) => (
                    <div key={dayName} className="text-center text-xs font-medium text-slate-500 py-2">
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day) => {
                    const dayBookings = getBookingsForDay(day);
                    const dayIsToday = isToday(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => {
                          setSelectedDay(day);
                          setViewMode('week');
                          setCurrentDate(day);
                        }}
                        className={`
                          min-h-[80px] md:min-h-[100px] p-1 md:p-2 rounded-lg border cursor-pointer transition-all
                          ${dayIsToday ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-100 hover:border-slate-300'}
                          ${!isCurrentMonth ? 'opacity-40' : ''}
                        `}
                      >
                        <div className={`text-right text-sm font-medium mb-1 ${dayIsToday ? 'text-indigo-600' : ''}`}>
                          {format(day, 'd')}
                        </div>

                        {/* Booking indicators */}
                        <div className="space-y-0.5">
                          {dayBookings.slice(0, 3).map((booking) => {
                            const config = statusConfig[booking.status] || statusConfig.PENDING;
                            return (
                              <div
                                key={booking.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.text} truncate hidden md:block`}
                              >
                                {booking.startTime} {booking.customer.name.split(' ')[0]}
                              </div>
                            );
                          })}
                          {dayBookings.length > 0 && (
                            <div className="md:hidden flex gap-0.5 flex-wrap">
                              {dayBookings.slice(0, 4).map((booking) => {
                                const config = statusConfig[booking.status] || statusConfig.PENDING;
                                return (
                                  <div key={booking.id} className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                );
                              })}
                            </div>
                          )}
                          {dayBookings.length > 3 && (
                            <div className="text-[10px] text-slate-500 hidden md:block">
                              +{dayBookings.length - 3} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBooking(null)}>
          <Card className="w-full max-w-md border-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Detalle del Turno</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(null)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Badge */}
              {(() => {
                const config = statusConfig[selectedBooking.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                return (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} ${config.text}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="font-medium">{config.label}</span>
                  </div>
                );
              })()}

              {/* Date & Time */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold">{format(new Date(selectedBooking.date), "EEEE d 'de' MMMM", { locale: es })}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedBooking.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.customer.phone}</p>
                </div>
              </div>

              {/* Service */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedBooking.service.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.service.duration} minutos</p>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                {/* Contact buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`https://wa.me/${selectedBooking.customer.phone.replace(/\D/g, '')}`, '_blank')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`tel:${selectedBooking.customer.phone}`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2 text-blue-600" />
                    Llamar
                  </Button>
                </div>

                {/* Status change buttons */}
                {selectedBooking.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleStatusChange(selectedBooking.id, 'CONFIRMED')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmar
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-violet-500 hover:bg-violet-600"
                      onClick={() => handleStatusChange(selectedBooking.id, 'COMPLETED')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Marcar Completado
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                      onClick={() => handleStatusChange(selectedBooking.id, 'NO_SHOW')}
                    >
                      No asistió
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
