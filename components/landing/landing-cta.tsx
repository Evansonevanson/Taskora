'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingCta() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[350px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-600/15" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50/80 p-8 text-center shadow-xl ring-1 ring-black/5 backdrop-blur-xl sm:p-12 lg:p-16 dark:border-stone-800 dark:from-stone-900/90 dark:to-stone-950 dark:ring-white/10">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl dark:text-white">
            A simpler way to manage client work.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
            Sign in and keep tasks, deliverables, and client feedback in one
            organized workspace.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="w-full shadow-md shadow-indigo-600/20 sm:w-auto"
            >
              <Link href="/login" className="flex items-center gap-2">
                <span>Sign in to Taskora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Secure Supabase Authentication • Row-Level Data Isolation
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
