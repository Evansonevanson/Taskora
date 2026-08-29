'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Menu, X } from 'lucide-react';
import { TaskoraLogo } from '@/components/brand/taskora-logo';
import { UserMenu, type UserMenuProps } from './user-menu';
import { cn } from '@/lib/utils';

export interface AdminNavProps {
  user: UserMenuProps['user'];
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/85 backdrop-blur-md transition-colors duration-150 dark:border-stone-800/80 dark:bg-stone-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/admin/dashboard"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <TaskoraLogo size="sm" showWordmark={true} />
            <span className="rounded-md border border-stone-300/80 bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 dark:border-stone-700/50 dark:bg-stone-800/90 dark:text-stone-400">
              Admin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-stone-200/80 text-stone-900 shadow-sm ring-1 ring-black/5 dark:bg-stone-800 dark:text-white dark:ring-white/10'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-200',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-stone-400 dark:text-stone-500',
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: User Menu & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <UserMenu user={user} />

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none md:hidden dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 space-y-1 border-b border-stone-200 bg-white/95 px-4 py-3 duration-150 md:hidden dark:border-stone-800 dark:bg-stone-950/95">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-stone-200/80 text-stone-900 dark:bg-stone-800 dark:text-white'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-200',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-stone-400 dark:text-stone-500',
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
