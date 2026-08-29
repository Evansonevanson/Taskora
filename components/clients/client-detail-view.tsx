'use client';

import * as React from 'react';
import { ClientDetailHeader } from './client-detail-header';
import { ClientDetailStats } from './client-detail-stats';
import { EditClientDialog } from './edit-client-dialog';
import { DeactivateClientDialog } from './deactivate-client-dialog';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { CompleteTaskDialog } from '@/components/tasks/complete-task-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Search,
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  Archive,
  Edit2,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { toggleTaskStatus, archiveTask } from '@/lib/actions/tasks';
import type { ClientDetailData, ActiveClientOption } from '@/lib/data/clients';
import type { AdminTaskItem } from '@/lib/data/tasks';

export interface ClientDetailViewProps {
  initialData: ClientDetailData;
  activeClients: ActiveClientOption[];
}

export function ClientDetailView({
  initialData,
  activeClients,
}: ClientDetailViewProps) {
  const { client, tasks, stats } = initialData;

  // Dialog States
  const [isNewTaskOpen, setIsNewTaskOpen] = React.useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = React.useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false);
  const [selectedEditTask, setSelectedEditTask] =
    React.useState<AdminTaskItem | null>(null);
  const [selectedCompleteTask, setSelectedCompleteTask] =
    React.useState<AdminTaskItem | null>(null);

  // Filter & Search States
  const [activeTab, setActiveTab] = React.useState<
    'active' | 'completed' | 'all'
  >('active');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [pendingActionTaskId, setPendingActionTaskId] = React.useState<
    string | null
  >(null);

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filtered Tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Tab filtering
      if (activeTab === 'active') {
        if (task.status.toLowerCase() !== 'pending' || task.archived)
          return false;
      } else if (activeTab === 'completed') {
        if (task.status.toLowerCase() !== 'completed') return false;
      }

      // Search filtering
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [tasks, activeTab, debouncedSearch]);

  const handleToggleStatus = async (
    task: AdminTaskItem,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    // If marking complete and not yet completed, open complete dialog to allow email notification
    if (task.status.toLowerCase() === 'pending') {
      setSelectedCompleteTask(task);
      return;
    }

    setPendingActionTaskId(task.id);
    try {
      await toggleTaskStatus(task.id, 'pending');
    } finally {
      setPendingActionTaskId(null);
    }
  };

  const handleArchive = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingActionTaskId(taskId);
    try {
      await archiveTask(taskId);
    } finally {
      setPendingActionTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <ClientDetailHeader
        client={client}
        onNewTaskClick={() => setIsNewTaskOpen(true)}
        onEditClientClick={() => setIsEditClientOpen(true)}
        onToggleStatusClick={() => setIsDeactivateOpen(true)}
      />

      {/* Mini Stats Bar */}
      <ClientDetailStats stats={stats} />

      {/* Assigned Deliverables Section */}
      <div className="space-y-4 rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
        {/* Toolbar: Tabs & Search */}
        <div className="flex flex-col gap-3 border-b border-stone-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Segmented Filter Tabs */}
          <div className="inline-flex rounded-xl border border-stone-800 bg-stone-950/80 p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Active Jobs</span>
              <span className="py-0.2 ml-1 rounded-full border border-amber-800/40 bg-amber-950/80 px-1.5 text-[10px] text-amber-300">
                {stats.activeTasks}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'completed'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Completed</span>
              <span className="py-0.2 ml-1 rounded-full border border-emerald-800/40 bg-emerald-950/80 px-1.5 text-[10px] text-emerald-300">
                {stats.completedTasks}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>All History</span>
              <span className="py-0.2 ml-1 rounded-full bg-stone-800 px-1.5 text-[10px] text-stone-300">
                {stats.totalTasks}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          </div>
        </div>

        {/* Deliverables Table */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No deliverables found"
            description={
              searchQuery
                ? 'No deliverables match your search criteria.'
                : activeTab === 'active'
                  ? 'There are no active deliverables currently in progress for this client.'
                  : 'No completed deliverables recorded for this client.'
            }
            icon={FolderKanban}
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewTaskOpen(true)}
                className="gap-1.5 bg-indigo-600 text-xs hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Deliverable</span>
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-800/80 bg-stone-900/60">
            <Table>
              <TableHeader>
                <TableRow className="border-stone-800 bg-stone-950/40 hover:bg-stone-950/40">
                  <TableHead className="w-10 text-center"></TableHead>
                  <TableHead>Deliverable</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-24 text-center">Priority</TableHead>
                  <TableHead className="w-32 text-center">Due Date</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const isCompleted = task.status.toLowerCase() === 'completed';
                  const formattedDueDate = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  const priorityVariant = (
                    ['low', 'medium', 'high'].includes(
                      task.priority.toLowerCase(),
                    )
                      ? task.priority.toLowerCase()
                      : 'medium'
                  ) as 'low' | 'medium' | 'high';

                  return (
                    <TableRow
                      key={task.id}
                      onClick={() => setSelectedEditTask(task)}
                      className="cursor-pointer border-stone-800/80 transition-colors hover:bg-stone-800/40"
                    >
                      {/* Checkbox Toggle */}
                      <TableCell
                        className="text-center"
                        onClick={(e) => handleToggleStatus(task, e)}
                      >
                        <button
                          type="button"
                          disabled={pendingActionTaskId === task.id}
                          className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-stone-500 hover:text-indigo-400" />
                          )}
                        </button>
                      </TableCell>

                      {/* Title & Notes */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                isCompleted
                                  ? 'text-stone-500 line-through'
                                  : 'text-stone-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.needsRevision && (
                              <Badge
                                variant="urgent"
                                className="flex items-center gap-1 px-1.5 py-0 text-[10px]"
                              >
                                <AlertCircle className="h-2.5 w-2.5" />
                                <span>Revision</span>
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

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={isCompleted ? 'completed' : 'pending'}
                          className="text-[10px]"
                        >
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </Badge>
                      </TableCell>

                      {/* Priority */}
                      <TableCell className="text-center">
                        <Badge
                          variant={priorityVariant}
                          className="text-[10px]"
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>

                      {/* Due Date */}
                      <TableCell className="text-center text-xs text-stone-400">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-3 w-3 text-stone-500" />
                          <span>{formattedDueDate}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEditTask(task)}
                            className="h-7 w-7 p-0 text-stone-400 hover:text-stone-200"
                            title="Edit task"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          {!task.archived && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={pendingActionTaskId === task.id}
                              onClick={(e) => handleArchive(task.id, e)}
                              className="h-7 w-7 p-0 text-stone-400 hover:text-stone-200"
                              title="Archive deliverable"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Client Dialog */}
      <EditClientDialog
        isOpen={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        client={client}
      />

      {/* Deactivate Client Dialog */}
      <DeactivateClientDialog
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        client={client}
      />

      {/* Create Task Dialog (Preselected with this client) */}
      <CreateTaskDialog
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        clients={activeClients}
        preselectedClientId={client.id}
      />

      {/* Edit Task Dialog */}
      {selectedEditTask && (
        <EditTaskDialog
          isOpen={Boolean(selectedEditTask)}
          onClose={() => setSelectedEditTask(null)}
          task={selectedEditTask}
          clients={activeClients}
        />
      )}

      {/* Complete Task Dialog */}
      {selectedCompleteTask && (
        <CompleteTaskDialog
          isOpen={Boolean(selectedCompleteTask)}
          onClose={() => setSelectedCompleteTask(null)}
          task={selectedCompleteTask}
        />
      )}
    </div>
  );
}
