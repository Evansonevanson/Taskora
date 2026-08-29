import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-indigo-500/10',
        primary:
          'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-indigo-500/10',
        secondary:
          'bg-stone-800/80 text-stone-100 hover:bg-stone-700/80 border border-stone-700/80 focus-visible:ring-stone-400',
        outline:
          'border border-stone-700 bg-transparent text-stone-200 hover:bg-stone-800/60 hover:text-white focus-visible:ring-indigo-500',
        ghost:
          'text-stone-300 hover:bg-stone-800/50 hover:text-white focus-visible:ring-stone-500',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500',
        link: 'text-indigo-400 underline-offset-4 hover:underline p-0 h-auto font-normal',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base font-semibold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(
          buttonVariants({ variant, size, className }),
          child.props.className,
        ),
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
