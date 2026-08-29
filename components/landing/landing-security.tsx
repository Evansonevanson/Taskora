'use client';

import * as React from 'react';
import { ShieldCheck, Lock, Database, KeyRound, Server } from 'lucide-react';

const securityPillars = [
  {
    icon: Database,
    title: 'Database Row-Level Security',
    description:
      'Every query is filtered at the database engine level via PostgreSQL RLS policies. A client can never read or mutate another client’s records.',
  },
  {
    icon: Lock,
    title: 'Private Deliverable Storage',
    description:
      'Client files live in secure, non-public storage. Access is granted only via short-lived signed URLs generated on authenticated demand.',
  },
  {
    icon: KeyRound,
    title: 'Role-Based Access Control',
    description:
      'Strict boundaries separate Admin and Client roles. Clients cannot view internal tasks, settings, other clients, or pending sprints.',
  },
  {
    icon: Server,
    title: 'Server-Side Validation & Rate Limiting',
    description:
      'All mutations, file uploads, authentication attempts, and comments undergo schema validation and rate-limiting to prevent abuse.',
  },
];

export function LandingSecurity() {
  return (
    <section
      id="security"
      className="scroll-mt-20 border-y border-stone-200/80 bg-stone-50/50 py-16 sm:py-24 dark:border-stone-800/80 dark:bg-stone-950/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs dark:border-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Enterprise-Grade Isolation
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-white">
            Client work stays separated.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
            Taskora is engineered from the ground up with strict data isolation.
            Your deliverables, comments, and client records are protected by
            defense-in-depth architecture.
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {securityPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex gap-4 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all duration-150 hover:shadow-md dark:border-stone-800/80 dark:bg-stone-900/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/80 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-stone-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600 sm:text-sm dark:text-stone-400">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
