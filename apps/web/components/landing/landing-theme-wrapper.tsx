'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'landing-theme';
const HINT_SEEN_KEY = 'theme-hint-seen';

export function LandingThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) {
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className={cn(theme, 'min-h-screen bg-background text-foreground transition-colors duration-300')}>
      {children}
    </div>
  );
}

export function LandingThemeToggle({ className, showHint = false }: { className?: string; showHint?: boolean }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) {
      setTheme(stored);
    }
    setMounted(true);

    // Check if user has seen the hint before - show only first time for 3 seconds
    if (showHint) {
      const hintSeen = localStorage.getItem(HINT_SEEN_KEY);
      if (!hintSeen) {
        // Show guide immediately
        setShowGuide(true);
        localStorage.setItem(HINT_SEEN_KEY, 'true');

        // Auto-hide after 3 seconds
        const timer = setTimeout(() => setShowGuide(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [showHint]);

  const dismissGuide = () => {
    setShowGuide(false);
  };

  // Listen for storage changes from wrapper
  useEffect(() => {
    const handleStorage = () => {
      const current = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (current) setTheme(current);
    };
    window.addEventListener('storage', handleStorage);

    // Custom event for same-window updates
    const handleThemeChange = () => {
      const current = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (current) setTheme(current);
    };
    window.addEventListener('landing-theme-change', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('landing-theme-change', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    // Dispatch event for same-window sync
    window.dispatchEvent(new CustomEvent('landing-theme-change'));
    // Force re-render by toggling class on closest parent
    const wrapper = document.querySelector('.light, .dark');
    if (wrapper) {
      wrapper.classList.remove('light', 'dark');
      wrapper.classList.add(newTheme);
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn('h-9 w-9', className)} disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleTheme();
          dismissGuide();
        }}
        className={cn(
          'h-9 w-9 relative overflow-hidden transition-colors',
          theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
          className
        )}
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

      {/* First-time visitor guide - 3 seconds */}
      {showGuide && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 z-50",
            "px-3 py-2 rounded-lg shadow-md",
            "bg-foreground/90 text-background",
            "animate-fade-in",
            "text-xs whitespace-nowrap"
          )}
        >
          {/* Arrow */}
          <div className="absolute -top-1 right-4 w-2 h-2 rotate-45 bg-foreground/90" />

          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-background/60">/</span>
            <Moon className="h-3.5 w-3.5 text-blue-300" />
            <span>Cambia el tema aquí</span>
          </div>
        </div>
      )}
    </div>
  );
}
