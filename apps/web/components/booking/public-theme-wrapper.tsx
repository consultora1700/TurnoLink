'use client';

import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
}

// Convert hex to HSL values for CSS variables
function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
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
function generateColorVariations(hex: string): Record<string, string> {
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
}: PublicThemeWrapperProps) {
  const STORAGE_KEY = `public-theme-${tenantSlug}`;
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && enableDarkMode) {
      setTheme(stored);
    }
    setMounted(true);
  }, [STORAGE_KEY, enableDarkMode]);

  useEffect(() => {
    if (mounted && enableDarkMode) {
      localStorage.setItem(STORAGE_KEY, theme);
      // Dispatch event for floating toggle sync
      window.dispatchEvent(new CustomEvent('public-theme-change', { detail: theme }));
    }
  }, [theme, mounted, STORAGE_KEY, enableDarkMode]);

  // Listen for theme changes from floating toggle
  useEffect(() => {
    const handleThemeUpdate = (e: CustomEvent<Theme>) => {
      setTheme(e.detail);
    };
    window.addEventListener('public-theme-update', handleThemeUpdate as EventListener);
    return () => {
      window.removeEventListener('public-theme-update', handleThemeUpdate as EventListener);
    };
  }, []);

  const toggleTheme = () => {
    if (enableDarkMode) {
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }
  };

  // Generate CSS variables from custom colors
  const customStyles: React.CSSProperties = {};
  if (colors.primaryColor) {
    const primaryHSL = hexToHSL(colors.primaryColor);
    if (primaryHSL) {
      const variations = generateColorVariations(colors.primaryColor);
      Object.entries(variations).forEach(([key, value]) => {
        (customStyles as Record<string, string>)[`--tenant-primary-${key}`] = value;
      });
      (customStyles as Record<string, string>)['--primary'] = `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`;
      (customStyles as Record<string, string>)['--ring'] = `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`;
      (customStyles as Record<string, string>)['--accent'] = `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`;
    }
  }
  if (colors.secondaryColor) {
    const secondaryHSL = hexToHSL(colors.secondaryColor);
    if (secondaryHSL) {
      (customStyles as Record<string, string>)['--secondary'] = `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`;
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen" style={customStyles}>
        {children}
      </div>
    );
  }

  return (
    <PublicThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      <div
        className={cn(
          theme,
          'min-h-screen transition-colors duration-300'
        )}
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

// Floating theme toggle for public pages - self-contained with its own state
export function PublicThemeToggleFloating({
  className,
  tenantSlug
}: {
  className?: string;
  tenantSlug: string;
}) {
  const STORAGE_KEY = `public-theme-${tenantSlug}`;
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
    window.addEventListener('public-theme-change', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('public-theme-change', handleThemeChange as EventListener);
    };
  }, [STORAGE_KEY]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    // Dispatch event for wrapper sync
    window.dispatchEvent(new CustomEvent('public-theme-update', { detail: newTheme }));
    // Also update the DOM directly for immediate effect
    const wrapper = document.querySelector('.light, .dark');
    if (wrapper) {
      wrapper.classList.remove('light', 'dark');
      wrapper.classList.add(newTheme);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg',
        'bg-background/80 backdrop-blur-md border-border/50',
        'hover:scale-110 transition-all duration-300',
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
  );
}
