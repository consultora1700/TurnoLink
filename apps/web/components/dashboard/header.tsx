'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Bell, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { DashboardThemeToggle } from './dashboard-theme-wrapper';
import { createApiClient } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentBooking {
  id: string;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  createdAt: string;
  status: string;
}

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

function NotificationsBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<RecentBooking[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      const api = createApiClient(session.accessToken as string);
      const bookings = await api.getRecentBookings?.() || [];

      // Count new bookings since last check
      const newBookings = bookings.filter((b: RecentBooking) =>
        new Date(b.createdAt) > lastChecked
      );

      setNotifications(bookings.slice(0, 5));
      if (!isOpen) {
        setUnreadCount(prev => prev + newBookings.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [session?.accessToken, lastChecked, isOpen]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new bookings
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setUnreadCount(0);
      setLastChecked(new Date());
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-teal-500 to-teal-500 text-white rounded-full border-2 border-background animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-xl border-0 overflow-hidden" align="end">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
          <h4 className="font-semibold text-primary-foreground flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Nuevas Reservas
          </h4>
          <p className="text-xs text-primary-foreground/70 mt-1">
            {notifications.length > 0
              ? `${notifications.length} turnos recientes`
              : 'Sin nuevas reservas'
            }
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto bg-background">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No hay turnos recientes</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Las nuevas reservas aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((booking) => (
                <Link
                  key={booking.id}
                  href="/turnos"
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-all group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-lg font-bold text-primary">
                      {booking.customerName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{booking.customerName}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium flex-shrink-0">
                        Nuevo
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{booking.serviceName}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{booking.startTime}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(booking.createdAt), {
                        addSuffix: true,
                        locale: es
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-muted/30">
          <Link href="/turnos" onClick={() => setIsOpen(false)}>
            <Button variant="default" size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90">
              <Calendar className="h-4 w-4 mr-2" />
              Ver todos los turnos
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DashboardHeader({ user }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex h-20 items-center justify-between px-4 lg:px-6">
        <div className="lg:hidden flex items-center">
          <Link href="/dashboard">
            <img
              src="/claro2.png"
              alt="TurnoLink"
              className="h-[72px] w-auto dark:hidden"
            />
            <img
              src="/oscuro2.png"
              alt="TurnoLink"
              className="h-[72px] w-auto hidden dark:block"
            />
          </Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <NotificationsBell />
          <DashboardThemeToggle />

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/configuracion">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
