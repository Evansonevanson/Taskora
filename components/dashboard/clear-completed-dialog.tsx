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
import { Archive, Loader2 } from 'lucide-react';
import { archiveCompletedTasks } from '@/lib/actions/tasks';

export interface ClearCompletedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
}

export function ClearCompletedDialog({
  isOpen,
  onClose,
  completedCount,
}: ClearCompletedDialogProps) {
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      const res = await archiveCompletedTasks();
      if (res.success) {
        onClose();
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-950/50 text-amber-400">
            <Archive className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            Clear Completed Tasks
          </DialogTitle>
          <DialogDescription className="text-center">
            This will archive {completedCount}{' '}
            {completedCount === 1 ? 'task' : 'tasks'} and hide them from your
            active dashboard. Completed work will remain accessible to your
            clients.
          </DialogDescription>
        </DialogHeader>

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
            disabled={isPending || completedCount === 0}
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                <span>Archive {completedCount} Tasks</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
