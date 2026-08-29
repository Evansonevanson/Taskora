import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-10 w-full appearance-none rounded-lg border border-stone-300/80 bg-stone-50/80 py-2 pr-9 pl-3.5 text-sm text-stone-900 shadow-sm transition-colors duration-150',
            'focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-100',
            error && 'border-red-500/80 focus-visible:ring-red-500/40',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 dark:text-stone-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    );
  },
);
Select.displayName = 'Select';

export { Select };
