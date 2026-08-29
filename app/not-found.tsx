import * as React from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, Home, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-stone-950 p-4 text-stone-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md space-y-6 text-center duration-200">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Taskora
          </span>
        </div>

        {/* 404 Card */}
        <div className="space-y-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center justify-center rounded-full border border-stone-700/50 bg-stone-800 px-3 py-1 text-xs font-semibold text-indigo-400">
            404 — Not Found
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Page does not exist
          </h1>

          <p className="mx-auto max-w-xs text-xs leading-relaxed text-stone-400">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col items-center justify-center gap-2.5 pt-4 sm:flex-row">
            <Button
              asChild
              variant="primary"
              size="sm"
              className="w-full gap-2 sm:w-auto"
            >
              <Link href="/admin/dashboard">
                <Home className="h-3.5 w-3.5" />
                <span>Admin Dashboard</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="w-full gap-2 sm:w-auto"
            >
              <Link href="/portal">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Client Portal</span>
              </Link>
            </Button>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-stone-300"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
