'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { PortalTaskItem } from '@/lib/data/portal';

export interface PortalDeliverableCardProps {
  task: PortalTaskItem;
}

export function PortalDeliverableCard({ task }: PortalDeliverableCardProps) {
  const formattedCompletedDate = React.useMemo(() => {
    if (!task.completedAt) return null;
    try {
      return new Date(task.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [task.completedAt]);

  const priorityVariant = (
    ['low', 'medium', 'high'].includes(task.priority.toLowerCase())
      ? task.priority.toLowerCase()
      : 'medium'
  ) as 'low' | 'medium' | 'high';

  return (
    <Link
      href={`/portal/jobs/${task.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900/60 p-5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-stone-900 hover:shadow-lg hover:shadow-indigo-950/20"
    >
      <div className="space-y-3">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
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

          {task.needsRevision ? (
            <Badge
              variant="urgent"
              className="flex items-center gap-1 border-amber-500/40 bg-amber-950/60 text-[10px] text-amber-300"
            >
              <AlertCircle className="h-3 w-3" />
              <span>Revision Requested</span>
            </Badge>
          ) : (
            <Badge
              variant="completed"
              className="flex items-center gap-1 text-[10px]"
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>Delivered</span>
            </Badge>
          )}
        </div>

        {/* Title & Notes Preview */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-stone-100 transition-colors group-hover:text-indigo-200">
            {task.title}
          </h3>
          {task.notes && (
            <p className="line-clamp-2 text-xs leading-relaxed text-stone-400">
              {task.notes}
            </p>
          )}
        </div>
      </div>

      {/* Footer / Dates & Arrow */}
      <div className="mt-4 flex items-center justify-between border-t border-stone-800/80 pt-3 text-xs text-stone-400">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <Calendar className="h-3.5 w-3.5 text-stone-500" />
          <span>
            {formattedCompletedDate
              ? `Delivered on ${formattedCompletedDate}`
              : 'Delivered'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition-transform group-hover:translate-x-0.5">
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
