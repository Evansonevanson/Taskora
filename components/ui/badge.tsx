import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-stone-800 text-stone-200 border border-stone-700/60',
        primary: 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30',
        secondary: 'bg-stone-900 text-stone-300 border border-stone-800',
        destructive: 'bg-red-950/70 text-red-300 border border-red-500/30',
        outline: 'border border-stone-700 text-stone-300',
        // Status Variants
        todo: 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30',
        in_progress:
          'bg-amber-950/60 text-amber-300 border border-amber-500/30',
        completed:
          'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
        done: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
        overdue: 'bg-red-950/70 text-red-300 border border-red-500/30',
        pending: 'bg-slate-900 text-slate-300 border border-slate-700/60',
        // Priority Variants
        high: 'bg-red-950/70 text-red-300 border border-red-500/30 font-semibold',
        medium: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
        low: 'bg-stone-900 text-stone-400 border border-stone-800',
        // Category Variants
        general: 'bg-stone-800/80 text-stone-300 border border-stone-700/50',
        work: 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30',
        personal: 'bg-teal-950/60 text-teal-300 border border-teal-500/30',
        urgent:
          'bg-red-950/70 text-red-300 border border-red-500/30 font-semibold',
        shopping: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
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
