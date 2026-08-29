import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PortalLoading() {
  return (
    <div className="animate-in fade-in-50 space-y-8 duration-200">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Job Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-stone-200/80 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/50"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-56 sm:w-80" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <Skeleton className="h-12 w-full rounded-lg" />

            <div className="flex items-center justify-between border-t border-stone-200/60 pt-2 dark:border-stone-800/60">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
