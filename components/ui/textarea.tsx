import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-stone-300/80 bg-stone-50/80 px-3.5 py-2 text-sm text-stone-900 shadow-sm transition-colors duration-150 placeholder:text-stone-400 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder:text-stone-500',
          'focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500/80 focus-visible:ring-red-500/40',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
