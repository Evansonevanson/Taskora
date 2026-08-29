'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import type { ActiveClientOption } from '@/lib/data/clients';

export interface DashboardHeaderProps {
  clients: ActiveClientOption[];
}

export function DashboardHeader({ clients }: DashboardHeaderProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            Overview of active tasks, sprint progress, and priority assignments.
          </p>
        </div>

        <div>
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            className="w-full gap-2 shadow-lg shadow-indigo-500/20 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      <CreateTaskDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        clients={clients}
      />
    </>
  );
}
