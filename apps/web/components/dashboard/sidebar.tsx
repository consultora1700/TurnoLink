'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import {
  Calendar,
  LayoutDashboard,
  Scissors,
  Users,
  Clock,
  Settings,
  ExternalLink,
  Shield,
  ChevronDown,
  ChevronRight,
  Menu,
  HelpCircle,
  Home,
  UserCog,
  CreditCard,
  Building2,
  Crown,
  Mail,
  Star,
  Search,
  Send,
  Inbox,
  CalendarCheck,
  BarChart3,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const businessNavigationSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Reportes', href: '/reportes', icon: BarChart3 },
    ],
    defaultExpanded: true,
  },
  {
    title: 'Turnos',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Autogestión', href: '/autogestion', icon: CalendarCheck },
      { name: 'Turnos', href: '/turnos', icon: Calendar },
      { name: 'Servicios', href: '/servicios', icon: Scissors },
      { name: 'Empleados', href: '/empleados', icon: UserCog },
      { name: 'Sucursales', href: '/sucursales', icon: Building2 },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Horarios', href: '/horarios', icon: Clock },
    ],
  },
  {
    title: 'Talento',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Explorar talento', href: '/talento', icon: Search, exact: true },
      { name: 'Mis propuestas', href: '/talento/propuestas', icon: Send },
    ],
  },
  {
    title: 'Configuracion',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'General', href: '/configuracion', icon: Settings },
      { name: 'Pagos', href: '/pagos', icon: CreditCard },
      { name: 'Seguridad', href: '/seguridad', icon: Shield },
    ],
  },
  {
    title: 'Cuenta',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Mi Suscripción', href: '/mi-suscripcion', icon: Crown },
      { name: 'Verificar Email', href: '/verificar-cuenta', icon: Mail },
      { name: 'Reseñas', href: '/resenas', icon: Star },
      { name: 'Desarrolladores', href: '/integracion', icon: Code2 },
    ],
  },
];

const professionalNavigationSections: NavSection[] = [
  {
    title: 'Mi Perfil',
    items: [
      { name: 'Mi Perfil', href: '/mi-perfil', icon: UserCog },
      { name: 'Propuestas Recibidas', href: '/mi-perfil/propuestas', icon: Inbox },
    ],
    defaultExpanded: true,
  },
  {
    title: 'Cuenta',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Seguridad', href: '/seguridad', icon: Shield },
      { name: 'Verificar Email', href: '/verificar-cuenta', icon: Mail },
    ],
  },
];

function getNavigationSections(tenantType: string): NavSection[] {
  if (tenantType === 'PROFESSIONAL') return professionalNavigationSections;
  return businessNavigationSections;
}

function NavSectionComponent({
  section,
  pathname,
  expandedSections,
  toggleSection,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  expandedSections: Record<string, boolean>;
  toggleSection: (title: string) => void;
  onNavigate?: () => void;
}) {
  const isExpanded = expandedSections[section.title] ?? section.defaultExpanded ?? true;
  const isItemActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
  const hasActiveItem = section.items.some(isItemActive);

  return (
    <div>
      {section.collapsible ? (
        <button
          onClick={() => toggleSection(section.title)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors',
            hasActiveItem && !isExpanded
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <span>{section.title}</span>
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <h3 className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h3>
      )}

      <div
        className={cn(
          'space-y-px overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-96 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
        )}
      >
        {section.items.map((item) => {
          const isActive = isItemActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'mr-3 h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110',
                isActive && 'text-primary-foreground'
              )} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge
                  variant={isActive ? 'secondary' : 'default'}
                  className={cn(
                    'ml-2 h-5 min-w-[20px] flex items-center justify-center text-xs',
                    isActive && 'bg-primary-foreground/20 text-primary-foreground'
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  tenantSlug,
  tenantType,
  onNavigate,
}: {
  pathname: string;
  tenantSlug: string | null;
  tenantType: string;
  onNavigate?: () => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const navigationSections = getNavigationSections(tenantType);
  const isProfessional = tenantType === 'PROFESSIONAL';
  const logoHref = isProfessional ? '/mi-perfil' : '/dashboard';

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !(prev[title] ?? navigationSections.find(s => s.title === title)?.defaultExpanded ?? true),
    }));
  };

  const handleLinkClick = () => {
    // Close mobile menu when navigating
    onNavigate?.();
  };

  // Scroll state for fade indicators
  const navRef = useRef<HTMLElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const threshold = 4;
    setCanScrollUp(el.scrollTop > threshold);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - threshold);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    // Also watch resize for layout changes
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // Re-check scroll state when sections expand/collapse
  useEffect(() => {
    // Small delay to let the collapse animation finish
    const timer = setTimeout(updateScrollState, 250);
    return () => clearTimeout(timer);
  }, [expandedSections, updateScrollState]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-20 px-4 border-b border-border/50 shrink-0">
        <Link
          href={logoHref}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={handleLinkClick}
        >
          <img
            src="/claro2.png"
            alt="TurnoLink"
            className="h-16 w-auto dark:hidden"
          />
          <img
            src="/oscuro2.png"
            alt="TurnoLink"
            className="h-16 w-auto hidden dark:block"
          />
        </Link>
      </div>

      {/* Navigation with scroll */}
      <div className="relative flex-1 min-h-0">
        {/* Top fade indicator */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200',
            canScrollUp ? 'opacity-100' : 'opacity-0'
          )}
        />

        <nav
          ref={navRef}
          className="h-full px-3 py-3 space-y-3 overflow-y-auto scroll-smooth overscroll-contain sidebar-scroll"
        >
          {navigationSections.map((section) => (
            <NavSectionComponent
              key={section.title}
              section={section}
              pathname={pathname}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              onNavigate={handleLinkClick}
            />
          ))}
        </nav>

        {/* Bottom fade indicator */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none transition-opacity duration-200',
            canScrollDown ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {/* Bottom Section */}
      <div className="border-t px-3 py-2 space-y-px shrink-0">
        {!isProfessional && tenantSlug && (
          <Link
            href={`/${tenantSlug}`}
            target="_blank"
            className="flex items-center px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors group"
            onClick={handleLinkClick}
          >
            <ExternalLink className="mr-3 h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            Ver mi página
          </Link>
        )}
        <Link
          href="/ayuda"
          className="flex items-center px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors group"
          onClick={handleLinkClick}
        >
          <HelpCircle className="mr-3 h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          Ayuda
        </Link>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const { data: session } = useSession();
  const tenantType = session?.user?.tenantType || 'BUSINESS';
  const isProfessional = tenantType === 'PROFESSIONAL';

  // Fetch tenant slug
  useEffect(() => {
    const fetchTenant = async () => {
      if (!session?.accessToken) return;
      try {
        const api = createApiClient(session.accessToken as string);
        const tenant = await api.getTenant();
        setTenantSlug(tenant.slug);
      } catch {
        // Silently fail - the link just won't show
      }
    };
    fetchTenant();
  }, [session?.accessToken]);

  // Close mobile menu and scroll to top when pathname changes
  useEffect(() => {
    setMobileOpen(false);
    // Scroll to top when navigating to a new page
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Handle closing mobile menu
  const handleMobileNavigate = () => {
    setMobileOpen(false);
  };

  // Mobile bottom nav items based on tenant type
  const mobileNavItems = isProfessional
    ? [
        { name: 'Mi Perfil', href: '/mi-perfil', icon: UserCog },
        { name: 'Propuestas', href: '/mi-perfil/propuestas', icon: Inbox },
        { name: 'Seguridad', href: '/seguridad', icon: Shield },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ]
    : [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        { name: 'Turnos', href: '/turnos', icon: Calendar },
        { name: 'Servicios', href: '/servicios', icon: Scissors },
        { name: 'Clientes', href: '/clientes', icon: Users },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ];

  const mobileGridCols = isProfessional ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        data-tour="sidebar"
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col"
      >
        <div className="flex flex-col flex-1 overflow-hidden bg-background border-r">
          <SidebarContent pathname={pathname} tenantSlug={tenantSlug} tenantType={tenantType} />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        data-tour="mobile-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40 safe-area-bottom"
      >
        <div className={`grid ${mobileGridCols} h-16`}>
          {mobileNavItems.map((item) => {
            if (item.isMenu) {
              return (
                <Sheet key={item.name} open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <button
                      data-tour="mobile-menu-button"
                      className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{item.name}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72 overflow-hidden">
                    <SidebarContent
                      pathname={pathname}
                      tenantSlug={tenantSlug}
                      tenantType={tenantType}
                      onNavigate={handleMobileNavigate}
                    />
                  </SheetContent>
                </Sheet>
              );
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isActive && 'bg-primary/10'
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive && 'text-primary'
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );
}
