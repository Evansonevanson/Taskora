'use client';

import * as React from 'react';
import {
  Check,
  Calendar,
  AlertCircle,
  Building2,
  ListTodo,
  Edit2,
  Archive,
  Loader2,
  Globe,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  TaskTableToolbar,
  type StatusFilterOption,
  type SortOption,
} from './task-table-toolbar';
import { ClearCompletedDialog } from './clear-completed-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { CompleteTaskDialog } from '@/components/tasks/complete-task-dialog';
import { toggleTaskStatus, archiveTask } from '@/lib/actions/tasks';
import { cn } from '@/lib/utils';
import type { AdminTaskItem } from '@/lib/data/tasks';
import type { ActiveClientOption } from '@/lib/data/clients';

export interface TaskTableProps {
  tasks: AdminTaskItem[];
  clients: ActiveClientOption[];
}

export function TaskTable({ tasks, clients }: TaskTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilterOption>('all');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('newest');
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<AdminTaskItem | null>(
    null,
  );
  const [completingTask, setCompletingTask] =
    React.useState<AdminTaskItem | null>(null);
  const [togglingIds, setTogglingIds] = React.useState<Set<string>>(new Set());
  const [archivingIds, setArchivingIds] = React.useState<Set<string>>(
    new Set(),
  );

  // Completed count for active tasks
  const completedCount = tasks.filter(
    (t) => t.status.toLowerCase() === 'completed',
  ).length;

  // Status toggle handler
  const handleToggleStatus = async (
    e: React.MouseEvent,
    task: AdminTaskItem,
  ) => {
    e.stopPropagation();

    // If pending Work task with client, prompt with CompleteTaskDialog
    if (
      task.status.toLowerCase() === 'pending' &&
      task.category === 'work' &&
      task.clientId
    ) {
      setCompletingTask(task);
      return;
    }

    setTogglingIds((prev) => new Set(prev).add(task.id));
    try {
      await toggleTaskStatus(task.id, task.status);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  // Single task archive handler
  const handleArchiveTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setArchivingIds((prev) => new Set(prev).add(taskId));
    try {
      await archiveTask(taskId);
    } finally {
      setArchivingIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  // Filter & Search logic
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Status Filter
      if (
        statusFilter === 'pending' &&
        task.status.toLowerCase() === 'completed'
      ) {
        return false;
      }
      if (
        statusFilter === 'completed' &&
        task.status.toLowerCase() !== 'completed'
      ) {
        return false;
      }
      if (
        statusFilter === 'high_priority' &&
        (task.priority.toLowerCase() !== 'high' ||
          task.status.toLowerCase() === 'completed')
      ) {
        return false;
      }
      if (statusFilter === 'revisions' && !task.needsRevision) {
        return false;
      }

      // Category Filter
      if (
        categoryFilter !== 'all' &&
        task.category.toLowerCase() !== categoryFilter.toLowerCase()
      ) {
        return false;
      }

      // Search Query (title and notes)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query) || false;
        const matchesClient =
          task.clientName?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesNotes && !matchesClient) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, statusFilter, categoryFilter, searchQuery]);

  // Sort logic
  const sortedTasks = React.useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === 'newest') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === 'oldest') {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortBy === 'due_date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = {
          high: 3,
          medium: 2,
          low: 1,
        };
        const pA = priorityOrder[a.priority.toLowerCase()] || 0;
        const pB = priorityOrder[b.priority.toLowerCase()] || 0;
        return pB - pA;
      }
      return 0;
    });
  }, [filteredTasks, sortBy]);

  // Format Due Date
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const isToday = new Date().toDateString() === date.toDateString();
    const isOverdue =
      date < new Date(new Date().setHours(0, 0, 0, 0)) && !isToday;

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });

    return { formatted, isOverdue, isToday };
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <TaskTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        completedCount={completedCount}
        onClearCompletedClick={() => setIsClearDialogOpen(true)}
      />

      {/* Task Table Container */}
      <div className="overflow-hidden rounded-xl border border-stone-800/80 bg-stone-900/40 shadow-sm">
        {sortedTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title={
              tasks.length === 0
                ? 'No tasks created yet'
                : 'No tasks match your filters'
            }
            description={
              tasks.length === 0
                ? 'Get started by creating your first freelance or personal task.'
                : 'Try adjusting your search query, status tabs, or category filter.'
            }
            className="border-0 bg-transparent py-16"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-stone-800 bg-stone-900/80 hover:bg-stone-900/80">
                <TableHead className="w-12 text-center">Status</TableHead>
                <TableHead>Task Details</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden lg:table-cell">Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => {
                const isCompleted = task.status.toLowerCase() === 'completed';
                const isToggling = togglingIds.has(task.id);
                const isArchiving = archivingIds.has(task.id);
                const dueInfo = formatDueDate(task.dueDate);

                return (
                  <TableRow
                    key={task.id}
                    onClick={() => setEditingTask(task)}
                    className={cn(
                      'group cursor-pointer border-stone-800/60 transition-colors hover:bg-stone-800/30',
                      isCompleted && 'bg-stone-950/30 opacity-60',
                    )}
                  >
                    {/* Status Checkbox Toggle */}
                    <TableCell className="w-12 p-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(e, task)}
                        disabled={isToggling || isArchiving}
                        aria-label={
                          isCompleted
                            ? `Mark "${task.title}" as pending`
                            : `Mark "${task.title}" as complete`
                        }
                        className={cn(
                          'mx-auto flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150',
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-600 text-white'
                            : 'border-stone-700 bg-stone-900 hover:border-indigo-500',
                          isToggling && 'animate-pulse opacity-50',
                        )}
                      >
                        {isCompleted && <Check className="h-3.5 w-3.5" />}
                      </button>
                    </TableCell>

                    {/* Task Title & Notes */}
                    <TableCell className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-xs leading-tight font-semibold text-stone-100 transition-colors group-hover:text-indigo-300',
                              isCompleted && 'text-stone-400 line-through',
                            )}
                          >
                            {task.title}
                          </span>
                          {task.projectUrl && (
                            <a
                              href={task.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-stone-400 hover:text-indigo-300"
                              title={`Project Link: ${task.projectUrl}`}
                            >
                              <Globe className="h-3 w-3" />
                            </a>
                          )}
                          {task.needsRevision && (
                            <Badge
                              variant="urgent"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              <AlertCircle className="mr-1 h-2.5 w-2.5" />
                              <span>Needs Revision</span>
                            </Badge>
                          )}
                        </div>

                        {task.notes && (
                          <p className="line-clamp-1 text-[11px] text-stone-400">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Category Badge */}
                    <TableCell className="hidden p-3 md:table-cell">
                      <Badge
                        variant={
                          task.category.toLowerCase() as
                            | 'work'
                            | 'personal'
                            | 'urgent'
                            | 'general'
                            | 'shopping'
                        }
                        className="text-[10px] capitalize"
                      >
                        {task.category}
                      </Badge>
                    </TableCell>

                    {/* Client Name (if Work) */}
                    <TableCell className="hidden p-3 sm:table-cell">
                      {task.clientName ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-stone-300">
                          <Building2 className="h-3 w-3 text-stone-500" />
                          <span className="max-w-[120px] truncate">
                            {task.clientName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-600">—</span>
                      )}
                    </TableCell>

                    {/* Priority Badge */}
                    <TableCell className="hidden p-3 lg:table-cell">
                      <Badge
                        variant={
                          task.priority.toLowerCase() as
                            'high' | 'medium' | 'low'
                        }
                        className="text-[10px] capitalize"
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className="p-3">
                      {dueInfo ? (
                        <div
                          className={cn(
                            'inline-flex items-center gap-1 text-xs',
                            dueInfo.isOverdue && !isCompleted
                              ? 'font-medium text-red-400'
                              : dueInfo.isToday && !isCompleted
                                ? 'font-medium text-amber-400'
                                : 'text-stone-400',
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>{dueInfo.formatted}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-600">No date</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                          }}
                          className="h-7 w-7 p-0 text-stone-400 hover:bg-stone-800/60 hover:text-stone-100"
                          aria-label={`Edit "${task.title}"`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleArchiveTask(e, task.id)}
                          disabled={isArchiving}
                          className="h-7 w-7 p-0 text-stone-400 hover:bg-red-950/30 hover:text-red-400"
                          aria-label={`Archive "${task.title}"`}
                        >
                          {isArchiving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />
                          ) : (
                            <Archive className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Complete Task Dialog with Email Notification Toggle */}
      <CompleteTaskDialog
        task={completingTask}
        isOpen={Boolean(completingTask)}
        onClose={() => setCompletingTask(null)}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        clients={clients}
      />

      {/* Clear Completed Confirmation Modal */}
      <ClearCompletedDialog
        isOpen={isClearDialogOpen}
        onClose={() => setIsClearDialogOpen(false)}
        completedCount={completedCount}
      />
    </div>
  );
}
