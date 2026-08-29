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
    <Card className="space-y-3 border-stone-800/80 bg-stone-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-semibold tracking-wider text-stone-300 uppercase">
            Sprint Progress
          </h3>
        </div>
        <span className="font-mono text-sm font-bold text-white">
          {percentage}%
        </span>
      </div>

      <Progress value={percentage} className="h-2.5" />

      <div className="flex items-center justify-between text-xs text-stone-400">
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
