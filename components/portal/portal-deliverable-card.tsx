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
      className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:border-indigo-500/40 hover:bg-white hover:shadow-md dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-indigo-500/40 dark:hover:bg-stone-900 dark:hover:shadow-lg dark:hover:shadow-indigo-950/20"
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
            {task.projectUrl && (
              <Badge
                variant="outline"
                className="border-indigo-200 bg-indigo-50 text-[10px] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-300"
              >
                Link
              </Badge>
            )}
          </div>

          {task.needsRevision ? (
            <Badge
              variant="urgent"
              className="flex items-center gap-1 border-amber-300 bg-amber-50 text-[10px] text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/60 dark:text-amber-300"
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
          <h3 className="text-base font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-indigo-600 dark:text-stone-100 dark:group-hover:text-indigo-200">
            {task.title}
          </h3>
          {task.notes && (
            <p className="line-clamp-2 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              {task.notes}
            </p>
          )}
        </div>
      </div>

      {/* Footer / Dates & Arrow */}
      <div className="mt-4 flex items-center justify-between border-t border-stone-200/80 pt-3 text-xs text-stone-600 dark:border-stone-800/80 dark:text-stone-400">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
          <Calendar className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
          <span>
            {formattedCompletedDate
              ? `Delivered on ${formattedCompletedDate}`
              : 'Delivered'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 transition-transform group-hover:translate-x-0.5 dark:text-indigo-400">
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
