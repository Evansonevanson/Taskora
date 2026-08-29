'use client';

import * as React from 'react';
import Link from 'next/link';
import { TaskoraLogo } from '@/components/brand/taskora-logo';

export function LandingFooter() {
  return (
    <footer className="border-t border-stone-200/80 bg-white py-12 transition-colors duration-150 dark:border-stone-800/80 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link
              href="/"
              className="group inline-flex items-center transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label="Taskora Home"
            >
              <TaskoraLogo size="sm" showWordmark={true} />
            </Link>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              A clean workspace for managing client work from task to delivery.
            </p>
          </div>

          {/* Navigation & Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-600 dark:text-stone-400">
            <a
              href="#features"
              className="transition-colors hover:text-stone-900 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-stone-900 dark:hover:text-white"
            >
              How It Works
            </a>
            <a
              href="#portal"
              className="transition-colors hover:text-stone-900 dark:hover:text-white"
            >
              Client Portal
            </a>
            <a
              href="#security"
              className="transition-colors hover:text-stone-900 dark:hover:text-white"
            >
              Security
            </a>
            <Link
              href="/login"
              className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-stone-200/60 pt-6 text-[11px] text-stone-400 sm:flex-row dark:border-stone-800/60 dark:text-stone-500">
          <p>© {new Date().getFullYear()} Taskora. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Database-isolated multi-client workspace architecture.
          </p>
        </div>
      </div>
    </footer>
  );
}
