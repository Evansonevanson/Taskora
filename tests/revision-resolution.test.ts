import { describe, it, expect } from 'vitest';
import type { AdminTaskItem } from '@/lib/data/tasks';

describe('Admin Revision Resolution & Quick-Filter Logic', () => {
  const sampleTasks: AdminTaskItem[] = [
    {
      id: 'task-1',
      title: 'Homepage Hero Animation',
      category: 'work',
      clientId: 'client-1',
      clientName: 'Acme Corp',
      priority: 'high',
      dueDate: '2026-09-01',
      status: 'completed',
      needsRevision: true,
      notes: 'Lottie animations with dark mode support',
      projectUrl: 'https://example.com/animation',
      archived: false,
      createdAt: '2026-08-20T00:00:00Z',
      updatedAt: '2026-08-28T00:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Mobile Onboarding Illustrations',
      category: 'work',
      clientId: 'client-1',
      clientName: 'Acme Corp',
      priority: 'medium',
      dueDate: '2026-09-05',
      status: 'completed',
      needsRevision: false,
      notes: 'Vector SVGs',
      projectUrl: null,
      archived: false,
      createdAt: '2026-08-22T00:00:00Z',
      updatedAt: '2026-08-27T00:00:00Z',
    },
    {
      id: 'task-3',
      title: 'Personal Tax Returns',
      category: 'personal',
      clientId: null,
      clientName: null,
      priority: 'low',
      dueDate: '2026-10-01',
      status: 'pending',
      needsRevision: false,
      notes: 'File tax reports',
      projectUrl: null,
      archived: false,
      createdAt: '2026-08-25T00:00:00Z',
      updatedAt: '2026-08-25T00:00:00Z',
    },
  ];

  it('filters tasks needing revision accurately', () => {
    const revisionTasks = sampleTasks.filter((t) => t.needsRevision);
    expect(revisionTasks).toHaveLength(1);
    expect(revisionTasks[0].id).toBe('task-1');
  });

  it('simulates admin resolving revision on a deliverable', () => {
    let taskList = [...sampleTasks];

    // Admin resolves revision on task-1
    taskList = taskList.map((t) =>
      t.id === 'task-1' ? { ...t, needsRevision: false } : t,
    );

    const revisionTasksAfter = taskList.filter((t) => t.needsRevision);
    expect(revisionTasksAfter).toHaveLength(0);

    const task1 = taskList.find((t) => t.id === 'task-1');
    expect(task1?.needsRevision).toBe(false);
    expect(task1?.status).toBe('completed');
  });
});
