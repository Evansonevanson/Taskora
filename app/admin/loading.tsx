import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="animate-in fade-in-50 space-y-8 duration-200">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-stone-200/80 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/50"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Progress Bar Card Skeleton */}
      <div className="space-y-3 rounded-xl border border-stone-200/80 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/50">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4 rounded-xl border border-stone-200/80 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/50">
        {/* Table Filter Bar Skeleton */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Skeleton className="h-9 w-full sm:w-64" />
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-stone-200/60 py-3 last:border-0 dark:border-stone-800/60"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48 sm:w-64" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
