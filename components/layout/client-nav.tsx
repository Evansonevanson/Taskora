'use client';

import * as React from 'react';
import Link from 'next/link';
import { TaskoraLogo } from '@/components/brand/taskora-logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { UserMenu, type UserMenuProps } from './user-menu';

export interface ClientNavProps {
  user: UserMenuProps['user'];
  companyName?: string | null;
}

export function ClientNav({ user, companyName }: ClientNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/85 backdrop-blur-md transition-colors duration-150 dark:border-stone-800/80 dark:bg-stone-950/85">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand & Navigation */}
        <div className="flex items-center gap-4">
          <Link
            href="/portal/jobs"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <TaskoraLogo size="sm" showWordmark={true} />
          </Link>
          <span className="h-4 w-px bg-stone-300 dark:bg-stone-800" />
          <nav className="flex items-center gap-2">
            <Link
              href="/portal/jobs"
              className="rounded-md px-2.5 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-stone-900 dark:hover:text-white"
            >
              My Jobs
            </Link>
          </nav>
          <span className="h-4 w-px bg-stone-300 dark:bg-stone-800" />
          <span className="rounded-md border border-stone-300/80 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            {companyName || 'Client Portal'}
          </span>
        </div>

        {/* Right Side: Theme Switcher & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
