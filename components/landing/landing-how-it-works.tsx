'use client';

import * as React from 'react';
import {
  PlusCircle,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    stepNumber: '01',
    title: 'Create and assign',
    description:
      'Add deliverables to your active sprint, set priorities and due dates, and assign them directly to your client profile.',
    icon: PlusCircle,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-500/30',
  },
  {
    stepNumber: '02',
    title: 'Complete and deliver',
    description:
      'Attach high-resolution deliverable files or live project links (Figma, Google Drive, live URLs) and mark the task complete.',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-500/30',
  },
  {
    stepNumber: '03',
    title: 'Review and revise',
    description:
      'Your client accesses their private portal to review deliverables, download files, and post feedback or revision requests.',
    icon: MessageSquare,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:border-blue-500/30',
  },
];

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-stone-200/80 bg-stone-50/50 py-16 sm:py-24 dark:border-stone-800/80 dark:bg-stone-950/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Streamlined Workflow
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-white">
            From assignment to client sign-off
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
            A frictionless three-step delivery cycle designed to eliminate email
            attachment sprawl and keep feedback organized.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.stepNumber}
                className="relative flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-stone-800/80 dark:bg-stone-900/60"
              >
                <div>
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                      STEP {item.stepNumber}
                    </span>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border p-2 ${item.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-stone-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-stone-600 sm:text-sm dark:text-stone-400">
                    {item.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="mt-6 hidden md:block">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                      <span>Next phase</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
