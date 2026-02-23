'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-4 lg:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 sm:space-y-3 flex-1">
          <Skeleton className="h-3 w-16 sm:w-24" />
          <Skeleton className="h-7 w-20 sm:h-9 sm:w-32" />
          <Skeleton className="h-4 w-14 sm:w-20" />
        </div>
        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-[200px] sm:h-[280px] w-full rounded-lg" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function AlertCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function TenantCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border bg-card space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
