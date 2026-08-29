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
import { CheckCircle2, Mail, Loader2, Building2 } from 'lucide-react';
import { completeTask } from '@/lib/actions/tasks';
import type { AdminTaskItem } from '@/lib/data/tasks';

export interface CompleteTaskDialogProps {
  task: AdminTaskItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CompleteTaskContentProps {
  task: AdminTaskItem;
  onClose: () => void;
}

function CompleteTaskContent({ task, onClose }: CompleteTaskContentProps) {
  const [notifyClient, setNotifyClient] = React.useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(
          'taskora_setting_default_notify_client',
        );
        if (stored !== null) {
          return stored === 'true';
        }
      } catch {
        // Fallback to default true
      }
    }
    return true;
  });
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      const res = await completeTask(task.id, { notifyClient });
      if (res.success) {
        onClose();
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-950/50 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <DialogTitle className="text-center">Complete Deliverable</DialogTitle>
        <DialogDescription className="text-center">
          Mark &ldquo;{task.title}&rdquo; as completed in your active sprint.
        </DialogDescription>
      </DialogHeader>

      {/* Task & Client Info Card */}
      <div className="my-2 space-y-2 rounded-xl border border-stone-800 bg-stone-900/60 p-3.5">
        <div className="text-xs font-semibold text-stone-200">{task.title}</div>
        {task.clientName && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Building2 className="h-3.5 w-3.5 text-stone-500" />
            <span>Assigned Client: {task.clientName}</span>
          </div>
        )}
      </div>

      {/* Notify Client Option */}
      {task.category === 'work' && task.clientId && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-800/80 bg-stone-900/40 p-3 transition-colors hover:border-stone-700">
          <input
            type="checkbox"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            disabled={isPending}
            className="mt-0.5 h-4 w-4 rounded border-stone-700 bg-stone-900 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-stone-200">
              <Mail className="h-3.5 w-3.5 text-indigo-400" />
              Notify client via email
            </span>
            <p className="text-[11px] leading-normal text-stone-400">
              Sends a branded delivery notification with a direct link to review
              the deliverable in their portal.
            </p>
          </div>
        </label>
      )}

      <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isPending}
          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500 sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Completing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Completed</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export function CompleteTaskDialog({
  task,
  isOpen,
  onClose,
}: CompleteTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {task && (
          <CompleteTaskContent key={task.id} task={task} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
