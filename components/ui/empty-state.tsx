import * as React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-8 text-center duration-200 dark:border-stone-800 dark:bg-stone-900/30',
        className,
      )}
      {...props}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-stone-500 shadow-inner dark:border-stone-700/50 dark:bg-stone-800/80 dark:text-stone-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-stone-600 dark:text-stone-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
