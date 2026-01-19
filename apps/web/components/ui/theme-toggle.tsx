'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'dropdown';
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
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

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
          'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300',
          resolvedTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200',
          className
        )}
        aria-label="Toggle theme"
      >
        <span
          className={cn(
            'inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300',
            resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-slate-700" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          )}
        </span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(sizeClasses[size], className)}
          >
            <Sun className={cn(iconSizes[size], 'rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0')} />
            <Moon className={cn(iconSizes[size], 'absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100')} />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
            <Sun className="h-4 w-4" />
            <span>Claro</span>
            {theme === 'light' && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
            <Moon className="h-4 w-4" />
            <span>Oscuro</span>
            {theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
            <Monitor className="h-4 w-4" />
            <span>Sistema</span>
            {theme === 'system' && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default: icon variant
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        sizeClasses[size],
        'relative overflow-hidden',
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          iconSizes[size],
          'absolute transition-all duration-300',
          resolvedTheme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        className={cn(
          iconSizes[size],
          'absolute transition-all duration-300',
          resolvedTheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        )}
      />
      {showLabel && (
        <span className="ml-2">{resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}</span>
      )}
    </Button>
  );
}

// Animated theme toggle with pill design
export function ThemeTogglePill({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'group relative flex h-10 items-center gap-2 rounded-full border px-1 transition-all duration-300',
        resolvedTheme === 'dark'
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white shadow-sm',
        className
      )}
      aria-label="Toggle theme"
    >
      {/* Light option */}
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
          resolvedTheme === 'light'
            ? 'bg-amber-100 text-amber-600'
            : 'text-slate-400 hover:text-slate-300'
        )}
      >
        <Sun className="h-4 w-4" />
      </div>

      {/* Dark option */}
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
          resolvedTheme === 'dark'
            ? 'bg-slate-700 text-blue-400'
            : 'text-slate-400 hover:text-slate-600'
        )}
      >
        <Moon className="h-4 w-4" />
      </div>
    </button>
  );
}
