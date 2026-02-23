'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  DollarSign,
  Users,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Negocios',
    href: '/admin/negocios',
    icon: Building2,
  },
  {
    label: 'Suscripciones',
    href: '/admin/suscripciones',
    icon: CreditCard,
  },
  {
    label: 'Pagos',
    href: '/admin/pagos',
    icon: DollarSign,
  },
  {
    label: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    label: 'Seguridad',
    href: '/admin/seguridad',
    icon: Shield,
  },
  {
    label: 'Reportes',
    href: '/admin/reportes',
    icon: BarChart3,
  },
  {
    label: 'Configuracion',
    href: '/admin/configuracion',
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  const NavLink = ({ item, index }: { item: NavItem; index: number }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

    const linkContent = (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:bg-accent active:scale-[0.98]',
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
          isCollapsed && 'lg:justify-center lg:px-2',
          'animate-in fade-in slide-in-from-left-2'
        )}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <item.icon className={cn(
          'h-5 w-5 flex-shrink-0 transition-transform duration-200',
          isActive && 'scale-110'
        )} />
        <span className={cn('flex-1', isCollapsed && 'lg:hidden')}>
          {item.label}
        </span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className={cn(
            'flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-destructive-foreground',
            isCollapsed && 'lg:hidden'
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild className="hidden lg:flex">
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r bg-card/95 backdrop-blur-md transition-all duration-300 ease-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-[70px]' : 'lg:w-[260px]',
          'w-[280px]'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 group"
            onClick={onClose}
          >
            <div className={cn(
              'h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0',
              'transition-transform duration-200 group-hover:scale-105'
            )}>
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="flex flex-col lg:hidden xl:flex animate-in fade-in slide-in-from-left-2">
                <span className="font-bold text-lg leading-tight">TurnoLink</span>
                <span className="text-xs text-muted-foreground">Panel Admin</span>
              </div>
            )}
            {!isCollapsed && (
              <div className="hidden lg:flex xl:hidden flex-col animate-in fade-in slide-in-from-left-2">
                <span className="font-bold text-lg leading-tight">TurnoLink</span>
                <span className="text-xs text-muted-foreground">Panel Admin</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden hover:bg-destructive/10 hover:text-destructive"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Desktop collapse button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 hidden lg:flex transition-transform duration-200 hover:scale-105',
                  isCollapsed && 'ml-auto'
                )}
                onClick={onToggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expandir' : 'Colapsar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item, index) => (
            <NavLink key={item.href} item={item} index={index} />
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          'absolute bottom-4 left-4 right-4 transition-opacity duration-300',
          isCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : 'lg:opacity-100'
        )}>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Acceso administrativo
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Todas las acciones son registradas
            </p>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
