'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  CalendarDays,
  TrendingUp,
  Loader2,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';

type ViewMode = 'day' | 'week' | 'month';

interface AgendaStats {
  today: number;
  week: number;
  month: number;
  completedRate: number;
  nextBooking: {
    id: string;
    date: string;
    startTime: string;
    service: { name: string };
    customer: { name: string };
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' },
  COMPLETED: { label: 'Completado', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' },
  NO_SHOW: { label: 'No asistió', color: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(time: string) {
  return time.substring(0, 5);
}

export default function AgendaPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<AgendaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const getDateRange = useCallback(() => {
    const d = new Date(currentDate);
    let from: Date, to: Date;

    if (viewMode === 'day') {
      from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    } else if (viewMode === 'week') {
      const dayOfWeek = d.getDay();
      from = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek);
      to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7);
    } else {
      from = new Date(d.getFullYear(), d.getMonth(), 1);
      to = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  }, [currentDate, viewMode]);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken);
      const range = getDateRange();
      const params: Record<string, string> = { ...range };
      if (statusFilter) params.status = statusFilter;

      const [bookingsData, statsData] = await Promise.all([
        api.employeePortal.getAgenda(params),
        api.employeePortal.getAgendaStats(),
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, getDateRange, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const getDateLabel = () => {
    if (viewMode === 'day') return formatDate(currentDate.toISOString());
    if (viewMode === 'week') {
      const range = getDateRange();
      const from = new Date(range.from);
      const to = new Date(range.to);
      to.setDate(to.getDate() - 1);
      return `${from.getDate()}/${from.getMonth() + 1} - ${to.getDate()}/${to.getMonth() + 1}`;
    }
    return currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  };

  // Group bookings by date
  const groupedBookings = bookings.reduce<Record<string, any[]>>((acc, b) => {
    const dateKey = b.date.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Agenda</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestiona tus turnos y reservas</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.today}</p>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.week}</p>
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedRate}%</p>
                  <p className="text-xs text-muted-foreground">Tasa completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {stats.nextBooking && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Próximo turno</p>
                <p className="font-semibold text-sm truncate">{stats.nextBooking.customer?.name || 'Sin cliente'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(stats.nextBooking.startTime)} · {stats.nextBooking.service?.name}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm capitalize ml-2">{getDateLabel()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="day" className="text-xs px-3 h-7">Día</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-7">Semana</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-7">Mes</TabsTrigger>
            </TabsList>
          </Tabs>

          <select
            className="h-8 text-xs border rounded-md px-2 bg-background"
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="CONFIRMED">Confirmados</option>
            <option value="COMPLETED">Completados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Bookings */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg mb-1">Sin turnos</h3>
            <p className="text-muted-foreground text-sm">No hay turnos para este período</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBookings)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayBookings]) => (
              <div key={date}>
                {viewMode !== 'day' && (
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 capitalize">
                    {formatDate(date)} · {dayBookings.length} turno{dayBookings.length !== 1 ? 's' : ''}
                  </h3>
                )}
                <div className="space-y-2">
                  {dayBookings.map((booking: any) => {
                    const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                    return (
                      <Card key={booking.id} className={cn('border', statusCfg.bg)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="font-semibold text-sm">
                                  {formatTime(booking.startTime)}
                                  {booking.endTime && ` - ${formatTime(booking.endTime)}`}
                                </span>
                                <Badge variant="outline" className={cn('text-[10px] h-5', statusCfg.color)}>
                                  {statusCfg.label}
                                </Badge>
                              </div>
                              <p className="font-medium truncate">{booking.service?.name || 'Servicio'}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground truncate">
                                  {booking.customer?.name || 'Sin cliente'}
                                </span>
                                {booking.customer?.phone && (
                                  <a href={`tel:${booking.customer.phone}`} className="ml-1">
                                    <Phone className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {booking.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                  onClick={async () => {
                                    try {
                                      if (!session?.accessToken) return;
                                      const api = createApiClient(session.accessToken);
                                      await api.updateBookingStatus(booking.id, 'CONFIRMED');
                                      fetchData();
                                    } catch (error) {
                                      handleApiError(error);
                                    }
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Confirmar
                                </Button>
                              )}
                              {booking.status === 'CONFIRMED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                  onClick={async () => {
                                    try {
                                      if (!session?.accessToken) return;
                                      const api = createApiClient(session.accessToken);
                                      await api.updateBookingStatus(booking.id, 'COMPLETED');
                                      fetchData();
                                    } catch (error) {
                                      handleApiError(error);
                                    }
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completar
                                </Button>
                              )}
                              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={async () => {
                                    try {
                                      if (!session?.accessToken || !confirm('¿Cancelar este turno?')) return;
                                      const api = createApiClient(session.accessToken);
                                      await api.cancelBooking(booking.id);
                                      fetchData();
                                    } catch (error) {
                                      handleApiError(error);
                                    }
                                  }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
