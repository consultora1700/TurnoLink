'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200',
          className
        )}
        aria-label="Toggle theme"
      >
        <span
          className={cn(
            'inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform',
            theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
          )}
        >
          {theme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-slate-700" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          )}
        </span>
      </button>
    );
  }

  // Default: icon variant
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(sizeClasses[size], className)}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className={cn(iconSizes[size], 'text-blue-400')} />
      ) : (
        <Sun className={cn(iconSizes[size], 'text-amber-500')} />
      )}
      {showLabel && (
        <span className="ml-2">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
      )}
    </Button>
  );
}

// Simple pill toggle
export function ThemeTogglePill({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex h-10 items-center gap-2 rounded-full border px-1',
        theme === 'dark'
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white shadow-sm',
        className
      )}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full',
          theme === 'light'
            ? 'bg-amber-100 text-amber-600'
            : 'text-slate-400'
        )}
      >
        <Sun className="h-4 w-4" />
      </div>
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full',
          theme === 'dark'
            ? 'bg-slate-700 text-blue-400'
            : 'text-slate-400'
        )}
      >
        <Moon className="h-4 w-4" />
      </div>
    </button>
  );
}
