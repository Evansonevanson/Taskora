'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingPreviewDashboard } from './landing-preview-dashboard';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-600/15" />
      <div className="pointer-events-none absolute top-1/3 right-10 h-[400px] w-[500px] rounded-full bg-amber-500/5 blur-[140px] dark:bg-amber-500/10" />

      {/* Grid Pattern Accent */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#2626260a_1px,transparent_1px),linear-gradient(to_bottom,#2626260a_1px,transparent_1px)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag Pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-white/80 px-3.5 py-1 text-xs font-medium text-stone-700 shadow-xs backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Clean freelance workspace & client portal</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl dark:text-white">
            Client work, organized from{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent dark:from-indigo-400 dark:via-indigo-300 dark:to-indigo-500">
              task to delivery.
            </span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
            Taskora gives freelancers and small teams one place to manage tasks,
            deliver project files, collect feedback, and keep every client
            workspace organized.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
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

            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          {/* Security Subtext */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Database Row-Level Security • Dedicated Client Portal</span>
          </div>
        </div>

        {/* Product Visual Preview */}
        <div className="mt-12 sm:mt-16">
          <LandingPreviewDashboard />
        </div>
      </div>
    </section>
  );
}
