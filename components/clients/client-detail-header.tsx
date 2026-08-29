'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Building2,
  Mail,
  Plus,
  Edit3,
  Power,
  Calendar,
} from 'lucide-react';

export interface ClientDetailHeaderProps {
  client: {
    id: string;
    displayName: string;
    companyName: string | null;
    fullName: string;
    email: string;
    active: boolean;
    createdAt: string;
  };
  onNewTaskClick: () => void;
  onEditClientClick: () => void;
  onToggleStatusClick: () => void;
}

export function ClientDetailHeader({
  client,
  onNewTaskClick,
  onEditClientClick,
  onToggleStatusClick,
}: ClientDetailHeaderProps) {
  const formattedJoinedDate = React.useMemo(() => {
    try {
      const date = new Date(client.createdAt);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  }, [client.createdAt]);

  return (
    <div className="space-y-4">
      {/* Back Navigation */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 transition-colors hover:text-stone-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Clients</span>
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            name={client.displayName}
            size="lg"
            className="h-14 w-14 rounded-2xl border border-stone-700 bg-stone-800 text-lg font-semibold text-stone-200"
          />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-100">
                {client.displayName}
              </h1>
              <Badge
                variant={client.active ? 'completed' : 'default'}
                className="text-[11px]"
              >
                {client.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
              {client.companyName && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-stone-500" />
                  <span>{client.companyName}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-stone-500" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-500" />
                <span>Joined {formattedJoinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEditClientClick}
            className="h-9 gap-1.5 border-stone-700 bg-stone-800/80 text-xs text-stone-300 hover:text-stone-100"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Client</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleStatusClick}
            className={`h-9 gap-1.5 border-stone-700 bg-stone-800/80 text-xs ${
              client.active
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{client.active ? 'Deactivate' : 'Reactivate'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNewTaskClick}
            className="h-9 gap-1.5 bg-indigo-600 text-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
