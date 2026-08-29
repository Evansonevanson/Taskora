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
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-800 bg-stone-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-100">
              Welcome back, {client.displayName}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            {client.companyName && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-stone-500" />
                <span className="font-medium text-stone-300">
                  {client.companyName}
                </span>
                <span className="text-stone-600">•</span>
              </span>
            )}
            <span>Client Deliverables Portal</span>
          </div>
        </div>

        {/* Deliverable Stat Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-950/60 px-3 py-1.5 text-xs text-stone-300">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-semibold text-stone-100">
              {stats.totalDelivered}
            </span>
            <span className="text-stone-400">Total Deliverables</span>
          </div>

          {stats.inRevision > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs text-amber-300">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-amber-200">
                {stats.inRevision}
              </span>
              <span>In Revision</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-200">
              {stats.completed}
            </span>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
