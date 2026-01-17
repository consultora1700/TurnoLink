'use client';

import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'inline' | 'toast';
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  variant = 'default',
  className,
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg',
          className
        )}
      >
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>{message}</span>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-auto hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div
        className={cn(
          'fixed bottom-4 right-4 max-w-sm bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up z-50',
          className
        )}
      >
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="font-semibold text-lg text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p className={cn('text-sm text-red-600 mt-1 flex items-center gap-1', className)}>
      <AlertCircle className="h-3.5 w-3.5" />
      {error}
    </p>
  );
}
