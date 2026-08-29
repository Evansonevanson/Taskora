'use client';

import * as React from 'react';
import { Sun, Moon, Monitor, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LandingAppearance() {
  return (
    <section id="appearance" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400">
            <Sun className="h-4 w-4 text-amber-500" />
            <Moon className="h-4 w-4 text-indigo-400" />
            <Monitor className="h-4 w-4 text-stone-400" />
          </div>
          <h2 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Theme System
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-white">
            Light, dark, or system.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
            Taskora features intentionally designed Light and Dark modes. Both
            themes offer high contrast, crisp typography, and harmonious visual
            hierarchy across every device.
          </p>
        </div>

        {/* Side-by-Side Theme Visual */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Light Mode Preview Card */}
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold tracking-tight text-stone-900">
                  Light Theme
                </span>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-medium text-stone-700">
                Default Daylight
              </span>
            </div>

            {/* Mock Light UI */}
            <div className="space-y-3 rounded-xl border border-stone-200/80 bg-stone-50/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-900">
                      Mobile App UI Kit
                    </p>
                    <p className="text-[10px] text-stone-500">Acme Studio</p>
                  </div>
                </div>
                <Badge variant="completed" className="text-[9px]">
                  Delivered
                </Badge>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-2.5 text-[11px] text-stone-700">
                Crisp contrast on off-white surfaces with warm neutral borders.
              </div>
            </div>
          </div>

          {/* Dark Mode Preview Card */}
          <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold tracking-tight text-white">
                  Dark Theme
                </span>
              </div>
              <span className="rounded-full border border-stone-800 bg-stone-900 px-2.5 py-0.5 text-[10px] font-medium text-stone-300">
                Deep Workspace
              </span>
            </div>

            {/* Mock Dark UI */}
            <div className="space-y-3 rounded-xl border border-stone-800 bg-stone-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-950/60 text-indigo-400">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-100">
                      Mobile App UI Kit
                    </p>
                    <p className="text-[10px] text-stone-400">Acme Studio</p>
                  </div>
                </div>
                <Badge variant="completed" className="text-[9px]">
                  Delivered
                </Badge>
              </div>

              <div className="rounded-lg border border-stone-800/80 bg-stone-950/60 p-2.5 text-[11px] text-stone-300">
                Subtle charcoal elevation with glowing indigo accents and sharp
                legibility.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
