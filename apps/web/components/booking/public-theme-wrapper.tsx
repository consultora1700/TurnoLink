'use client';

import { ReactNode, useEffect, useState, useMemo, createContext, useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getContrastTextColor } from '@/lib/color-contrast';

type Theme = 'light' | 'dark';

interface ThemeColors {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface PublicThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
  heroContrastMode: 'light' | 'dark';
}

const PublicThemeContext = createContext<PublicThemeContextType | null>(null);

export function usePublicTheme() {
  const context = useContext(PublicThemeContext);
  if (!context) {
    throw new Error('usePublicTheme must be used within PublicThemeWrapper');
  }
  return context;
}

interface PublicThemeWrapperProps {
  children: ReactNode;
  tenantSlug: string;
  colors?: ThemeColors;
  enableDarkMode?: boolean;
  themeMode?: 'light' | 'dark' | 'both';
}

// Default colors — match the original hardcoded teal/violet/emerald
const DEFAULT_PRIMARY = '#3F8697';   // teal-ish
const DEFAULT_SECONDARY = '#8B5CF6'; // violet
const DEFAULT_ACCENT = '#10B981';    // emerald

// Convert hex to HSL values for CSS variables
export function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex
  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
  } else {
    return null;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Generate color variations
export function generateColorVariations(hex: string): Record<string, string> {
  const hsl = hexToHSL(hex);
  if (!hsl) return {};

  const { h, s } = hsl;

  return {
    '50': `${h} ${Math.min(s + 20, 100)}% 96%`,
    '100': `${h} ${Math.min(s + 15, 100)}% 91%`,
    '200': `${h} ${Math.min(s + 10, 100)}% 82%`,
    '300': `${h} ${Math.min(s + 5, 100)}% 71%`,
    '400': `${h} ${s}% 60%`,
    '500': `${h} ${s}% 50%`,
    '600': `${h} ${s}% 42%`,
    '700': `${h} ${s}% 34%`,
    '800': `${h} ${s}% 26%`,
    '900': `${h} ${s}% 18%`,
    '950': `${h} ${s}% 10%`,
  };
}

export function PublicThemeWrapper({
  children,
  tenantSlug,
  colors = {},
  enableDarkMode = true,
  themeMode,
}: PublicThemeWrapperProps) {
  // Resolve effective mode: themeMode takes precedence, fallback to enableDarkMode for backward compat
  const effectiveMode = themeMode ?? (enableDarkMode ? 'both' : 'light');
  const canToggle = effectiveMode === 'both';

  const STORAGE_KEY = `public-theme-${tenantSlug}`;
  const [theme, setTheme] = useState<Theme>(effectiveMode === 'dark' ? 'dark' : 'light');
  const [mounted, setMounted] = useState(false);

  // Apply theme to <html> + colorScheme + localStorage — single source of truth
  const applyThemeToDOM = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    root.style.colorScheme = t;
  };

  useEffect(() => {
    let initial: Theme;

    if (effectiveMode === 'dark') {
      initial = 'dark';
    } else if (effectiveMode === 'light') {
      initial = 'light';
    } else {
      // 'both' — allow user preference
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored) {
        initial = stored;
      } else {
        const htmlDark = document.documentElement.classList.contains('dark');
        const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        initial = (htmlDark || systemDark) ? 'dark' : 'light';
      }
    }

    setTheme(initial);
    applyThemeToDOM(initial);
    setMounted(true);
  }, [STORAGE_KEY, effectiveMode]);

  useEffect(() => {
    if (mounted) {
      applyThemeToDOM(theme);
      if (canToggle) {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    }
  }, [theme, mounted, STORAGE_KEY, canToggle]);

  const toggleTheme = () => {
    if (canToggle) {
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }
  };

  // Cleanup: restore <html> to light when unmounting (navigating away from public page)
  useEffect(() => {
    return () => {
      const dashboardTheme = localStorage.getItem('turnolink-theme') as Theme | null;
      applyThemeToDOM(dashboardTheme || 'light');
    };
  }, []);

  // Generate CSS variables from custom colors (always, using defaults when not configured)
  const effectivePrimary = colors.primaryColor || DEFAULT_PRIMARY;
  const effectiveSecondary = colors.secondaryColor || DEFAULT_SECONDARY;
  const effectiveAccent = colors.accentColor || DEFAULT_ACCENT;

  // Determine whether text on the primary background should be light or dark
  const heroContrastMode = useMemo(
    () => getContrastTextColor(effectivePrimary),
    [effectivePrimary],
  );

  const customStyles: React.CSSProperties = {};

  // Contrast color for text on primary backgrounds
  (customStyles as Record<string, string>)['--tenant-primary-contrast'] =
    heroContrastMode === 'light' ? 'white' : '#1e293b';

  // Primary color - main actions, buttons, links
  const primaryHSL = hexToHSL(effectivePrimary);
  if (primaryHSL) {
    const variations = generateColorVariations(effectivePrimary);
    Object.entries(variations).forEach(([key, value]) => {
      (customStyles as Record<string, string>)[`--tenant-primary-${key}`] = value;
    });
    (customStyles as Record<string, string>)['--primary'] = `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`;
    (customStyles as Record<string, string>)['--ring'] = `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`;
  }

  // Secondary color - secondary buttons, badges, backgrounds
  const secondaryHSL = hexToHSL(effectiveSecondary);
  if (secondaryHSL) {
    const variations = generateColorVariations(effectiveSecondary);
    Object.entries(variations).forEach(([key, value]) => {
      (customStyles as Record<string, string>)[`--tenant-secondary-${key}`] = value;
    });
    (customStyles as Record<string, string>)['--secondary'] = `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`;
  }

  // Accent color - highlights, special elements, notifications
  const accentHSL = hexToHSL(effectiveAccent);
  if (accentHSL) {
    const variations = generateColorVariations(effectiveAccent);
    Object.entries(variations).forEach(([key, value]) => {
      (customStyles as Record<string, string>)[`--tenant-accent-${key}`] = value;
    });
    (customStyles as Record<string, string>)['--accent'] = `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`;
  }

  return (
    <PublicThemeContext.Provider value={{ theme, toggleTheme, colors, heroContrastMode }}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={customStyles}
      >
        {children}
      </div>
    </PublicThemeContext.Provider>
  );
}

export function PublicThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = usePublicTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-9 w-9 bg-white/10 backdrop-blur rounded-full', className)}
        disabled
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'h-9 w-9 relative overflow-hidden bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors',
        'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0',
        className
      )}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <Sun
        className={cn(
          'h-5 w-5 absolute transition-all duration-300 text-amber-400',
          theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        className={cn(
          'h-5 w-5 absolute transition-all duration-300 text-blue-300',
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        )}
      />
    </Button>
  );
}

// Floating theme toggle for public pages — delegates to PublicThemeWrapper context.
// Must be rendered inside <PublicThemeWrapper>.
export function PublicThemeToggleFloating({
  className,
}: {
  className?: string;
  tenantSlug?: string; // kept for backwards-compat call-sites, unused
}) {
  const { theme, toggleTheme } = usePublicTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg',
        'bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md',
        'border border-slate-200 dark:border-neutral-700',
        'hover:scale-110 active:scale-95 transition-all duration-300',
        'flex items-center justify-center',
        'outline-none focus:outline-none',
        className
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
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
    </button>
  );
}
