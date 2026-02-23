'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  mobileTitle?: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  format?: 'number' | 'currency' | 'percentage';
  delay?: number;
}

export function StatsCard({
  title,
  mobileTitle,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  format = 'number',
  delay = 0,
}: StatsCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Animate number counting
  useEffect(() => {
    if (!isVisible || typeof value !== 'number') return;

    const duration = 800;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [isVisible, value]);

  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('es-AR').format(val);
    }
  };

  const formatValueCompact = (val: string | number): string => {
    if (typeof val === 'string') return val;

    if (format === 'currency') {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `$${(val / 1000).toFixed(0)}k`;
      }
      return `$${val}`;
    }

    if (format === 'percentage') {
      return `${val.toFixed(0)}%`;
    }

    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toString();
  };

  const renderTrend = () => {
    if (change === undefined) return null;

    const isPositive = change > 0;
    const isNeutral = change === 0;

    return (
      <div
        className={cn(
          'flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium transition-all duration-300',
          isPositive && 'text-green-600 dark:text-green-400',
          !isPositive && !isNeutral && 'text-red-600 dark:text-red-400',
          isNeutral && 'text-muted-foreground'
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : isNeutral ? (
          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : (
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
        )}
        <span>
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
        </span>
      </div>
    );
  };

  const animatedValue = typeof value === 'number' ? displayValue : value;

  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-4 lg:p-6 shadow-sm transition-all duration-500',
        'hover:shadow-md hover:scale-[1.02] hover:border-primary/20',
        'active:scale-[0.98]',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-2 lg:space-y-3 min-w-0 flex-1">
          {/* Mobile title */}
          <p className="text-xs sm:hidden font-medium text-muted-foreground truncate">
            {mobileTitle || title}
          </p>
          {/* Desktop title */}
          <p className="hidden sm:block text-sm font-medium text-muted-foreground">
            {title}
          </p>
          {/* Mobile value - compact */}
          <p className="text-xl sm:hidden font-bold tracking-tight tabular-nums">
            {formatValueCompact(animatedValue)}
          </p>
          {/* Desktop value - full */}
          <p className="hidden sm:block text-2xl lg:text-3xl font-bold tracking-tight tabular-nums">
            {formatValue(animatedValue)}
          </p>
          {/* Trend - hide changeLabel on mobile */}
          <div className="hidden sm:block">{renderTrend()}</div>
          {change !== undefined && (
            <div className="sm:hidden">{renderTrend()}</div>
          )}
          {/* Change label only on desktop */}
          {changeLabel && (
            <p className="hidden sm:block text-xs text-muted-foreground">
              {changeLabel}
            </p>
          )}
        </div>
        <div
          className={cn(
            'rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0 transition-transform duration-300',
            'group-hover:scale-110',
            iconBgColor
          )}
        >
          <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-colors', iconColor)} />
        </div>
      </div>
    </div>
  );
}
