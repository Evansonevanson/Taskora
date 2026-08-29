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
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toggleClientStatus } from '@/lib/actions/clients';

export interface DeactivateClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    displayName: string;
    active: boolean;
  };
}

export function DeactivateClientDialog({
  isOpen,
  onClose,
  client,
}: DeactivateClientDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isDeactivating = client.active;

  const handleToggle = async () => {
    setIsPending(true);
    setError(null);
    try {
      const res = await toggleClientStatus(client.id, !client.active);
      if (!res.success) {
        setError(res.error || 'Failed to update client status');
        return;
      }
      onClose();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                isDeactivating
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}
            >
              {isDeactivating ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isDeactivating
                  ? 'Deactivate Client Account'
                  : 'Reactivate Client Account'}
              </DialogTitle>
              <DialogDescription>{client.displayName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs text-stone-700 dark:text-stone-300">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {isDeactivating ? (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-500/20 dark:bg-amber-950/20">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Are you sure you want to deactivate this client?
              </p>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Deactivating immediately revokes portal access. The client will
                be unable to log in to review deliverables or leave comments
                until reactivated. Existing tasks and history remain intact.
              </p>
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-950/20">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Reactivate client portal access?
              </p>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                Reactivating will restore portal access, allowing{' '}
                {client.displayName} to sign in, view their completed
                deliverables, and post feedback.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleToggle}
            disabled={isPending}
            className={`w-full gap-1.5 sm:w-auto ${
              isDeactivating
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : isDeactivating ? (
              <span>Deactivate Account</span>
            ) : (
              <span>Reactivate Account</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
