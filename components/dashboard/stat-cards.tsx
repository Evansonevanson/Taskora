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
    borderAccent?: string;
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
        iconBg: 'bg-indigo-950/60 border border-indigo-500/20',
        iconColor: 'text-indigo-400',
      },
    },
    {
      label: 'In Progress',
      value: stats.pending,
      description: 'Pending or active work',
      icon: Clock,
      colorStyles: {
        iconBg: 'bg-sky-950/60 border border-sky-500/20',
        iconColor: 'text-sky-400',
      },
    },
    {
      label: 'Completed',
      value: stats.completed,
      description: 'Finished tasks awaiting archive',
      icon: CheckCircle2,
      colorStyles: {
        iconBg: 'bg-emerald-950/60 border border-emerald-500/20',
        iconColor: 'text-emerald-400',
      },
    },
    {
      label: 'High Priority',
      value: stats.highPriority,
      description: 'Urgent active tasks',
      icon: AlertCircle,
      colorStyles: {
        iconBg: 'bg-amber-950/60 border border-amber-500/20',
        iconColor: 'text-amber-400',
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
            className="flex flex-col justify-between border-stone-800/80 bg-stone-900/50 p-5 shadow-sm transition-all duration-150 hover:bg-stone-900/70"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
                {card.label}
              </span>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl',
                  card.colorStyles.iconBg,
                  card.colorStyles.iconColor,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <span className="text-3xl font-bold tracking-tight text-white">
                {card.value}
              </span>
              <p className="text-xs text-stone-500">{card.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
