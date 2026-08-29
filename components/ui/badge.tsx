import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-stone-100 text-stone-700 border border-stone-300/80 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700/60',
        primary:
          'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-500/30',
        secondary:
          'bg-stone-100 text-stone-800 border border-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800',
        destructive:
          'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-500/30',
        outline:
          'border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300',
        // Status Variants
        todo: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500/30',
        in_progress:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30',
        completed:
          'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30',
        done: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30',
        overdue:
          'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-500/30',
        pending:
          'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700/60',
        // Priority Variants
        high: 'bg-red-50 text-red-700 border border-red-200 font-semibold dark:bg-red-950/70 dark:text-red-300 dark:border-red-500/30',
        medium:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30',
        low: 'bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800',
        // Category Variants
        general:
          'bg-stone-100 text-stone-700 border border-stone-300/80 dark:bg-stone-800/80 dark:text-stone-300 dark:border-stone-700/50',
        work: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500/30',
        personal:
          'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-500/30',
        urgent:
          'bg-red-50 text-red-700 border border-red-200 font-semibold dark:bg-red-950/70 dark:text-red-300 dark:border-red-500/30',
        shopping:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
