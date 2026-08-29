'use client';

import * as React from 'react';
import { Search, X, Archive, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type StatusFilterOption =
  'all' | 'pending' | 'completed' | 'high_priority' | 'revisions';
export type SortOption = 'newest' | 'oldest' | 'due_date' | 'priority';

export interface TaskTableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (filter: StatusFilterOption) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  completedCount: number;
  onClearCompletedClick: () => void;
}

const statusFilters: { label: string; value: StatusFilterOption }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'High Priority', value: 'high_priority' },
  { label: 'Needs Revision', value: 'revisions' },
];

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'General', value: 'general' },
  { label: 'Shopping', value: 'shopping' },
];

export function TaskTableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  onSortByChange,
  completedCount,
  onClearCompletedClick,
}: TaskTableToolbarProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  // 250ms debounce for search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="space-y-4">
      {/* Top Row: Search Input & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search tasks by title or notes..."
            className="h-10 w-full rounded-xl border border-stone-300/80 bg-white/80 pr-8 pl-9 text-xs text-stone-900 placeholder-stone-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right Actions: Category, Sort & Clear Completed */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="h-10 rounded-xl border border-stone-300/80 bg-white/80 px-3 text-xs text-stone-800 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-200"
            aria-label="Filter by category"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="h-10 appearance-none rounded-xl border border-stone-300/80 bg-white/80 pr-8 pl-8 text-xs text-stone-800 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-200"
              aria-label="Sort tasks"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          </div>

          {/* Clear Completed Button */}
          {completedCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearCompletedClick}
              className="gap-1.5 text-xs text-stone-700 hover:border-amber-500/40 hover:text-amber-600 dark:text-stone-300 dark:hover:text-amber-300"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Clear Completed ({completedCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {statusFilters.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusFilterChange(tab.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'border border-stone-300/80 bg-stone-100/80 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 dark:border-stone-800/80 dark:bg-stone-900/40 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-200',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
