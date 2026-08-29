'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { TaskoraLogo } from '@/components/brand/taskora-logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Client Portal', href: '#portal' },
    { label: 'Security', href: '#security' },
    { label: 'Appearance', href: '#appearance' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md transition-colors duration-150 dark:border-stone-800/80 dark:bg-stone-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Taskora Home"
        >
          <TaskoraLogo size="sm" showWordmark={true} priority={true} />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA & Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 sm:inline-flex dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
          >
            <Link href="/login">
              <span>Sign in</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-sm shadow-indigo-500/20"
          >
            <Link href="/signup">
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none md:hidden dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 border-b border-stone-200 bg-white/95 px-4 py-4 duration-150 md:hidden dark:border-stone-800 dark:bg-stone-950/95">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="space-y-2 pt-2">
              <Button asChild variant="primary" size="sm" className="w-full">
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2"
                >
                  <span>Get started with Taskora</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2"
                >
                  <span>Sign in</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
