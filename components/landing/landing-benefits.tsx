'use client';

import * as React from 'react';
import {
  Layers,
  Share2,
  Users,
  Eye,
  ShieldCheck,
  BellRing,
} from 'lucide-react';

const benefits = [
  {
    icon: Layers,
    title: 'Everything in one workspace',
    description:
      'Manage personal tasks and client work side by side without switching disparate tools or losing context.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-500/30',
  },
  {
    icon: Share2,
    title: 'Deliver work professionally',
    description:
      'Attach deliverable files or live project links (Figma, Google Drive, live URLs) directly to completed client tasks.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-500/30',
  },
  {
    icon: Users,
    title: 'Client-ready portal',
    description:
      'Clients get a clean, branded portal to review only their own completed work, download deliverables, and post revision requests.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-500/30',
  },
  {
    icon: Eye,
    title: 'Clear task visibility',
    description:
      'Track in-progress, completed, high-priority, and revision-required deliverables at a glance across your active sprint.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-500/30',
  },
  {
    icon: ShieldCheck,
    title: 'Built for separation',
    description:
      'Client workspaces and deliverables are strictly isolated by role and database Row-Level Security at the PostgreSQL layer.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-500/30',
  },
  {
    icon: BellRing,
    title: 'Stay updated',
    description:
      'Automated email notifications keep clients and administrators informed whenever work is delivered or feedback is posted.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-500/30',
  },
];

export function LandingBenefits() {
  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Core Capabilities
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-white">
            Designed for independent professionals
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
            A purposeful toolkit for freelancers, consultants, and small studios
            who want structured delivery without complex project management
            overhead.
          </p>
        </div>

        {/* 6 Grid Benefits */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm transition-all duration-200 hover:border-stone-300 hover:shadow-md dark:border-stone-800/80 dark:bg-stone-900/60 dark:hover:border-stone-700 dark:hover:bg-stone-900/80"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border p-2.5 transition-transform duration-150 group-hover:scale-105 ${benefit.bg}`}
                >
                  <Icon className={`h-5 w-5 ${benefit.color}`} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-stone-900 dark:text-white">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-stone-600 sm:text-sm dark:text-stone-400">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
