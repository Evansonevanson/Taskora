'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/admin/dashboard"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Taskora
            </span>
            <span className="rounded-md border border-stone-700/50 bg-stone-800/90 px-1.5 py-0.5 text-[10px] font-semibold text-stone-400">
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
                      ? 'bg-stone-800 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-indigo-400' : 'text-stone-500',
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
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-900 hover:text-stone-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none md:hidden"
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
        <div className="animate-in slide-in-from-top-2 space-y-1 border-b border-stone-800 bg-stone-950/95 px-4 py-3 duration-150 md:hidden">
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
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-indigo-400' : 'text-stone-500',
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
