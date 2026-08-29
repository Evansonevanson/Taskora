import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskoraLogo } from '@/components/brand/taskora-logo';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] p-4 text-[var(--color-text-primary)] transition-colors duration-150 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-600/15" />

      <div className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md space-y-6 text-center duration-200">
        {/* Brand Logo */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="group inline-flex items-center transition-opacity hover:opacity-90"
          >
            <TaskoraLogo size="md" showWordmark={true} />
          </Link>
        </div>

        {/* 404 Card */}
        <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-900/60 dark:shadow-2xl dark:ring-white/5">
          <div className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-stone-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:border-stone-700/50 dark:bg-stone-800 dark:text-indigo-400">
            404 — Not Found
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-white">
            Page not found
          </h1>

          <p className="mx-auto max-w-xs text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>

          <div className="flex flex-col items-center justify-center gap-2.5 pt-4 sm:flex-row">
            <Button
              asChild
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Go to Dashboard</span>
              </Link>
            </Button>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 rounded-sm text-xs text-stone-500 transition-colors hover:text-stone-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:text-stone-300"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
