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
  Scissors,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createApiClient } from '@/lib/api';
import { getStatusLabel, getStatusBadgeVariant, cn, parseBookingDate } from '@/lib/utils';
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
  service: { name: string };
  customer: { name: string; phone: string };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBookings: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
      api.getStats()
        .then((data) => {
          setStats(data as Stats);
        })
        .catch(() => {
          setStats(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session, isNonBusiness]);

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


      {/* Resumen de Turnos */}
      <div data-tour="dashboard-stats">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Resumen de Turnos</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Turnos Hoy</CardTitle>
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
              <p className="text-xs text-white/70 mt-1">turnos reservados</p>
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
              <p className="text-xs text-white/70 mt-1">turnos reservados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Clientes</CardTitle>
              <Users className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalCustomers || 0}</div>
              <p className="text-xs text-white/70 mt-1">clientes registrados</p>
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
              <CardTitle className="text-base">Próximos Turnos</CardTitle>
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
                          {booking.service.name}
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
                <p className="text-muted-foreground">No hay turnos próximos</p>
                <Link href="/turnos" className="mt-2">
                  <Button variant="link" size="sm" className="text-primary">
                    Ver calendario de turnos
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
              <CardTitle className="text-base">Clientes Recientes</CardTitle>
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
                      {customer.totalBookings} turnos
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-muted-foreground">No hay clientes aún</p>
                <Link href="/clientes" className="mt-2">
                  <Button variant="link" size="sm" className="text-primary">
                    Agregar primer cliente
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Hidden on mobile since they're in bottom nav */}
      <div className="hidden sm:grid gap-4 md:grid-cols-3">
        <Link href="/turnos">
          <Card className="group cursor-pointer border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 bg-blue-50/30 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">Gestionar Turnos</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Ver calendario y reservas</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/servicios">
          <Card className="group cursor-pointer border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Scissors className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">Ver Servicios</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Administrar servicios</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clientes">
          <Card className="group cursor-pointer border-2 border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600 bg-violet-50/30 dark:bg-violet-900/20 hover:bg-violet-50 dark:hover:bg-violet-900/40 transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-violet-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-violet-900 dark:text-violet-100">Ver Clientes</p>
                <p className="text-sm text-violet-600 dark:text-violet-400">Gestionar clientes</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
