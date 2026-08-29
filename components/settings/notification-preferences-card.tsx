'use client';

import * as React from 'react';
import { Mail, Check, Bell } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

interface NotificationPreferencesCardProps {
  defaultNotifyClient: boolean;
  onDefaultNotifyClientChange: (value: boolean) => void;
  confirmBeforeCompleting: boolean;
  onConfirmBeforeCompletingChange: (value: boolean) => void;
}

export function NotificationPreferencesCard({
  defaultNotifyClient,
  onDefaultNotifyClientChange,
  confirmBeforeCompleting,
  onConfirmBeforeCompletingChange,
}: NotificationPreferencesCardProps) {
  return (
    <Card className="border-stone-800 bg-stone-900/40">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-950/40 text-indigo-400">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base text-stone-100">
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-xs text-stone-400">
              Control automated email delivery behavior for work deliverables.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preference 1: Default Notify Client */}
        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-stone-800 bg-stone-950/40 p-4 transition-colors hover:border-stone-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <Mail className="h-3.5 w-3.5 text-indigo-400" />
              <span>Default &ldquo;Notify Client&rdquo; on completion</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-400">
              When marking a client deliverable completed, pre-check the
              &ldquo;Notify Client via Email&rdquo; option in the completion
              dialog.
            </p>
          </div>

          <div
            onClick={(e) => {
              e.preventDefault();
              onDefaultNotifyClientChange(!defaultNotifyClient);
            }}
            className={`relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              defaultNotifyClient ? 'bg-indigo-600' : 'bg-stone-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                defaultNotifyClient ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>

        {/* Preference 2: Confirmation Dialog */}
        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-stone-800 bg-stone-950/40 p-4 transition-colors hover:border-stone-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Show confirmation modal before completing deliverables
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-400">
              Displays a modal summarizing task deliverables and client email
              preferences before finalizing completion.
            </p>
          </div>

          <div
            onClick={(e) => {
              e.preventDefault();
              onConfirmBeforeCompletingChange(!confirmBeforeCompleting);
            }}
            className={`relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              confirmBeforeCompleting ? 'bg-indigo-600' : 'bg-stone-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                confirmBeforeCompleting ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </CardContent>
    </Card>
  );
}
