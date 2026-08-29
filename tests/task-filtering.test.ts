import { describe, it, expect } from 'vitest';
import type { AdminTaskItem } from '@/lib/data/tasks';

const mockTasks: AdminTaskItem[] = [
  {
    id: '1',
    title: 'Website Redesign',
    category: 'work',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-09-01',
    notes: 'Include dark mode support',
    clientId: 'client-1',
    clientName: 'Acme Corp',
    needsRevision: false,
    archived: false,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Grocery Run',
    category: 'shopping',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-08-25',
    notes: 'Milk and coffee beans',
    clientId: null,
    clientName: null,
    needsRevision: false,
    archived: false,
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
  },
  {
    id: '3',
    title: 'Client Review Meeting',
    category: 'work',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-09-05',
    notes: 'Prepare slide deck for review',
    clientId: 'client-2',
    clientName: 'Stark Industries',
    needsRevision: true,
    archived: false,
    createdAt: '2026-08-22T10:00:00Z',
    updatedAt: '2026-08-22T10:00:00Z',
  },
  {
    id: '4',
    title: 'Critical Bugfix',
    category: 'urgent',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-08-29',
    notes: 'Fix race condition in auth middleware',
    clientId: null,
    clientName: null,
    needsRevision: false,
    archived: false,
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-08-28T10:00:00Z',
  },
];

describe('Admin Task Table Filtering & Sorting Logic', () => {
  it('filters tasks by status: pending', () => {
    const pendingTasks = mockTasks.filter(
      (t) => t.status.toLowerCase() !== 'completed',
    );
    expect(pendingTasks).toHaveLength(3);
    expect(pendingTasks.map((t) => t.id)).toEqual(['1', '3', '4']);
  });

  it('filters tasks by status: completed', () => {
    const completedTasks = mockTasks.filter(
      (t) => t.status.toLowerCase() === 'completed',
    );
    expect(completedTasks).toHaveLength(1);
    expect(completedTasks[0].id).toBe('2');
  });

  it('filters tasks by status: high_priority (active & high)', () => {
    const highPriorityActive = mockTasks.filter(
      (t) =>
        t.priority.toLowerCase() === 'high' &&
        t.status.toLowerCase() !== 'completed',
    );
    expect(highPriorityActive).toHaveLength(2);
    expect(highPriorityActive.map((t) => t.id)).toEqual(['1', '4']);
  });

  it('filters tasks by category', () => {
    const workTasks = mockTasks.filter((t) => t.category === 'work');
    expect(workTasks).toHaveLength(2);

    const shoppingTasks = mockTasks.filter((t) => t.category === 'shopping');
    expect(shoppingTasks).toHaveLength(1);
  });

  it('searches tasks by title, notes, and client name case-insensitively', () => {
    const query1 = 'redesign';
    const match1 = mockTasks.filter((t) =>
      t.title.toLowerCase().includes(query1),
    );
    expect(match1).toHaveLength(1);
    expect(match1[0].id).toBe('1');

    const queryNotes = 'race condition';
    const matchNotes = mockTasks.filter((t) =>
      t.notes?.toLowerCase().includes(queryNotes),
    );
    expect(matchNotes).toHaveLength(1);
    expect(matchNotes[0].id).toBe('4');

    const queryClient = 'stark';
    const matchClient = mockTasks.filter((t) =>
      t.clientName?.toLowerCase().includes(queryClient),
    );
    expect(matchClient).toHaveLength(1);
    expect(matchClient[0].id).toBe('3');
  });

  it('sorts tasks by priority descending (high > medium > low)', () => {
    const priorityOrder: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };
    const sorted = [...mockTasks].sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
    );
    expect(sorted[0].priority).toBe('high');
    expect(sorted[1].priority).toBe('high');
    expect(sorted[2].priority).toBe('medium');
    expect(sorted[3].priority).toBe('low');
  });

  it('sorts tasks by due date ascending', () => {
    const sorted = [...mockTasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    expect(sorted.map((t) => t.id)).toEqual(['2', '4', '1', '3']);
  });
});
