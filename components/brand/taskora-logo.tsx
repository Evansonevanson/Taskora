import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface TaskoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
}

const sizeConfig = {
  sm: {
    // 519x429 aspect ratio (~1.21:1): 30px height -> 36px width desktop, 26px height -> 31px width mobile
    width: 36,
    height: 30,
    iconClass: 'h-[26px] w-auto sm:h-[30px]',
    textSize: 'text-base sm:text-lg',
    gap: 'gap-2 sm:gap-2.5',
  },
  md: {
    width: 46,
    height: 38,
    iconClass: 'h-[34px] w-auto sm:h-[38px]',
    textSize: 'text-lg sm:text-xl',
    gap: 'gap-2.5 sm:gap-3',
  },
  lg: {
    width: 58,
    height: 48,
    iconClass: 'h-[42px] w-auto sm:h-[48px]',
    textSize: 'text-xl sm:text-2xl',
    gap: 'gap-3 sm:gap-3.5',
  },
};

export function TaskoraLogo({
  size = 'sm',
  showWordmark = true,
  className,
  iconClassName,
  priority = false,
}: TaskoraLogoProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn('inline-flex items-center', config.gap, className)}>
      <Image
        src="/brand/logo-icon.png"
        alt="Taskora Logo"
        width={config.width}
        height={config.height}
        priority={priority}
        className={cn(
          'shrink-0 object-contain transition-transform duration-150 group-hover:scale-105',
          config.iconClass,
          iconClassName,
        )}
      />

      {showWordmark && (
        <span
          className={cn(
            'font-bold tracking-tight text-stone-900 transition-colors dark:text-white',
            config.textSize,
          )}
        >
          Taskora
        </span>
      )}
    </div>
  );
}
