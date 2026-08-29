'use client';

import * as React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme, type Theme } from '@/components/theme/theme-provider';
import { cn } from '@/lib/utils';

interface AppearanceSettingsCardProps {
  onThemeChange?: () => void;
}

const themeOptions: Array<{
  id: Theme;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    id: 'light',
    label: 'Light',
    description: 'Clean, high-contrast light interface',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Sleek, low-glare dark workspace',
    icon: Moon,
  },
  {
    id: 'system',
    label: 'System',
    description: 'Syncs automatically with OS settings',
    icon: Monitor,
  },
];

export function AppearanceSettingsCard({
  onThemeChange,
}: AppearanceSettingsCardProps) {
  const { theme, setTheme } = useTheme();

  const handleSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    onThemeChange?.();
  };

  return (
    <Card className="border-stone-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-stone-900 dark:text-stone-100">
          Appearance
        </CardTitle>
        <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
          Choose how Taskora looks on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="radiogroup"
          aria-label="Appearance theme options"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  'group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/20 dark:ring-indigo-500'
                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-stone-100/60 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-stone-700 dark:hover:bg-stone-900/50',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-400 dark:group-hover:bg-stone-700',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white dark:bg-indigo-500">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      isSelected
                        ? 'text-indigo-950 dark:text-white'
                        : 'text-stone-900 dark:text-stone-200',
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
