import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

export interface ProgressSummaryProps {
  completed: number;
  total: number;
  percentage: number;
}

export function ProgressSummary({
  completed,
  total,
  percentage,
}: ProgressSummaryProps) {
  return (
    <Card className="space-y-3 border-stone-200/80 bg-white/80 p-5 shadow-sm dark:border-stone-800/80 dark:bg-stone-900/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-semibold tracking-wider text-stone-700 uppercase dark:text-stone-300">
            Sprint Progress
          </h3>
        </div>
        <span className="font-mono text-sm font-bold text-stone-900 dark:text-white">
          {percentage}%
        </span>
      </div>

      <Progress value={percentage} className="h-2.5" />

      <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
        <span>
          {completed} of {total} tasks completed
        </span>
        <span>
          {total === 0
            ? 'No active tasks'
            : total === completed
              ? 'All tasks completed 🎉'
              : `${total - completed} remaining`}
        </span>
      </div>
    </Card>
  );
}
