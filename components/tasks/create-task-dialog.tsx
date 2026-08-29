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
import { Loader2, Plus, AlertCircle, Building2 } from 'lucide-react';
import { createTask } from '@/lib/actions/tasks';
import { createTaskSchema, type CreateTaskInput } from '@/lib/validation/task';
import type { ActiveClientOption } from '@/lib/data/clients';
import { cn } from '@/lib/utils';

export interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ActiveClientOption[];
  preselectedClientId?: string;
}

const getInitialFormData = (
  clients: ActiveClientOption[],
  preselectedClientId?: string,
): CreateTaskInput => ({
  title: '',
  category: preselectedClientId ? 'work' : 'general',
  clientId: preselectedClientId || clients[0]?.id || '',
  priority: 'medium',
  dueDate: '',
  notes: '',
  projectUrl: '',
});

export function CreateTaskDialog({
  isOpen,
  onClose,
  clients,
  preselectedClientId,
}: CreateTaskDialogProps) {
  const [formData, setFormData] = React.useState<CreateTaskInput>(() =>
    getInitialFormData(clients, preselectedClientId),
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setFormData(getInitialFormData(clients, preselectedClientId));
    setErrors({});
    setServerError(null);
    onClose();
  }, [clients, preselectedClientId, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const parseResult = createTaskSchema.safeParse(formData);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsPending(true);
    try {
      const res = await createTask(formData);
      if (!res.success) {
        if (res.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(res.fieldErrors).forEach(([k, msgs]) => {
            if (msgs[0]) fieldErrors[k] = msgs[0];
          });
          setErrors(fieldErrors);
        }
        setServerError(res.error || 'Failed to create task');
        return;
      }

      handleClose();
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const isWorkCategory = formData.category === 'work';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
            <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription className="text-stone-500 dark:text-stone-400">
            Add a new deliverable or task to your sprint. Work tasks will appear
            in the assigned client’s portal once completed.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="task-title"
              type="text"
              placeholder="e.g. Design Landing Page UI"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={cn(
                errors.title && 'border-red-500 focus-visible:ring-red-500',
              )}
              disabled={isPending}
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Category & Client Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="task-category">Category</Label>
              <select
                id="task-category"
                value={formData.category}
                onChange={(e) => {
                  const newCategory = e.target
                    .value as CreateTaskInput['category'];
                  setFormData((prev) => ({
                    ...prev,
                    category: newCategory,
                    clientId:
                      newCategory === 'work'
                        ? prev.clientId || clients[0]?.id || ''
                        : '',
                  }));
                }}
                disabled={isPending}
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
                <Label htmlFor="task-client">
                  Assigned Client <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="task-client"
                    value={formData.clientId || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientId: e.target.value,
                      }))
                    }
                    disabled={isPending || clients.length === 0}
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
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className={cn(
                    errors.dueDate &&
                      'border-red-500 focus-visible:ring-red-500',
                  )}
                  disabled={isPending}
                />
                {errors.dueDate && (
                  <p className="text-[11px] text-red-500">{errors.dueDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Due date row if category is work */}
          {isWorkCategory && (
            <div className="space-y-1.5">
              <Label htmlFor="task-work-due-date">Due Date</Label>
              <Input
                id="task-work-due-date"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
                className={cn(
                  errors.dueDate && 'border-red-500 focus-visible:ring-red-500',
                )}
                disabled={isPending}
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
                    className={cn(
                      'rounded-xl border py-2 text-xs font-medium capitalize transition-all duration-150',
                      isSelected
                        ? p === 'high'
                          ? 'border-red-300 bg-red-50 text-red-800 shadow-xs dark:border-red-500/50 dark:bg-red-950/60 dark:text-red-300'
                          : p === 'medium'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-xs dark:border-amber-500/50 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'border-slate-300 bg-slate-100 text-slate-800 shadow-xs dark:border-slate-500/50 dark:bg-slate-800/60 dark:text-slate-200'
                        : 'border-stone-300/80 bg-stone-50/50 text-stone-600 hover:border-stone-400 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-200',
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="task-notes">Notes / Requirements</Label>
            <Textarea
              id="task-notes"
              rows={3}
              placeholder="Add key deliverables or internal specifications..."
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              error={Boolean(errors.notes)}
              disabled={isPending}
            />
            {errors.notes && (
              <p className="text-[11px] text-red-500">{errors.notes}</p>
            )}
          </div>

          {/* Project Link */}
          <div className="space-y-1.5">
            <Label htmlFor="task-project-url">Project Link (Optional)</Label>
            <Input
              id="task-project-url"
              type="url"
              placeholder="https://figma.com/file/... or https://drive.google.com/..."
              value={formData.projectUrl || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))
              }
              className={cn(
                errors.projectUrl &&
                  'border-red-500 focus-visible:ring-red-500',
              )}
              disabled={isPending}
            />
            {errors.projectUrl ? (
              <p className="text-[11px] text-red-500">{errors.projectUrl}</p>
            ) : (
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Direct external link for Figma, Google Drive, live website, or
                Behance.
              </p>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="w-full gap-2 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Task...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
