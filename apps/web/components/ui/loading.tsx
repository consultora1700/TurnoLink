'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-violet-100 border-t-violet-500 animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  message = 'Cargando...',
  size = 'md',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-12 px-6', className)}
    >
      <LoadingSpinner size={size} />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = 'Procesando...',
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50',
        className
      )}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'bg-slate-200 animate-pulse',
        variantClasses[variant],
        className
      )}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl p-4 shadow-sm', className)}>
      <Skeleton className="w-3/4 h-5 mb-3" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-2/3 h-4" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="w-full h-4" />
        </td>
      ))}
    </tr>
  );
}
