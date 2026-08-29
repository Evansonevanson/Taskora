'use client';

import * as React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type Theme } from './theme-provider';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
  align?: 'left' | 'right';
}

const themeOptions: Array<{
  id: Theme;
  label: string;
  icon: typeof Sun;
}> = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle({ className, align = 'right' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const ActiveIcon =
    theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  const handleSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <div
      className={cn('relative inline-flex items-center', className)}
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200/80 bg-stone-100/80 text-stone-700 transition-colors duration-150',
          'hover:border-stone-300 hover:bg-stone-200/70 hover:text-stone-900',
          'dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:border-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-100',
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Switch theme (currently ${theme})`}
        title={`Switch theme (currently ${theme})`}
      >
        <ActiveIcon className="h-4 w-4 transition-transform duration-150 hover:scale-105" />
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Theme options"
          className={cn(
            'animate-in fade-in-80 zoom-in-95 absolute top-full z-50 mt-1.5 w-36 origin-top-right rounded-xl border border-stone-200 bg-white/95 p-1 text-stone-900 shadow-xl ring-1 ring-black/5 backdrop-blur-xl duration-150',
            'dark:border-stone-800 dark:bg-stone-900/95 dark:text-stone-100 dark:shadow-2xl dark:ring-white/5',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
            Appearance
          </div>

          <div role="group" aria-label="Theme options">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150',
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-stone-400 dark:text-stone-500',
                      )}
                    />
                    <span>{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 stroke-[2.5] text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
