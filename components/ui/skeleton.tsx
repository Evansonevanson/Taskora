import * as React from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative animate-pulse overflow-hidden rounded-md bg-stone-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent dark:bg-stone-800/70 dark:before:via-white/5',
        className,
      )}
      {...props}
    />
  );
}
