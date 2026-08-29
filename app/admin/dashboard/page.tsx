import * as React from 'react';
import type { Metadata } from 'next';
import { getAdminDashboardStats, getAdminTasks } from '@/lib/data/tasks';
import { getActiveClients } from '@/lib/data/clients';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { ProgressSummary } from '@/components/dashboard/progress-summary';
import { TaskTable } from '@/components/dashboard/task-table';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Taskora',
  description: 'Manage tasks, progress, and review workflow.',
};

export default async function AdminDashboardPage() {
  const [stats, tasks, clients] = await Promise.all([
    getAdminDashboardStats(),
    getAdminTasks(),
    getActiveClients(),
  ]);

  return (
    <div className="animate-in fade-in-50 space-y-8 duration-200">
      {/* Page Header with New Task trigger */}
      <DashboardHeader clients={clients} />

      {/* Stat Cards Grid */}
      <StatCards stats={stats} />

      {/* Progress Bar Summary */}
      <ProgressSummary
        completed={stats.completed}
        total={stats.total}
        percentage={stats.percentage}
      />

      {/* Task List Table */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-semibold text-white">
          Tasks & Deliverables
        </h2>
        <TaskTable tasks={tasks} clients={clients} />
      </div>
    </div>
  );
}
