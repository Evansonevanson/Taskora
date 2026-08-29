'use client';

import * as React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ClientStatusFilterOption = 'all' | 'active' | 'inactive';
export type ClientSortOption = 'newest' | 'company' | 'active_jobs';

export interface ClientTableToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: ClientStatusFilterOption;
  onStatusFilterChange: (filter: ClientStatusFilterOption) => void;
  sortBy: ClientSortOption;
  onSortByChange: (sort: ClientSortOption) => void;
  activeCount: number;
  totalCount: number;
}

export function ClientTableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  activeCount,
  totalCount,
}: ClientTableToolbarProps) {
  // Local state for debounced search input
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  // 250ms debounce for search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const tabs: Array<{
    id: ClientStatusFilterOption;
    label: string;
    count?: number;
  }> = [
    { id: 'all', label: 'All Clients', count: totalCount },
    { id: 'active', label: 'Active', count: activeCount },
    { id: 'inactive', label: 'Inactive', count: totalCount - activeCount },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search & Tabs Row */}
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Search by client, company, email..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-stone-300/80 bg-white/80 pr-3 pl-9 text-xs text-stone-900 transition-colors placeholder:text-stone-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-200 dark:placeholder:text-stone-500"
          />
        </div>

        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-stone-100/80 p-1 dark:border-stone-800/80 dark:bg-stone-900/60">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'border border-indigo-200 bg-white text-indigo-700 shadow-xs dark:border-indigo-500/30 dark:bg-indigo-600/20 dark:text-indigo-300'
                    : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-200',
                )}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={cn(
                      'py-0.2 rounded-full px-1.5 text-[10px] font-semibold',
                      isActive
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-200'
                        : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white/80 px-2.5 py-1 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400">
          <SlidersHorizontal className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
          <span className="text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as ClientSortOption)}
            className="cursor-pointer bg-transparent text-xs text-stone-800 focus:outline-none dark:text-stone-200"
          >
            <option
              value="newest"
              className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-200"
            >
              Newest
            </option>
            <option
              value="company"
              className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-200"
            >
              Company (A–Z)
            </option>
            <option
              value="active_jobs"
              className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-200"
            >
              Most Active Jobs
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
