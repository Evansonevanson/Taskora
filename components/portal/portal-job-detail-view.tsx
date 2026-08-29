'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';
import type { PortalClientInfo, PortalTaskItem } from '@/lib/data/portal';
import type { CommentItem } from '@/lib/data/comments';
import { CommentThread } from '@/components/comments/comment-thread';

export interface PortalJobDetailViewProps {
  client: PortalClientInfo;
  task: PortalTaskItem;
  comments: CommentItem[];
}

export function PortalJobDetailView({
  client,
  task,
  comments,
}: PortalJobDetailViewProps) {
  const formattedCompletedDate = React.useMemo(() => {
    if (!task.completedAt) return 'Delivered';
    try {
      return new Date(task.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Delivered';
    }
  }, [task.completedAt]);

  const formattedDueDate = React.useMemo(() => {
    if (!task.dueDate) return null;
    try {
      return new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [task.dueDate]);

  const priorityVariant = (
    ['low', 'medium', 'high'].includes(task.priority.toLowerCase())
      ? task.priority.toLowerCase()
      : 'medium'
  ) as 'low' | 'medium' | 'high';

  return (
    <div className="space-y-6">
      {/* Back Navigation Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 transition-colors hover:text-stone-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Deliverables</span>
        </Link>
        <span className="text-xs font-medium text-stone-500">
          {client.companyName || client.displayName}
        </span>
      </div>

      {/* Main Deliverable Header Card */}
      <div className="space-y-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-6">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="work"
              className="text-[10px] tracking-wider uppercase"
            >
              {task.category || 'Work'}
            </Badge>
            <Badge variant={priorityVariant} className="text-[10px]">
              {task.priority} Priority
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {task.needsRevision ? (
              <Badge
                variant="urgent"
                className="flex items-center gap-1.5 border-amber-500/40 bg-amber-950/60 px-2.5 py-1 text-xs text-amber-300"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Revision Requested</span>
              </Badge>
            ) : (
              <Badge
                variant="completed"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Delivered & Ready</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-stone-100 sm:text-3xl">
            {task.title}
          </h1>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Delivered on {formattedCompletedDate}</span>
            </div>

            {formattedDueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-500" />
                <span>Target Due: {formattedDueDate}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-stone-500" />
              <span>Status: Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable Notes & Specifications */}
      <div className="space-y-3 rounded-2xl border border-stone-800 bg-stone-900/40 p-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-stone-300 uppercase">
          <FileText className="h-4 w-4 text-indigo-400" />
          <span>Deliverable Details & Notes</span>
        </div>

        {task.notes ? (
          <div className="rounded-xl border border-stone-800/80 bg-stone-950/40 p-4 text-xs leading-relaxed font-normal whitespace-pre-wrap text-stone-300">
            {task.notes}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">
            No specific notes or descriptions were attached to this deliverable.
          </p>
        )}
      </div>

      {/* Feedback & Revision Flow */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6">
        <CommentThread
          taskId={task.id}
          comments={comments}
          currentUserRole="client"
        />
      </div>
    </div>
  );
}
