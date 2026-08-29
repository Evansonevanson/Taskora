import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SignupForm } from '@/components/auth/signup-form';
import { TaskoraLogo } from '@/components/brand/taskora-logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Create Your Workspace | Taskora',
  description:
    'Create your independent Taskora workspace to organize client work, deliverables, and revision requests.',
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] p-4 text-[var(--color-text-primary)] transition-colors duration-150 selection:bg-indigo-500/30 selection:text-indigo-200 sm:p-6 lg:p-8">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-600/15" />
      <div className="pointer-events-none absolute right-10 -bottom-40 h-[400px] w-[500px] rounded-full bg-amber-500/5 blur-[140px] dark:bg-amber-500/10" />

      {/* Grid Pattern Accent */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#2626260a_1px,transparent_1px),linear-gradient(to_bottom,#2626260a_1px,transparent_1px)]" />

      <div className="relative w-full max-w-[460px] space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-full border border-stone-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-stone-700 shadow-sm backdrop-blur-md transition-colors hover:border-stone-300 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:border-stone-700 dark:hover:text-white"
          >
            <TaskoraLogo size="sm" showWordmark={true} />
            <span className="h-3.5 w-px bg-stone-300 dark:bg-stone-700" />
            <span className="text-xs text-stone-500 dark:text-stone-400">
              New Workspace
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-white">
            Create your Taskora workspace
          </h1>
          <p className="max-w-sm text-sm text-stone-600 dark:text-stone-400">
            Set up your workspace and start managing client work in one place.
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-stone-200/80 bg-white/80 shadow-xl ring-1 ring-black/5 backdrop-blur-xl dark:border-stone-800/80 dark:bg-stone-900/70 dark:shadow-2xl dark:ring-white/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-stone-900 dark:text-white">
              Workspace Registration
            </CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
              Enter your details to become the workspace owner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense
              fallback={
                <div className="animate-pulse py-8 text-center text-xs text-stone-500">
                  Loading registration...
                </div>
              }
            >
              <SignupForm />
            </Suspense>

            {/* Footer Navigation */}
            <div className="border-t border-stone-200/70 pt-4 text-center text-xs text-stone-600 dark:border-stone-800/70 dark:text-stone-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Notice */}
        <div className="rounded-lg border border-stone-200/80 bg-white/50 p-3.5 text-xs text-stone-600 backdrop-blur-sm dark:border-stone-800/60 dark:bg-stone-900/40 dark:text-stone-400">
          <div className="mb-1 flex items-center gap-2 font-medium text-stone-800 dark:text-stone-300">
            <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Independent Tenant Isolation</span>
          </div>
          <p className="leading-relaxed text-stone-500 dark:text-stone-400">
            Your workspace data is encrypted and completely isolated with
            database-level Row-Level Security. Client accounts are invite-only.
          </p>
        </div>
      </div>
    </div>
  );
}
