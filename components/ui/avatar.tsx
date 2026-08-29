import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full bg-stone-100 font-semibold text-stone-800 border border-stone-300/80 overflow-hidden select-none dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700/60',
  {
    variants: {
      size: {
        sm: 'h-7 w-7 text-xs',
        default: 'h-9 w-9 text-sm',
        lg: 'h-11 w-11 text-base',
        xl: 'h-14 w-14 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface AvatarProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  name?: string | null;
  src?: string | null;
  fallbackIcon?: boolean;
}

export function Avatar({
  className,
  size,
  name,
  src,
  fallbackIcon = false,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (fullName?: string | null): string => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <span className="tracking-tight">{initials}</span>
      ) : fallbackIcon || !name ? (
        <User className="h-1/2 w-1/2 text-stone-500 dark:text-stone-400" />
      ) : null}
    </div>
  );
}
