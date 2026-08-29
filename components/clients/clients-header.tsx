'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Building2, CheckCircle2 } from 'lucide-react';

export interface ClientsHeaderProps {
  totalClients: number;
  activeClients: number;
  totalDeliverables: number;
  onAddClientClick?: () => void;
}

export function ClientsHeader({
  totalClients,
  activeClients,
  totalDeliverables,
  onAddClientClick,
}: ClientsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Client Management
        </h1>
        <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
          Manage client accounts, monitor deliverable progress, and provision
          access.
        </p>

        {/* Quick Metrics Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-100/80 px-2.5 py-1 text-xs text-stone-700 dark:border-stone-800/80 dark:bg-stone-900/60 dark:text-stone-300">
            <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {totalClients}
            </span>
            <span className="text-stone-500 dark:text-stone-400">
              Total Clients
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-300">
            <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">
              {activeClients}
            </span>
            <span className="text-emerald-700 dark:text-emerald-400/80">
              Active
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-100/80 px-2.5 py-1 text-xs text-stone-700 dark:border-stone-800/80 dark:bg-stone-900/60 dark:text-stone-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {totalDeliverables}
            </span>
            <span className="text-stone-500 dark:text-stone-400">
              Total Deliverables
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={onAddClientClick}
        className="shrink-0 gap-2 self-start shadow-sm shadow-indigo-500/10 sm:self-auto"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Client</span>
      </Button>
    </div>
  );
}
