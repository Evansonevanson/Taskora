'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { loginSchema } from '@/lib/validation/auth';
import { loginUser } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [rateLimitSeconds, setRateLimitSeconds] = React.useState<number | null>(
    null,
  );

  // Derive initial error directly from URL query parameters (idiomatic React 19 pattern)
  const errorParam = searchParams.get('error');
  const searchParamError = React.useMemo(() => {
    if (errorParam === 'deactivated') {
      return 'Your client account has been deactivated. Please contact your administrator.';
    }
    if (errorParam === 'invalid_credentials') {
      return 'Invalid email or password. Please verify and try again.';
    }
    if (errorParam === 'rate_limited') {
      return 'Too many login attempts. Please wait 15 minutes before trying again.';
    }
    if (errorParam === 'invalid_link') {
      return 'Password reset link is invalid or has expired. Please request a new link.';
    }
    return undefined;
  }, [errorParam]);

  const generalError = errors.general || searchParamError;
  const isResetSuccess =
    searchParams.get('reset') === 'success' ||
    searchParams.get('message') === 'password_reset_success';

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
    setErrors({});

    // Client-side validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') fieldErrors.email = issue.message;
        if (issue.path[0] === 'password') fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginUser({ email, password });
      if (!res.success) {
        setErrors({ general: res.error });
        if (res.rateLimited) {
          setRateLimitSeconds(15 * 60);
        }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* General Error Banner */}
      {generalError && (
        <div
          role="alert"
          className="animate-in fade-in-50 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-950/40 p-3.5 text-sm text-red-200 backdrop-blur-sm duration-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div className="leading-relaxed">{generalError}</div>
        </div>
      )}

      {/* Reset Password Success Banner */}
      {isResetSuccess && (
        <div
          role="status"
          className="animate-in fade-in-50 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-sm text-emerald-200 backdrop-blur-sm duration-200"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="leading-relaxed">
            Your password has been reset successfully. Please log in with your
            new credentials.
          </div>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-1.5">
          <span>Email address</span>
          <span className="text-red-400" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-500">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={`pl-10 ${
              errors.email
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'border-stone-800 focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isSubmitting || rateLimitSeconds !== null}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-xs font-medium text-red-400">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="flex items-center gap-1.5">
            <span>Password</span>
            <span className="text-red-400" aria-hidden="true">
              *
            </span>
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
            tabIndex={0}
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={`pr-10 pl-10 ${
              errors.password
                ? 'border-red-500/80 focus-visible:ring-red-500/40'
                : 'border-stone-800 focus-visible:ring-indigo-500'
            }`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isSubmitting || rateLimitSeconds !== null}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-500 transition-colors hover:text-stone-300 focus:text-stone-200 focus:outline-none"
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
          <p id="password-error" className="text-xs font-medium text-red-400">
            {errors.password}
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
            <span>Signing in...</span>
          </>
        ) : rateLimitSeconds !== null ? (
          `Wait ${rateLimitSeconds}s to retry`
        ) : (
          <>
            <span>Sign in to Taskora</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
