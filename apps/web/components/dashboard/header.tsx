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
import { User, LogOut, Settings, Bell, Calendar, Briefcase, Star, Send, Plus, ShoppingBag, Receipt, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { DashboardThemeToggle } from './dashboard-theme-wrapper';
import { usePathname } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGastroAlerts } from '@/lib/gastro-alerts-store';

interface ActivityItem {
  id: string;
  type: 'booking' | 'application' | 'review' | 'proposal_response' | 'new_order' | 'order_paid' | 'bill_requested';
  title: string;
  description: string;
  createdAt: string;
  link: string;
  meta?: Record<string, unknown>;
}

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const activityConfig: Record<string, { icon: typeof Calendar; color: string; bgColor: string; badge: string; badgeClass: string }> = {
  booking: { icon: Calendar, color: 'text-teal-600 dark:text-teal-400', bgColor: 'from-teal-500/20 to-teal-500/5', badge: 'Reserva', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  application: { icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bgColor: 'from-blue-500/20 to-blue-500/5', badge: 'Postulación', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  review: { icon: Star, color: 'text-amber-600 dark:text-amber-400', bgColor: 'from-amber-500/20 to-amber-500/5', badge: 'Reseña', badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  proposal_response: { icon: Send, color: 'text-violet-600 dark:text-violet-400', bgColor: 'from-violet-500/20 to-violet-500/5', badge: 'Propuesta', badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  new_order: { icon: ShoppingBag, color: 'text-orange-600 dark:text-orange-400', bgColor: 'from-orange-500/20 to-orange-500/5', badge: 'Pedido', badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  order_paid: { icon: Receipt, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'from-emerald-500/20 to-emerald-500/5', badge: 'Pago', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  bill_requested: { icon: ChefHat, color: 'text-rose-600 dark:text-rose-400', bgColor: 'from-rose-500/20 to-rose-500/5', badge: 'Cuenta', badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

function NotificationsBell() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const gastroPending = useGastroAlerts((s) => s.pendingOrders);
  const gastroBills = useGastroAlerts((s) => s.billsRequested);
  const hasAttention = gastroPending > 0 || gastroBills > 0;

  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      const api = createApiClient(session.accessToken as string);
      const [feedResult, ordersResult] = await Promise.allSettled([
        api.getActivityFeed?.() || Promise.resolve([]),
        api.getOrders?.('PENDING', 1, 10).catch(() => ({ data: [] })),
      ]);

      const feed: ActivityItem[] = feedResult.status === 'fulfilled' ? feedResult.value : [];

      // Convert pending orders to activity items
      const pendingOrders: ActivityItem[] = [];
      if (ordersResult.status === 'fulfilled' && ordersResult.value?.data) {
        for (const order of ordersResult.value.data) {
          pendingOrders.push({
            id: `order-${order.id}`,
            type: 'new_order',
            title: `Nuevo pedido ${order.orderNumber}`,
            description: `${order.customerName || 'Cliente'} — ${order.items?.length || 0} productos`,
            createdAt: order.createdAt,
            link: '/pedidos-cocina',
          });
        }
      }

      const allItems = [...pendingOrders, ...feed]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 15);

      const newItems = allItems.filter((item) =>
        new Date(item.createdAt) > lastChecked
      );

      setItems(allItems);
      if (!isOpen) {
        setUnreadCount(prev => prev + newItems.length);
      }
    } catch {
      // Fallback to recent bookings if activity-feed not available
      try {
        const api = createApiClient(session.accessToken as string);
        const bookings = await api.getRecentBookings?.() || [];
        setItems(bookings.slice(0, 5).map((b: { id: string; customerName: string; serviceName: string; startTime: string; createdAt: string }) => ({
          id: b.id, type: 'booking' as const, title: `Nueva reserva de ${b.customerName}`,
          description: `${b.serviceName} — ${b.startTime}`, createdAt: b.createdAt, link: '/turnos',
        })));
      } catch { /* ignore */ }
    }
  }, [session?.accessToken, lastChecked, isOpen]);

  useEffect(() => {
    fetchNotifications();
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
        <button
          className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 min-w-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full border-2 border-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {hasAttention && unreadCount === 0 && (
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] sm:w-[380px] p-0 shadow-xl rounded-xl border border-border/50 overflow-hidden" align="end" sideOffset={8}>
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Notificaciones</h4>
            {items.length > 0 && (
              <span className="text-[11px] text-muted-foreground">{items.length} recientes</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[360px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Sin notificaciones</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Reservas, pedidos y novedades aparecerán aquí</p>
            </div>
          ) : (
            <div>
              {items.map((item, idx) => {
                const config = activityConfig[item.type] || activityConfig.booking;
                const IconComponent = config.icon;
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.link}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${idx < items.length - 1 ? 'border-b border-border/30' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${config.bgColor} flex items-center justify-center`}>
                      <IconComponent className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${config.badgeClass}`}>
                        {config.badge}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: false, locale: es })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-2.5 border-t bg-muted/20">
            <Link
              href={session?.user?.tenantType === 'PROFESSIONAL' ? '/mi-perfil/postulaciones' : '/turnos'}
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Ver toda la actividad
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Page title mapping for breadcrumb context
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalogo': 'Productos',
  '/categorias-productos': 'Categorías',
  '/pedidos': 'Pedidos',
  '/turnos': 'Turnos',
  '/servicios': 'Servicios',
  '/empleados': 'Empleados',
  '/horarios': 'Horarios',
  '/clientes': 'Clientes',
  '/presupuestos': 'Presupuestos',
  '/reportes': 'Reportes',
  '/finanzas': 'Finanzas',
  '/fidelizacion': 'Fidelización',
  '/configuracion': 'Configuración',
  '/pagos': 'Pagos',
  '/seguridad': 'Seguridad',
  '/mi-suscripcion': 'Mi Suscripción',
  '/verificar-cuenta': 'Verificar Email',
  '/resenas': 'Reseñas',
  '/ayuda': 'Ayuda',
};

export function DashboardHeader({ user }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [tenantLogo, setTenantLogo] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoTransform, setLogoTransform] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken as string);

    const tryLoadImage = (url: string, fallback?: () => void) => {
      const img = new Image();
      img.onload = () => { setTenantLogo(url); setLogoLoaded(true); };
      img.onerror = () => { if (fallback) fallback(); else setLogoLoaded(true); };
      img.src = url;
    };

    const loadBranding = (b: any) => {
      if (b?.logoScale != null || b?.logoOffsetX != null || b?.logoOffsetY != null) {
        setLogoTransform({ scale: b.logoScale ?? 1, x: b.logoOffsetX ?? 0, y: b.logoOffsetY ?? 0 });
      }
    };

    api.getTenant().then((t) => {
      setTenantName(t.name || null);
      if (t.logo) {
        tryLoadImage(t.logo, () => {
          api.getBranding().then((b: any) => {
            loadBranding(b);
            if (b?.logoUrl) tryLoadImage(b.logoUrl);
            else setLogoLoaded(true);
          }).catch(() => setLogoLoaded(true));
        });
        // Also load branding for transform values
        api.getBranding().then((b: any) => loadBranding(b)).catch(() => {});
      } else {
        api.getBranding().then((b: any) => {
          loadBranding(b);
          if (b?.logoUrl) tryLoadImage(b.logoUrl);
          else setLogoLoaded(true);
        }).catch(() => setLogoLoaded(true));
      }
    }).catch(() => setLogoLoaded(true));
  }, [session?.accessToken]);

  const pageTitle = PAGE_TITLES[pathname] || '';

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex h-[4.5rem] items-center justify-between px-4 md:px-5 lg:px-6">
        {/* Left: mobile logo / desktop page title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden">
            <Link href={session?.user?.tenantType === 'PROFESSIONAL' ? '/mi-perfil' : '/dashboard'}>
              <img src="/claro2.png" alt="TurnoLink" className="h-14 w-auto dark:hidden" />
              <img src="/oscuro2.png" alt="TurnoLink" className="h-14 w-auto hidden dark:block" />
            </Link>
          </div>
          {pageTitle && (
            <h2 className="hidden md:block text-sm font-semibold text-foreground truncate">
              {pageTitle}
            </h2>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <NotificationsBell />
          <DashboardThemeToggle />

          {/* User menu with name */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none hover:opacity-80 transition-opacity p-0.5 hover:bg-muted/50">
                {/* Avatar */}
                {!logoLoaded && (
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse ring-2 ring-border" />
                )}
                {logoLoaded && tenantLogo && (
                  <div className="h-10 w-10 rounded-full ring-2 ring-border overflow-hidden flex items-center justify-center bg-background">
                    <img
                      src={tenantLogo}
                      alt={tenantName || user.name || 'Perfil'}
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `scale(${logoTransform.scale}) translate(${logoTransform.x}%, ${logoTransform.y}%)`, transformOrigin: 'center' }}
                    />
                  </div>
                )}
                {logoLoaded && !tenantLogo && (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
                    <User className="h-4.5 w-4.5 text-primary" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{tenantName || user.name}</p>
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
