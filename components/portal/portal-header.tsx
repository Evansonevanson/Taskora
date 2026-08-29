'use client';

import * as React from 'react';
import { Building2, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { PortalClientInfo, PortalStats } from '@/lib/data/portal';

export interface PortalHeaderProps {
  client: PortalClientInfo;
  stats: PortalStats;
}

export function PortalHeader({ client, stats }: PortalHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-stone-900/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Welcome back, {client.displayName}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
            {client.companyName && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {client.companyName}
                </span>
                <span className="text-stone-400 dark:text-stone-600">•</span>
              </span>
            )}
            <span>Client Deliverables Portal</span>
          </div>
        </div>

        {/* Deliverable Stat Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100/80 px-3 py-1.5 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
            <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {stats.totalDelivered}
            </span>
            <span className="text-stone-500 dark:text-stone-400">
              Total Deliverables
            </span>
          </div>

          {stats.inRevision > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                {stats.inRevision}
              </span>
              <span>In Revision</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">
              {stats.completed}
            </span>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
