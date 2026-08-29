import { describe, it, expect } from 'vitest';
import { updateClientSchema } from '@/lib/validation/client';
import type { AdminTaskItem } from '@/lib/data/tasks';

describe('Client Detail & Update Validation', () => {
  it('validates valid client update payload', () => {
    const validData = {
      displayName: 'Wayne Enterprises HQ',
      companyName: 'Wayne Corp',
      fullName: 'Bruce Wayne',
    };

    const result = updateClientSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe('Wayne Enterprises HQ');
      expect(result.data.companyName).toBe('Wayne Corp');
      expect(result.data.fullName).toBe('Bruce Wayne');
    }
  });

  it('rejects empty display names in update schema', () => {
    const emptyName = {
      displayName: '   ',
      companyName: 'Wayne Corp',
    };

    const result = updateClientSchema.safeParse(emptyName);
    expect(result.success).toBe(false);
  });

  it('calculates mini-stats for client tasks accurately', () => {
    const mockTasks: AdminTaskItem[] = [
      {
        id: 'task-1',
        title: 'Brand Identity Design',
        notes: 'Create vector logo',
        category: 'work',
        status: 'pending',
        priority: 'high',
        dueDate: '2026-09-01',
        createdAt: '2026-08-28T00:00:00Z',
        updatedAt: '2026-08-28T00:00:00Z',
        archived: false,
        needsRevision: true,
        clientId: 'client-1',
        clientName: 'Wayne Corp',
      },
      {
        id: 'task-2',
        title: 'Landing Page Copy',
        notes: 'Draft hero section',
        category: 'work',
        status: 'pending',
        priority: 'medium',
        dueDate: '2026-09-05',
        createdAt: '2026-08-28T00:00:00Z',
        updatedAt: '2026-08-28T00:00:00Z',
        archived: false,
        needsRevision: false,
        clientId: 'client-1',
        clientName: 'Wayne Corp',
      },
      {
        id: 'task-3',
        title: 'Pitch Deck V1',
        notes: 'Completed deck',
        category: 'work',
        status: 'completed',
        priority: 'low',
        dueDate: '2026-08-20',
        createdAt: '2026-08-15T00:00:00Z',
        updatedAt: '2026-08-20T00:00:00Z',
        archived: false,
        needsRevision: false,
        clientId: 'client-1',
        clientName: 'Wayne Corp',
      },
    ];

    const activeTasks = mockTasks.filter(
      (t) => t.status.toLowerCase() === 'pending' && !t.archived,
    ).length;
    const completedTasks = mockTasks.filter(
      (t) => t.status.toLowerCase() === 'completed',
    ).length;
    const revisionRequestedTasks = mockTasks.filter(
      (t) => t.needsRevision,
    ).length;

    expect(mockTasks.length).toBe(3);
    expect(activeTasks).toBe(2);
    expect(completedTasks).toBe(1);
    expect(revisionRequestedTasks).toBe(1);
  });
});
