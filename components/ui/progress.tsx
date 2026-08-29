import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export function Progress({
  value = 0,
  max = 100,
  showLabel = false,
  color = 'primary',
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(
    Math.max(Math.round((value / max) * 100), 0),
    100,
  );

  const colorStyles = {
    primary: 'bg-indigo-500 shadow-indigo-500/30',
    success: 'bg-emerald-500 shadow-emerald-500/30',
    warning: 'bg-amber-500 shadow-amber-500/30',
    danger: 'bg-red-500 shadow-red-500/30',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium text-stone-400">
          <span>Progress</span>
          <span className="text-stone-200">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="relative h-2 w-full overflow-hidden rounded-full bg-stone-800"
      >
        <div
          className={cn(
            'h-full rounded-full shadow-sm transition-all duration-500 ease-out',
            colorStyles[color],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
