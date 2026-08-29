import * as React from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminDashboardStats } from '@/lib/data/tasks';

export interface StatCardsProps {
  stats: AdminDashboardStats;
}

interface StatCardConfig {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  colorStyles: {
    iconBg: string;
    iconColor: string;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const cards: StatCardConfig[] = [
    {
      label: 'Total Tasks',
      value: stats.total,
      description: 'Active non-archived tasks',
      icon: ListTodo,
      colorStyles: {
        iconBg:
          'bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500/20 dark:text-indigo-400',
        iconColor: 'text-indigo-700 dark:text-indigo-400',
      },
    },
    {
      label: 'In Progress',
      value: stats.pending,
      description: 'Pending or active work',
      icon: Clock,
      colorStyles: {
        iconBg:
          'bg-sky-50 border border-sky-200 text-sky-700 dark:bg-sky-950/60 dark:border-sky-500/20 dark:text-sky-400',
        iconColor: 'text-sky-700 dark:text-sky-400',
      },
    },
    {
      label: 'Completed',
      value: stats.completed,
      description: 'Finished tasks awaiting archive',
      icon: CheckCircle2,
      colorStyles: {
        iconBg:
          'bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-500/20 dark:text-emerald-400',
        iconColor: 'text-emerald-700 dark:text-emerald-400',
      },
    },
    {
      label: 'High Priority',
      value: stats.highPriority,
      description: 'Urgent active tasks',
      icon: AlertCircle,
      colorStyles: {
        iconBg:
          'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-500/20 dark:text-amber-400',
        iconColor: 'text-amber-700 dark:text-amber-400',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className="flex flex-col justify-between border-stone-200/80 bg-white/80 p-5 shadow-sm transition-all duration-150 hover:border-stone-300 dark:border-stone-800/80 dark:bg-stone-900/50 dark:hover:bg-stone-900/70"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
                {card.label}
              </span>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl shadow-xs',
                  card.colorStyles.iconBg,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <span className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
                {card.value}
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {card.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
