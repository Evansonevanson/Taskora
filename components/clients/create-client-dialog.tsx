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
import {
  UserPlus,
  Building2,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/actions/clients';
import {
  createClientSchema,
  type CreateClientInput,
} from '@/lib/validation/client';
import { cn } from '@/lib/utils';

export interface CreateClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateClientFormProps {
  onClose: () => void;
}

function CreateClientForm({ onClose }: CreateClientFormProps) {
  const [formData, setFormData] = React.useState<CreateClientInput>({
    displayName: '',
    fullName: '',
    companyName: '',
    email: '',
    temporaryPassword: '',
    sendInviteEmail: true,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  // Success state with credentials for copying
  const [createdResult, setCreatedResult] = React.useState<{
    id: string;
    email: string;
    displayName: string;
    temporaryPassword: string;
    emailSent: boolean;
  } | null>(null);

  const [copied, setCopied] = React.useState(false);

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const text = `Taskora Client Portal Credentials:\nEmail: ${createdResult.email}\nTemporary Password: ${createdResult.temporaryPassword}\nLogin: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const validation = createClientSchema.safeParse(formData);
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
      const res = await createClient(validation.data);
      if (!res.success) {
        if (res.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(res.fieldErrors).forEach(([k, msgs]) => {
            if (msgs?.[0]) fieldErrors[k] = msgs[0];
          });
          setErrors(fieldErrors);
        }
        setGeneralError(res.error || 'Failed to create client account');
        return;
      }

      if (res.data) {
        setCreatedResult(res.data);
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  if (createdResult) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            Client Account Provisioned
          </DialogTitle>
          <DialogDescription className="text-center">
            {createdResult.displayName} has been successfully added to Taskora.
          </DialogDescription>
        </DialogHeader>

        {/* Credentials Box */}
        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-900/80">
          <div className="text-xs font-semibold text-stone-800 dark:text-stone-300">
            Portal Access Credentials
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between border-b border-stone-200 py-1 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">
                Login Email:
              </span>
              <span className="font-mono font-medium text-stone-900 dark:text-stone-100">
                {createdResult.email}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500 dark:text-stone-400">
                Temporary Password:
              </span>
              <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                {createdResult.temporaryPassword}
              </span>
            </div>
          </div>

          {createdResult.emailSent ? (
            <p className="flex items-center gap-1.5 pt-1 text-xs text-emerald-700 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>Welcome email with credentials dispatched to client.</span>
            </p>
          ) : (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
              <span className="leading-relaxed">
                Automated invite email could not be delivered. Please copy and
                manually share the temporary credentials with the client.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Done
          </Button>
          <Button
            variant="primary"
            onClick={handleCopyCredentials}
            className="w-full gap-1.5 sm:w-auto"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Credentials</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-400">
            <UserPlus className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Provision a new client portal account and assign freelance
              deliverables.
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

        {/* Display Name & Company Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="client-display-name">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="client-display-name"
              placeholder="e.g. Bruce Wayne"
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
            <Label htmlFor="client-company-name">Company Name</Label>
            <div className="relative">
              <Input
                id="client-company-name"
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
        </div>

        {/* Full Name & Email Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="client-full-name">Full Contact Name</Label>
            <Input
              id="client-full-name"
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
            <Label htmlFor="client-email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="client-email"
                type="email"
                placeholder="client@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className={cn(
                  'h-10 pl-8 text-xs',
                  errors.email && 'border-red-500',
                )}
                disabled={isPending}
              />
              <Mail className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Optional Custom Password */}
        <div className="space-y-1.5">
          <Label htmlFor="client-password">
            Temporary Password{' '}
            <span className="font-normal text-stone-500 dark:text-stone-400">
              (Optional — auto-generated if blank)
            </span>
          </Label>
          <div className="relative">
            <Input
              id="client-password"
              type="text"
              placeholder="Leave blank to generate secure password"
              value={formData.temporaryPassword || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  temporaryPassword: e.target.value,
                }))
              }
              className={cn(
                'h-10 pl-8 font-mono text-xs',
                errors.temporaryPassword && 'border-red-500',
              )}
              disabled={isPending}
            />
            <Lock className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          </div>
          {errors.temporaryPassword && (
            <p className="text-[11px] text-red-500">
              {errors.temporaryPassword}
            </p>
          )}
        </div>

        {/* Send Email Checkbox */}
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50/70 p-3 transition-colors hover:border-stone-300 dark:border-stone-800/80 dark:bg-stone-900/40 dark:hover:border-stone-700">
          <input
            type="checkbox"
            checked={formData.sendInviteEmail}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sendInviteEmail: e.target.checked,
              }))
            }
            disabled={isPending}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 bg-white text-indigo-600 focus:ring-indigo-500 dark:border-stone-700 dark:bg-stone-900"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-stone-900 dark:text-stone-200">
              Send welcome email with portal credentials
            </span>
            <p className="text-[11px] leading-normal text-stone-600 dark:text-stone-400">
              Sends an invitation email with their temporary password and portal
              sign in link.
            </p>
          </div>
        </label>

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
                <span>Provisioning Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Provision Client</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function CreateClientDialog({
  isOpen,
  onClose,
}: CreateClientDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {isOpen && <CreateClientForm key={String(isOpen)} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
