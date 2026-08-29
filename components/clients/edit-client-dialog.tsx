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
import { Building2, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { updateClient } from '@/lib/actions/clients';
import {
  updateClientSchema,
  type UpdateClientInput,
} from '@/lib/validation/client';
import { cn } from '@/lib/utils';

export interface EditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    displayName: string;
    companyName: string | null;
    fullName: string;
    email: string;
  };
}

export function EditClientDialog({
  isOpen,
  onClose,
  client,
}: EditClientDialogProps) {
  const [formData, setFormData] = React.useState<UpdateClientInput>({
    displayName: client.displayName,
    companyName: client.companyName || '',
    fullName: client.fullName,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const validation = updateClientSchema.safeParse(formData);
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
      const res = await updateClient(client.id, validation.data);
      if (!res.success) {
        if (res.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(res.fieldErrors).forEach(([k, msgs]) => {
            if (msgs?.[0]) fieldErrors[k] = msgs[0];
          });
          setErrors(fieldErrors);
        }
        setGeneralError(res.error || 'Failed to update client details');
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Edit Client Details</DialogTitle>
              <DialogDescription>
                Update client profile information for {client.displayName}.
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

          <div className="space-y-1.5">
            <Label htmlFor="edit-client-display-name">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-client-display-name"
              placeholder="e.g. Wayne Enterprises Contact"
              value={formData.displayName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              className={cn(
                'h-10 text-xs',
                errors.displayName && 'border-red-500',
              )}
              disabled={isPending}
            />
            {errors.displayName && (
              <p className="text-[11px] text-red-500">{errors.displayName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-client-company-name">Company Name</Label>
            <div className="relative">
              <Input
                id="edit-client-company-name"
                placeholder="e.g. Wayne Enterprises"
                value={formData.companyName || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                className={cn(
                  'h-10 pl-8 text-xs',
                  errors.companyName && 'border-red-500',
                )}
                disabled={isPending}
              />
              <Building2 className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            </div>
            {errors.companyName && (
              <p className="text-[11px] text-red-500">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-client-full-name">Full Contact Name</Label>
            <Input
              id="edit-client-full-name"
              placeholder="e.g. Bruce Thomas Wayne"
              value={formData.fullName || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
              className={cn(
                'h-10 text-xs',
                errors.fullName && 'border-red-500',
              )}
              disabled={isPending}
            />
            {errors.fullName && (
              <p className="text-[11px] text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-stone-600 dark:text-stone-400">
              Account Email
            </Label>
            <Input
              value={client.email}
              disabled
              className="h-10 cursor-not-allowed bg-stone-100/80 text-xs text-stone-600 dark:bg-stone-900/50 dark:text-stone-400"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-500">
              Auth email address is managed via credentials.
            </p>
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
              type="submit"
              variant="primary"
              disabled={isPending}
              className="w-full gap-2 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
