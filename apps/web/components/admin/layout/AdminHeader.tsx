'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Bell,
  RefreshCw,
  Moon,
  Sun,
  Shield,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdminAuth } from './AdminAuthGuard';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/negocios': 'Negocios',
  '/admin/suscripciones': 'Suscripciones',
  '/admin/pagos': 'Pagos',
  '/admin/usuarios': 'Usuarios',
  '/admin/seguridad': 'Seguridad',
  '/admin/reportes': 'Reportes',
  '/admin/configuracion': 'Configuracion',
};

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path)) {
        return title;
      }
    }
    return 'Admin';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleLogout = () => {
    if (confirm('Cerrar sesion?')) {
      logout();
    }
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 hover:bg-primary/10"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Menu</TooltipContent>
          </Tooltip>

          <h1 className="text-base sm:text-xl font-semibold truncate">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Refresh Button - hide on small mobile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hidden sm:flex h-9 w-9"
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar</TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Notificaciones</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-72 sm:w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                <span className="text-xs text-muted-foreground font-normal">3 nuevas</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="font-medium text-sm">3 pagos fallidos</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4">
                    Requieren atencion
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-medium text-sm">5 trials vencen hoy</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4">
                    Contactar usuarios
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="font-medium text-sm">Alerta de seguridad</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4">
                    Intentos de login fallidos
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-9 px-2 sm:px-3 ml-1">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-105">
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>Administrador</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Acceso completo
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
