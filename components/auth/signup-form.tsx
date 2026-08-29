'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { signupSchema } from '@/lib/validation/auth';
import { registerOwner } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormErrors {
  fullName?: string;
  email?: string;
  workspaceName?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [workspaceName, setWorkspaceName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [rateLimitSeconds, setRateLimitSeconds] = React.useState<number | null>(
    null,
  );
  const [verificationEmail, setVerificationEmail] = React.useState<
    string | null
  >(null);

  // Rate limit countdown effect
  React.useEffect(() => {
    if (rateLimitSeconds === null || rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const result = signupSchema.safeParse({
      fullName,
      email,
      workspaceName,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof FormErrors;
        if (fieldName) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerOwner({
        fullName,
        email,
        workspaceName,
        password,
        confirmPassword,
      });

      if (!res.success) {
        setErrors({ general: res.error });
        if (res.rateLimited) {
          setRateLimitSeconds(60 * 60);
        }
        setIsSubmitting(false);
        return;
      }

      if (res.data?.requiresVerification) {
        setVerificationEmail(res.data.email || email);
        setIsSubmitting(false);
        return;
      }

      if (res.data?.redirectTo) {
        router.push(res.data.redirectTo);
        router.refresh();
      }
    } catch {
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  // If email confirmation is required by Supabase Auth
  if (verificationEmail) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            We sent a verification link to{' '}
            <span className="font-medium text-stone-900 dark:text-white">
              {verificationEmail}
            </span>
            . Please check your inbox and confirm your email to activate your
            workspace.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

      {/* Full Name Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="fullName"
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <span>Full name</span>
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
            <User className="h-4 w-4" />
          </div>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Alex Morgan"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName)
                setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            className={`pl-10 text-sm ${
              errors.fullName
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            disabled={isSubmitting || rateLimitSeconds !== null}
          />
        </div>
        {errors.fullName && (
          <p id="fullName-error" className="text-xs font-medium text-red-500">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Workspace / Business Name Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="workspaceName"
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <span>Workspace or Business name</span>
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
            <Building2 className="h-4 w-4" />
          </div>
          <Input
            id="workspaceName"
            name="workspaceName"
            type="text"
            autoComplete="organization"
            required
            placeholder="Acme Studio"
            value={workspaceName}
            onChange={(e) => {
              setWorkspaceName(e.target.value);
              if (errors.workspaceName)
                setErrors((prev) => ({ ...prev, workspaceName: undefined }));
            }}
            className={`pl-10 text-sm ${
              errors.workspaceName
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.workspaceName)}
            aria-describedby={
              errors.workspaceName ? 'workspaceName-error' : undefined
            }
            disabled={isSubmitting || rateLimitSeconds !== null}
          />
        </div>
        {errors.workspaceName && (
          <p
            id="workspaceName-error"
            className="text-xs font-medium text-red-500"
          >
            {errors.workspaceName}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <span>Work email address</span>
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="alex@acmestudio.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={`pl-10 text-sm ${
              errors.email
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isSubmitting || rateLimitSeconds !== null}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-xs font-medium text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <span>Password (min. 10 characters)</span>
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={`pr-10 pl-10 text-sm ${
              errors.password
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isSubmitting || rateLimitSeconds !== null}
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
          <p id="password-error" className="text-xs font-medium text-red-500">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <span>Confirm password</span>
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 dark:text-stone-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
            }}
            className={`pr-10 pl-10 text-sm ${
              errors.confirmPassword
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? 'confirmPassword-error' : undefined
            }
            disabled={isSubmitting || rateLimitSeconds !== null}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition-colors hover:text-stone-700 focus:text-stone-900 focus:outline-none dark:text-stone-500 dark:hover:text-stone-300 dark:focus:text-stone-200"
            aria-label={
              showConfirmPassword
                ? 'Hide confirmed password'
                : 'Show confirmed password'
            }
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
            id="confirmPassword-error"
            className="text-xs font-medium text-red-500"
          >
            {errors.confirmPassword}
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
            <span>Creating workspace...</span>
          </>
        ) : rateLimitSeconds !== null ? (
          `Wait ${rateLimitSeconds}s to retry`
        ) : (
          <>
            <span>Create workspace</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Clear Distinction Notice */}
      <p className="text-center text-[11px] text-stone-500 dark:text-stone-400">
        Workspace owners can create tasks and invite clients. Client accounts
        are invitation-only.
      </p>
    </form>
  );
}
