'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'dashboard-theme';

export function DashboardThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) {
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  // Apply theme to html element so portals inherit dark mode
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, theme);
      // Apply to html element for Radix UI portals
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
      // Dispatch event for header toggle sync
      window.dispatchEvent(new CustomEvent('dashboard-theme-change', { detail: theme }));
    }
  }, [theme, mounted]);

  // Listen for theme changes from header
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<Theme>) => {
      setTheme(e.detail);
    };
    window.addEventListener('dashboard-theme-update', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('dashboard-theme-update', handleThemeChange as EventListener);
    };
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div className={cn('min-h-screen transition-colors duration-300')}>
      <div className={cn(
        'min-h-screen bg-fixed transition-colors duration-300',
        theme === 'dark'
          ? 'bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900'
          : 'bg-gradient-to-br from-slate-50 via-white to-pink-50/30'
      )}>
        {/* Subtle decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            'absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-300',
            theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'
          )} />
          <div className={cn(
            'absolute top-1/2 -left-20 w-60 h-60 rounded-full blur-3xl transition-colors duration-300',
            theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'
          )} />
          <div className={cn(
            'absolute -bottom-20 right-1/3 w-72 h-72 rounded-full blur-3xl transition-colors duration-300',
            theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-500/5'
          )} />
        </div>
        {children}
      </div>
    </div>
  );
}

export function DashboardThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) {
      setTheme(stored);
    }
    setMounted(true);

    // Listen for theme changes from wrapper
    const handleThemeChange = (e: CustomEvent<Theme>) => {
      setTheme(e.detail);
    };
    window.addEventListener('dashboard-theme-change', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('dashboard-theme-change', handleThemeChange as EventListener);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    // Dispatch event for wrapper sync
    window.dispatchEvent(new CustomEvent('dashboard-theme-update', { detail: newTheme }));
    // Apply to html element for Radix UI portals
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    document.documentElement.style.colorScheme = newTheme;
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn('h-9 w-9', className)} disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn('h-9 w-9 relative overflow-hidden', className)}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <Sun
        className={cn(
          'h-5 w-5 absolute transition-all duration-300 text-amber-500',
          theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        className={cn(
          'h-5 w-5 absolute transition-all duration-300 text-blue-400',
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        )}
      />
    </Button>
  );
}
