'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Edit3,
  AlertCircle,
  Building2,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { updateTask, archiveTask } from '@/lib/actions/tasks';
import { updateTaskSchema, type UpdateTaskInput } from '@/lib/validation/task';
import type { ActiveClientOption } from '@/lib/data/clients';
import type { AdminTaskItem } from '@/lib/data/tasks';
import { cn } from '@/lib/utils';

import { CommentThread } from '@/components/comments/comment-thread';
import { TaskAttachmentsManager } from '@/components/tasks/task-attachments-manager';
import { getCommentsAction } from '@/lib/actions/comments';
import type { CommentItem } from '@/lib/data/comments';

export interface EditTaskDialogProps {
  task: AdminTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  clients: ActiveClientOption[];
}

interface EditTaskFormProps {
  task: AdminTaskItem;
  onClose: () => void;
  clients: ActiveClientOption[];
}

function EditTaskForm({ task, onClose, clients }: EditTaskFormProps) {
  const [formData, setFormData] = React.useState<UpdateTaskInput>(() => ({
    title: task.title,
    category: (task.category as UpdateTaskInput['category']) || 'general',
    clientId: task.clientId || '',
    priority: (task.priority as UpdateTaskInput['priority']) || 'medium',
    dueDate: task.dueDate || '',
    notes: task.notes || '',
    projectUrl: task.projectUrl || '',
    needsRevision: task.needsRevision,
  }));

  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    getCommentsAction(task.id)
      .then((data) => {
        if (isMounted) {
          setComments(data);
        }
      })
      .catch((err) =>
        console.error('Failed to load comments in edit dialog:', err),
      );

    return () => {
      isMounted = false;
    };
  }, [task.id]);

  const isWorkCategory = formData.category === 'work';

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const res = await archiveTask(task.id);
      if (res.success) {
        onClose();
      } else {
        setGeneralError(res.error || 'Failed to archive task');
      }
    } catch {
      setGeneralError('An unexpected error occurred while archiving.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const validation = updateTaskSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsPending(true);
    try {
      const res = await updateTask(task.id, validation.data);
      if (!res.success) {
        if (res.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(res.fieldErrors).forEach(([k, msgs]) => {
            if (msgs?.[0]) fieldErrors[k] = msgs[0];
          });
          setErrors(fieldErrors);
        }
        setGeneralError(res.error || 'Failed to update task');
        return;
      }
      onClose();
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Edit3 className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle className="text-stone-900 dark:text-stone-100">
              Edit Task
            </DialogTitle>
            <DialogDescription className="text-stone-500 dark:text-stone-400">
              Update task details, schedule, client assignment, or revision
              status.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {generalError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Revision Alert & Resolution Checkbox */}
        {task.needsRevision && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/80 p-3.5 dark:border-red-500/30 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>Client Requested Revision</span>
            </div>
            <p className="text-[11px] text-stone-700 dark:text-stone-300">
              The client requested changes on this deliverable. Once adjustments
              are complete, resolve the revision flag below.
            </p>
            <label className="flex cursor-pointer items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={!formData.needsRevision}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    needsRevision: !e.target.checked,
                  }))
                }
                disabled={isPending || isArchiving}
                className="h-4 w-4 rounded border-stone-300 bg-white text-indigo-600 focus:ring-indigo-500 dark:border-stone-700 dark:bg-stone-900"
              />
              <span className="text-xs font-medium text-stone-900 dark:text-stone-200">
                Mark revision as resolved
              </span>
            </label>
          </div>
        )}

        {/* Task Title */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-task-title">
            Task Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edit-task-title"
            placeholder="e.g. Design Landing Page wireframes"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className={cn('h-10 text-xs', errors.title && 'border-red-500')}
            disabled={isPending || isArchiving}
          />
          {errors.title && (
            <p className="text-[11px] text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Category & Client Dropdown Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-task-category">Category</Label>
            <select
              id="edit-task-category"
              value={formData.category}
              onChange={(e) => {
                const nextCategory = e.target
                  .value as UpdateTaskInput['category'];
                setFormData((prev) => ({
                  ...prev,
                  category: nextCategory,
                  clientId:
                    nextCategory === 'work'
                      ? prev.clientId || clients[0]?.id || ''
                      : '',
                }));
              }}
              disabled={isPending || isArchiving}
              className="h-10 w-full rounded-xl border border-stone-300/80 bg-white/80 px-3 text-xs text-stone-800 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="general">General</option>
              <option value="work">Work (Client)</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
              <option value="shopping">Shopping</option>
            </select>
          </div>

          {/* Client Selector (Required if Work) */}
          {isWorkCategory ? (
            <div className="space-y-1.5">
              <Label htmlFor="edit-task-client">
                Assigned Client <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="edit-task-client"
                  value={formData.clientId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientId: e.target.value,
                    }))
                  }
                  disabled={isPending || isArchiving || clients.length === 0}
                  className={cn(
                    'h-10 w-full appearance-none rounded-xl border border-stone-300/80 bg-white/80 pr-3 pl-8 text-xs text-stone-800 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200',
                    errors.clientId && 'border-red-500 focus:border-red-500',
                  )}
                >
                  {clients.length === 0 ? (
                    <option value="">No active clients available</option>
                  ) : (
                    clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName
                          ? `${c.companyName} (${c.displayName})`
                          : c.displayName}
                      </option>
                    ))
                  )}
                </select>
                <Building2 className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
              </div>
              {errors.clientId && (
                <p className="text-[11px] text-red-500">{errors.clientId}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="edit-task-due-date">Due Date</Label>
              <Input
                id="edit-task-due-date"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className={cn(
                  'h-10 text-xs',
                  errors.dueDate && 'border-red-500',
                )}
                disabled={isPending || isArchiving}
              />
              {errors.dueDate && (
                <p className="text-[11px] text-red-500">{errors.dueDate}</p>
              )}
            </div>
          )}
        </div>

        {/* Due Date (for Work category) */}
        {isWorkCategory && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-task-due-date-work">Due Date</Label>
            <Input
              id="edit-task-due-date-work"
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className={cn('h-10 text-xs', errors.dueDate && 'border-red-500')}
              disabled={isPending || isArchiving}
            />
            {errors.dueDate && (
              <p className="text-[11px] text-red-500">{errors.dueDate}</p>
            )}
          </div>
        )}

        {/* Priority Segmented Control */}
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => {
              const isSelected = formData.priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, priority: p }))
                  }
                  disabled={isPending || isArchiving}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium capitalize transition-all',
                    isSelected
                      ? p === 'high'
                        ? 'border-red-300 bg-red-50 text-red-800 shadow-xs dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-300'
                        : p === 'medium'
                          ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-xs dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xs dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-stone-300/80 bg-stone-50/50 text-stone-600 hover:border-stone-400 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-200',
                  )}
                >
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-task-notes">Notes / Requirements</Label>
          <Textarea
            id="edit-task-notes"
            rows={3}
            placeholder="Add key deliverables or internal specifications..."
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            error={Boolean(errors.notes)}
            disabled={isPending || isArchiving}
          />
          {errors.notes && (
            <p className="text-[11px] text-red-500">{errors.notes}</p>
          )}
        </div>

        {/* Project Link */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-task-project-url">Project Link (Optional)</Label>
          <Input
            id="edit-task-project-url"
            type="url"
            placeholder="https://figma.com/file/... or https://drive.google.com/..."
            value={formData.projectUrl || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))
            }
            className={cn(
              'h-10 text-xs',
              errors.projectUrl && 'border-red-500 focus-visible:ring-red-500',
            )}
            disabled={isPending || isArchiving}
          />
          {errors.projectUrl ? (
            <p className="text-[11px] text-red-500">{errors.projectUrl}</p>
          ) : (
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              External URL for Figma, Google Drive, live website, or Behance.
            </p>
          )}
        </div>

        {/* Deliverable Attachments */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-950/40">
          <TaskAttachmentsManager taskId={task.id} canEdit={true} />
        </div>

        {/* Discussion / Comment Thread (for deliverables / tasks with comments or work category) */}
        {(isWorkCategory || comments.length > 0) && (
          <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/70 p-4 pt-3 dark:border-stone-800 dark:bg-stone-950/50">
            <CommentThread
              taskId={task.id}
              comments={comments}
              currentUserRole="admin"
              embedded={true}
            />
          </div>
        )}

        <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleArchive}
            disabled={isPending || isArchiving}
            className="gap-1.5 self-start text-xs text-stone-500 hover:bg-red-50 hover:text-red-600 sm:self-auto dark:text-stone-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            {isArchiving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                <span>Archive Task</span>
              </>
            )}
          </Button>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending || isArchiving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending || isArchiving}
              className="w-full gap-2 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </>
  );
}

export function EditTaskDialog({
  task,
  isOpen,
  onClose,
  clients,
}: EditTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {task && (
          <EditTaskForm
            key={task.id}
            task={task}
            onClose={onClose}
            clients={clients}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
