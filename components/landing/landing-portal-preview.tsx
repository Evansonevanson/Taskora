'use client';

import * as React from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Download,
  Globe,
  FileText,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function LandingPortalPreview() {
  return (
    <section id="portal" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Copy & Highlights */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                Dedicated Client Experience
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-white">
                Clients see what matters. Nothing else.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
              Each client gets a focused portal containing only their completed
              deliverables, project links, attachments, and feedback history.
            </p>

            <ul className="space-y-3.5 pt-2 text-xs text-stone-700 sm:text-sm dark:text-stone-300">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span>
                  <strong>Filtered Visibility:</strong> Clients only see
                  completed work assigned directly to their account.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span>
                  <strong>One-Click Deliverables:</strong> Direct links for
                  Figma, Google Drive, live URLs, plus downloadable assets.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <span>
                  <strong>Frictionless Revisions:</strong> Clients can request
                  adjustments or leave replies on any deliverable.
                </span>
              </li>
            </ul>
          </div>

          {/* Right Column: Portal UI Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-xl ring-1 ring-black/5 backdrop-blur-xl sm:p-6 dark:border-stone-800/90 dark:bg-stone-900/80 dark:ring-white/10">
              {/* Header Bar */}
              <div className="mb-4 flex items-center justify-between border-b border-stone-200/80 pb-3 dark:border-stone-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-stone-100">
                  <span>Deliverable Detail</span>
                  <span className="text-stone-400 dark:text-stone-600">•</span>
                  <span className="font-normal text-stone-500 dark:text-stone-400">
                    Acme Studio
                  </span>
                </div>
                <Badge variant="completed" className="text-[10px]">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Delivered & Ready
                </Badge>
              </div>

              {/* Title */}
              <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                Brand Design System & Component Library
              </h4>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Delivered on August 28, 2026 • Status: Completed
              </p>

              {/* Project Destination Banner */}
              <div className="mt-4 flex flex-col justify-between gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 sm:flex-row sm:items-center dark:border-indigo-500/30 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      Figma Workspace Link
                    </p>
                    <p className="truncate text-[10px] text-stone-500 dark:text-stone-400">
                      https://figma.com/file/acme-design-system
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-7 gap-1 self-start text-[11px] sm:self-auto"
                >
                  <span>Open Project</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>

              {/* Deliverable File Attachment */}
              <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-950/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 bg-white text-rose-600 dark:border-stone-800 dark:bg-stone-900 dark:text-rose-400">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-stone-900 dark:text-stone-200">
                        Brand-Guidelines-v2.pdf
                      </p>
                      <p className="text-[10px] text-stone-400">
                        4.2 MB • Secure Signed Download
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2 text-[11px]"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>

              {/* Sample Comment Thread */}
              <div className="mt-4 space-y-2.5 rounded-xl border border-stone-200/80 bg-stone-50/40 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/40">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-stone-700 uppercase dark:text-stone-300">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Discussion & Revision History</span>
                </div>

                <div className="rounded-lg border border-stone-200 bg-white p-2.5 text-xs dark:border-stone-800 dark:bg-stone-900/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-200 text-[8px] font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-200">
                        <User className="h-2.5 w-2.5" />
                      </div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        Sarah (Client)
                      </span>
                      <Badge
                        variant="secondary"
                        className="px-1 py-0 text-[8px]"
                      >
                        Client
                      </Badge>
                    </div>
                    <span className="text-[10px] text-stone-400">
                      Yesterday
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-normal text-stone-600 dark:text-stone-300">
                    The token palette looks fantastic! Could we adjust the
                    primary button hover contrast slightly?
                  </p>
                </div>

                <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5 text-xs dark:border-indigo-500/30 dark:bg-indigo-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white">
                        <ShieldCheck className="h-2.5 w-2.5" />
                      </div>
                      <span className="font-semibold text-stone-900 dark:text-stone-200">
                        Evans (Admin)
                      </span>
                      <Badge variant="primary" className="px-1 py-0 text-[8px]">
                        Admin
                      </Badge>
                    </div>
                    <span className="text-[10px] text-stone-400">3h ago</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-normal text-stone-700 dark:text-stone-300">
                    Updated in Figma with AA+ contrast ratio! Ready for your
                    review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
