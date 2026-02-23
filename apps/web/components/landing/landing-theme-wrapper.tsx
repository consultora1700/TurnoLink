'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'turnolink-theme';

// Cambio de tema instantáneo - solo manipula clases CSS
function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function LandingThemeWrapper({ children }: { children: ReactNode }) {
  // Sin transiciones, sin estado, solo renderiza children
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}

export function LandingThemeToggle({ className }: { className?: string }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    setThemeState(getTheme());

    // Observer para detectar cambios de clase en html
    const observer = new MutationObserver(() => {
      setThemeState(getTheme());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setThemeState(newTheme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn('h-9 w-9', className)}
      aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? (
        <Moon className="h-5 w-5 text-blue-400" />
      ) : (
        <Sun className="h-5 w-5 text-amber-500" />
      )}
    </Button>
  );
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
