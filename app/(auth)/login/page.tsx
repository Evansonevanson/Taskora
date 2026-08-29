import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ShieldCheck, Layers } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sign In | Taskora',
  description: 'Sign in to your Taskora admin dashboard or client portal.',
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-stone-950 p-4 text-stone-100 selection:bg-indigo-500/30 selection:text-indigo-200 sm:p-6 lg:p-8">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-10 -bottom-40 h-[400px] w-[500px] rounded-full bg-amber-500/10 blur-[140px]" />

      {/* Grid Pattern Accent */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#2626260a_1px,transparent_1px),linear-gradient(to_bottom,#2626260a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]" />

      <div className="relative w-full max-w-[420px] space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-full border border-stone-800 bg-stone-900/80 px-4 py-1.5 text-sm font-medium text-stone-300 backdrop-blur-md transition-colors hover:border-stone-700 hover:text-white"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-white">
              Taskora
            </span>
            <span className="h-3.5 w-px bg-stone-700" />
            <span className="text-xs text-stone-400">Workspace</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back
          </h1>
          <p className="max-w-sm text-sm text-stone-400">
            Sign in to access your administrative operations or client
            deliverables.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-stone-800/80 bg-stone-900/70 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-white">
              Account Authentication
            </CardTitle>
            <CardDescription className="text-xs text-stone-400">
              Enter your verified email and password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="animate-pulse py-8 text-center text-xs text-stone-500">
                  Loading secure authentication...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Security & Access Notice */}
        <div className="rounded-lg border border-stone-800/60 bg-stone-900/40 p-3.5 text-xs text-stone-400 backdrop-blur-sm">
          <div className="mb-1 flex items-center gap-2 font-medium text-stone-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Role-Enforced Data Isolation</span>
          </div>
          <p className="leading-relaxed text-stone-400">
            Taskora protects your organization with database-level Row-Level
            Security. Client deliverables and administrative records remain
            strictly isolated.
          </p>
        </div>
      </div>
    </div>
  );
}
