'use client';

import * as React from 'react';
import { PortalHeader } from './portal-header';
import { PortalDeliverableCard } from './portal-deliverable-card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, FolderKanban } from 'lucide-react';
import type { PortalData } from '@/lib/data/portal';

export interface PortalViewProps {
  initialData: PortalData;
}

export function PortalView({ initialData }: PortalViewProps) {
  const { client, tasks, stats } = initialData;

  const [activeTab, setActiveTab] = React.useState<
    'all' | 'revision' | 'ready'
  >('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (activeTab === 'revision' && !task.needsRevision) return false;
      if (activeTab === 'ready' && task.needsRevision) return false;

      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes) return false;
      }

      return true;
    });
  }, [tasks, activeTab, debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Welcome & Stats Banner */}
      <PortalHeader client={client} stats={stats} />

      {/* Deliverables Section */}
      <div className="space-y-4">
        {/* Toolbar: Segmented Tabs & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100/80 p-1 dark:border-stone-800 dark:bg-stone-900/80">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <span>All Deliverables</span>
              <span className="py-0.2 ml-1 rounded-full bg-stone-200 px-1.5 text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                {stats.totalDelivered}
              </span>
            </button>

            {stats.inRevision > 0 && (
              <button
                onClick={() => setActiveTab('revision')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'revision'
                    ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <span>In Revision</span>
                <span className="py-0.2 ml-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 text-[10px] text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/80 dark:text-amber-300">
                  {stats.inRevision}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('ready')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'ready'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <span>Ready</span>
              <span className="py-0.2 ml-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 text-[10px] text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/80 dark:text-emerald-300">
                {stats.completed}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          </div>
        </div>

        {/* Deliverables Card Grid */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No deliverables found"
            description={
              searchQuery
                ? 'No deliverables match your search query.'
                : activeTab === 'revision'
                  ? 'No deliverables are currently under revision.'
                  : 'Your deliverables will appear here once ready for review.'
            }
            icon={FolderKanban}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredTasks.map((task) => (
              <PortalDeliverableCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
