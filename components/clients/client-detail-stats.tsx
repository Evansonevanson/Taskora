'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Layers, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ClientDetailStatsProps {
  stats: {
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    revisionRequestedTasks: number;
  };
}

export function ClientDetailStats({ stats }: ClientDetailStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {/* Total Deliverables */}
      <Card className="flex flex-col justify-between border-stone-200/80 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Total Deliverables
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Layers className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {stats.totalTasks}
        </div>
      </Card>

      {/* In Progress */}
      <Card className="flex flex-col justify-between border-stone-200/80 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            In Progress
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {stats.activeTasks}
        </div>
      </Card>

      {/* Revision Requested */}
      <Card
        className={`flex flex-col justify-between p-4 shadow-sm ${
          stats.revisionRequestedTasks > 0
            ? 'border-amber-300 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/20'
            : 'border-stone-200/80 bg-white/80 dark:border-stone-800 dark:bg-stone-900/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-medium ${
              stats.revisionRequestedTasks > 0
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            Revision Requested
          </span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
              stats.revisionRequestedTasks > 0
                ? 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-stone-200 bg-stone-100 text-stone-500 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-500'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
        </div>
        <div
          className={`mt-3 text-2xl font-bold tracking-tight ${
            stats.revisionRequestedTasks > 0
              ? 'text-amber-900 dark:text-amber-200'
              : 'text-stone-900 dark:text-stone-100'
          }`}
        >
          {stats.revisionRequestedTasks}
        </div>
      </Card>

      {/* Completed */}
      <Card className="flex flex-col justify-between border-stone-200/80 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Completed
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {stats.completedTasks}
        </div>
      </Card>
    </div>
  );
}
