'use client';

import * as React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { UserMenu, type UserMenuProps } from './user-menu';

export interface ClientNavProps {
  user: UserMenuProps['user'];
  companyName?: string | null;
}

export function ClientNav({ user, companyName }: ClientNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand & Portal Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Taskora
            </span>
          </Link>
          <span className="h-4 w-px bg-stone-800" />
          <span className="rounded-md border border-stone-800 bg-stone-900 px-2 py-0.5 text-xs font-medium text-stone-400">
            {companyName || 'Client Portal'}
          </span>
        </div>

        {/* Right Side: User Menu */}
        <div className="flex items-center gap-3">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
