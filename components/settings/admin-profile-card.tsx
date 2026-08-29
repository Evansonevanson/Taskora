'use client';

import * as React from 'react';
import { User, ShieldCheck, Mail, KeyRound } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminProfileCardProps {
  userEmail: string;
  userName: string;
}

export function AdminProfileCard({
  userEmail,
  userName,
}: AdminProfileCardProps) {
  return (
    <Card className="border-stone-800 bg-stone-900/40">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-950/40 text-indigo-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base text-stone-100">
              Administrator Profile
            </CardTitle>
            <CardDescription className="text-xs text-stone-400">
              Your active administrative session and identity credentials.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-800 bg-stone-950/40 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-medium text-stone-400">
              <User className="h-3.5 w-3.5 text-stone-500" />
              <span>Full Name</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-stone-100">
              {userName || 'Administrator'}
            </div>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-950/40 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-medium text-stone-400">
              <Mail className="h-3.5 w-3.5 text-stone-500" />
              <span>Email Address</span>
            </div>
            <div className="mt-1 truncate text-sm font-semibold text-stone-100">
              {userEmail || 'admin@taskora.app'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-950/40 p-3.5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-indigo-400" />
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-stone-200">
                Security & Role Permissions
              </div>
              <div className="text-[11px] text-stone-400">
                Global administrator permissions across tasks, clients, and
                system configuration.
              </div>
            </div>
          </div>
          <Badge variant="work" className="text-xs">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
