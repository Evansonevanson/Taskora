'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { forgotPasswordSchema } from '@/lib/validation/auth';
import { requestPasswordReset } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );
  const [rateLimitSeconds, setRateLimitSeconds] = React.useState<number | null>(
    null,
  );

  // Rate limit countdown effect if triggered
  React.useEffect(() => {
    if (rateLimitSeconds === null || rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldError(null);
    setSuccessMessage(null);

    // Client validation
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message || 'Invalid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestPasswordReset({ email });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to request password reset.');
        if (res.rateLimited) {
          setRateLimitSeconds(15 * 60);
        }
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        res.data?.message ||
          'If an account exists with that email, a password reset link has been sent.',
      );
      setIsSubmitting(false);
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* General Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="animate-in fade-in-50 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 backdrop-blur-sm duration-200 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage ? (
        <div className="space-y-5">
          <div
            role="status"
            className="animate-in fade-in-50 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 backdrop-blur-sm duration-200 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="leading-relaxed">{successMessage}</div>
          </div>
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to sign in</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="flex items-center gap-1.5">
              <span>Account Email Address</span>
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
                className={`pl-10 ${
                  fieldError
                    ? 'border-red-500/80 focus-visible:ring-red-500/40'
                    : 'focus-visible:ring-indigo-500'
                }`}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? 'reset-email-error' : undefined}
                disabled={isSubmitting || rateLimitSeconds !== null}
              />
            </div>
            {fieldError && (
              <p
                id="reset-email-error"
                className="text-xs font-medium text-red-500"
              >
                {fieldError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rateLimitSeconds !== null}
            className="w-full bg-indigo-600 font-medium text-white shadow-lg shadow-indigo-600/20 transition-all duration-150 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending reset link...</span>
              </>
            ) : rateLimitSeconds !== null ? (
              `Wait ${rateLimitSeconds}s to retry`
            ) : (
              <>
                <span>Send Password Reset Link</span>
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
      )}
    </div>
  );
}
