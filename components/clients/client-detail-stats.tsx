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
      <Card className="flex flex-col justify-between border-stone-800 bg-stone-900/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">
            Total Deliverables
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-950/40 text-indigo-400">
            <Layers className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-stone-100">
          {stats.totalTasks}
        </div>
      </Card>

      {/* In Progress */}
      <Card className="flex flex-col justify-between border-stone-800 bg-stone-900/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">
            In Progress
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-950/40 text-amber-400">
            <Clock className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-stone-100">
          {stats.activeTasks}
        </div>
      </Card>

      {/* Revision Requested */}
      <Card
        className={`flex flex-col justify-between p-4 ${
          stats.revisionRequestedTasks > 0
            ? 'border-amber-500/30 bg-amber-950/20'
            : 'border-stone-800 bg-stone-900/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-medium ${
              stats.revisionRequestedTasks > 0
                ? 'text-amber-300'
                : 'text-stone-400'
            }`}
          >
            Revision Requested
          </span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
              stats.revisionRequestedTasks > 0
                ? 'border-amber-500/30 bg-amber-950/40 text-amber-300'
                : 'border-stone-800 bg-stone-800/40 text-stone-500'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
        </div>
        <div
          className={`mt-3 text-2xl font-bold tracking-tight ${
            stats.revisionRequestedTasks > 0
              ? 'text-amber-200'
              : 'text-stone-100'
          }`}
        >
          {stats.revisionRequestedTasks}
        </div>
      </Card>

      {/* Completed */}
      <Card className="flex flex-col justify-between border-stone-800 bg-stone-900/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">Completed</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/40 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-stone-100">
          {stats.completedTasks}
        </div>
      </Card>
    </div>
  );
}
