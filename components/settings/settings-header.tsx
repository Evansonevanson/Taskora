'use client';

import * as React from 'react';
import { Sliders, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800/80">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-white">
              Platform Settings
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Configure task categories, notification delivery defaults, and
              account controls.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Badge
          variant="work"
          className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Admin Access Only</span>
        </Badge>
      </div>
    </div>
  );
}
