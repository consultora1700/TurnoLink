'use client';

import { useState, useEffect } from 'react';
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
  Bell,
  HelpCircle,
  Home,
  Link2,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const navigationSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
    defaultExpanded: true,
  },
  {
    title: 'Turnos',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Turnos', href: '/turnos', icon: Calendar },
      { name: 'Servicios', href: '/servicios', icon: Scissors },
      { name: 'Empleados', href: '/empleados', icon: UserCog },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Horarios', href: '/horarios', icon: Clock },
    ],
  },
  {
    title: 'Configuracion',
    collapsible: true,
    defaultExpanded: false,
    items: [
      { name: 'General', href: '/configuracion', icon: Settings },
      { name: 'Seguridad', href: '/seguridad', icon: Shield },
    ],
  },
];

function NavSectionComponent({
  section,
  pathname,
  expandedSections,
  toggleSection,
}: {
  section: NavSection;
  pathname: string;
  expandedSections: Record<string, boolean>;
  toggleSection: (title: string) => void;
}) {
  const isExpanded = expandedSections[section.title] ?? section.defaultExpanded ?? true;
  const hasActiveItem = section.items.some(
    item => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <div className="space-y-1">
      {section.collapsible ? (
        <button
          onClick={() => toggleSection(section.title)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors',
            hasActiveItem && !isExpanded
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <span>{section.title}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : (
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h3>
      )}

      <div
        className={cn(
          'space-y-0.5 overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {section.items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
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

function SidebarContent({ pathname, tenantSlug }: { pathname: string; tenantSlug: string | null }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !(prev[title] ?? navigationSections.find(s => s.title === title)?.defaultExpanded ?? true),
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Link2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">TurnoLink</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navigationSections.map((section) => (
          <NavSectionComponent
            key={section.title}
            section={section}
            pathname={pathname}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-3 space-y-1">
        {tenantSlug && (
          <Link
            href={`/${tenantSlug}`}
            target="_blank"
            className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors group"
          >
            <ExternalLink className="mr-3 h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            Ver mi página
          </Link>
        )}
        <Link
          href="/ayuda"
          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors group"
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

  // Mobile bottom nav items - most important ones
  const mobileNavItems = [
    { name: 'Inicio', href: '/dashboard', icon: Home },
    { name: 'Turnos', href: '/turnos', icon: Calendar },
    { name: 'Servicios', href: '/servicios', icon: Scissors },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-background border-r">
          <SidebarContent pathname={pathname} tenantSlug={tenantSlug} />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Link2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">TurnoLink</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {mobileNavItems.map((item) => {
            if (item.isMenu) {
              return (
                <Sheet key={item.name} open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <button className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground">
                      <item.icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{item.name}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent pathname={pathname} tenantSlug={tenantSlug} />
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

      {/* Mobile spacers */}
      <div className="lg:hidden h-14" /> {/* Top spacer for header */}
    </>
  );
}
