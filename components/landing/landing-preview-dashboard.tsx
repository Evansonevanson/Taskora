'use client';

import * as React from 'react';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ExternalLink,
  Paperclip,
  Search,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LandingPreviewDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-stone-200/90 bg-white/90 p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl sm:p-6 lg:p-7 dark:border-stone-800/90 dark:bg-stone-900/80 dark:shadow-2xl dark:ring-white/10">
      {/* Top Mock Window Bar */}
      <div className="mb-5 flex items-center justify-between border-b border-stone-200/80 pb-3 dark:border-stone-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/80 dark:bg-red-500/60" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80 dark:bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80 dark:bg-emerald-500/60" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-stone-400 dark:text-stone-500">
            app.taskora.workspace
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live Sprint
          </span>
        </div>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
        <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Total Tasks
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            18
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              In Progress
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            5
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Completed
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            12
          </p>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              High Priority
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            3
          </p>
        </div>
      </div>

      {/* Sprint Progress Bar */}
      <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-stone-700 dark:text-stone-300">
            Sprint Completion
          </span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            71% (12 of 17 Done)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div className="h-full w-[71%] rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500" />
        </div>
      </div>

      {/* Task Table Preview */}
      <div className="mt-4 overflow-hidden rounded-xl border border-stone-200/80 bg-white dark:border-stone-800/80 dark:bg-stone-950/80">
        {/* Table Filter Bar Mock */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/50 p-2.5 dark:border-stone-800/80 dark:bg-stone-900/40">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-stone-800 shadow-xs dark:bg-stone-800 dark:text-white">
              All Tasks (18)
            </span>
            <span className="rounded-md px-2 py-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
              Work Deliverables (11)
            </span>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[10px] text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
              <Search className="h-3 w-3" />
              <span>Filter deliverables...</span>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-100 text-xs dark:divide-stone-900">
          {/* Task Row 1 - Completed Work with Link & Deliverables */}
          <div className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-stone-50/60 dark:hover:bg-stone-900/40">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-500 bg-emerald-500 text-white">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-stone-900 dark:text-stone-100">
                    Design & prototype onboarding flow
                  </span>
                  <Badge variant="work" className="text-[9px] uppercase">
                    Work
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <Building2 className="h-3 w-3 text-stone-400" />
                    Acme Studio
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <ExternalLink className="h-2.5 w-2.5" /> Figma Prototype
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-400">
                    <Paperclip className="h-2.5 w-2.5" /> 2 attachments
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="high" className="text-[10px]">
                High
              </Badge>
              <Badge variant="completed" className="text-[10px]">
                Completed
              </Badge>
            </div>
          </div>

          {/* Task Row 2 - In Progress Client Task */}
          <div className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-stone-50/60 dark:hover:bg-stone-900/40">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="h-5 w-5 shrink-0 rounded-md border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-stone-900 dark:text-stone-100">
                    Landing page responsive build & copy review
                  </span>
                  <Badge variant="work" className="text-[9px] uppercase">
                    Work
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <Building2 className="h-3 w-3 text-stone-400" />
                    Starlight Media
                  </span>
                  <span>•</span>
                  <span>Due tomorrow</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="medium" className="text-[10px]">
                Medium
              </Badge>
              <Badge variant="in_progress" className="text-[10px]">
                In Progress
              </Badge>
            </div>
          </div>

          {/* Task Row 3 - Revision Requested Work */}
          <div className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-stone-50/60 dark:hover:bg-stone-900/40">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-stone-900 dark:text-stone-100">
                    Brand asset lockups & typography guide
                  </span>
                  <Badge variant="work" className="text-[9px] uppercase">
                    Work
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <Building2 className="h-3 w-3 text-stone-400" />
                    Kinetix Labs
                  </span>
                  <span>•</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    Client requested color revision
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="urgent" className="text-[10px]">
                Revision
              </Badge>
              <Badge variant="completed" className="text-[10px]">
                Delivered
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
