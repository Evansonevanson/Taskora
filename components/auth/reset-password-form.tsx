'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { resetPasswordSchema } from '@/lib/validation/auth';
import { updateUserPassword } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'password') {
          fieldErrors.password = issue.message;
        } else if (issue.path[0] === 'confirmPassword') {
          fieldErrors.confirmPassword = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateUserPassword({ password, confirmPassword });

      if (!res.success) {
        setErrors({
          general: res.error || 'Failed to reset password. Please try again.',
        });
        setIsSubmitting(false);
        return;
      }

      // Redirect to login with reset=success query parameter
      router.push(res.data?.redirectTo || '/login?reset=success');
    } catch {
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* General Error Banner */}
      {errors.general && (
        <div
          role="alert"
          className="animate-in fade-in-50 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 backdrop-blur-sm duration-200 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="leading-relaxed">{errors.general}</div>
        </div>
      )}

      {/* New Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="new-password"
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <span>New Password</span>
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Min 8 characters
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="new-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            className={`pr-10 pl-10 ${
              errors.password
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'new-password-error' : undefined
            }
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition-colors hover:text-stone-700 focus:text-stone-900 focus:outline-none dark:text-stone-500 dark:hover:text-stone-300 dark:focus:text-stone-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="new-password-error"
            className="text-xs font-medium text-red-500"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="flex items-center gap-1.5">
          <span>Confirm New Password</span>
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            className={`pr-10 pl-10 ${
              errors.confirmPassword
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? 'confirm-password-error' : undefined
            }
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition-colors hover:text-stone-700 focus:text-stone-900 focus:outline-none dark:text-stone-500 dark:hover:text-stone-300 dark:focus:text-stone-200"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            id="confirm-password-error"
            className="text-xs font-medium text-red-500"
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 font-medium text-white shadow-lg shadow-indigo-600/20 transition-all duration-150 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Updating password...</span>
          </>
        ) : (
          <>
            <span>Set New Password</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Back to Login */}
      <div className="pt-1 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </form>
  );
}
