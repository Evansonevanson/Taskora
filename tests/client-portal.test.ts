import { describe, it, expect } from 'vitest';
import type { PortalTaskItem } from '@/lib/data/portal';

describe('Client Portal Data & Minimization Logic', () => {
  const mockPortalTasks: PortalTaskItem[] = [
    {
      id: 'task-1',
      title: 'Mobile App Wireframes',
      notes: 'Figma prototypes and UX wireframes for the onboarding flow',
      projectUrl: 'https://figma.com/file/wireframes-app',
      category: 'work',
      priority: 'high',
      status: 'completed',
      dueDate: '2026-09-01',
      completedAt: '2026-08-28T12:00:00Z',
      needsRevision: true,
      createdAt: '2026-08-20T00:00:00Z',
      updatedAt: '2026-08-28T12:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Vector Brand Identity Assets',
      notes: 'SVG icons, color palette guides, and typography specs',
      projectUrl: null,
      category: 'work',
      priority: 'medium',
      status: 'completed',
      dueDate: '2026-08-25',
      completedAt: '2026-08-24T15:30:00Z',
      needsRevision: false,
      createdAt: '2026-08-15T00:00:00Z',
      updatedAt: '2026-08-24T15:30:00Z',
    },
    {
      id: 'task-3',
      title: 'Marketing Landing Page Copy',
      notes: 'Hero section, feature bullet points, and CTA copy',
      projectUrl: 'https://staging.acme.com',
      category: 'work',
      priority: 'low',
      status: 'completed',
      dueDate: null,
      completedAt: '2026-08-22T09:00:00Z',
      needsRevision: false,
      createdAt: '2026-08-10T00:00:00Z',
      updatedAt: '2026-08-22T09:00:00Z',
    },
  ];

  it('computes portal deliverable metrics correctly', () => {
    const totalDelivered = mockPortalTasks.length;
    const inRevision = mockPortalTasks.filter((t) => t.needsRevision).length;
    const completed = mockPortalTasks.filter((t) => !t.needsRevision).length;

    expect(totalDelivered).toBe(3);
    expect(inRevision).toBe(1);
    expect(completed).toBe(2);
  });

  it('filters deliverables by tab status', () => {
    const allTasks = mockPortalTasks;
    const revisionTasks = mockPortalTasks.filter((t) => t.needsRevision);
    const readyTasks = mockPortalTasks.filter((t) => !t.needsRevision);

    expect(allTasks).toHaveLength(3);
    expect(revisionTasks).toHaveLength(1);
    expect(revisionTasks[0].id).toBe('task-1');
    expect(readyTasks).toHaveLength(2);
    expect(readyTasks.map((t) => t.id)).toEqual(['task-2', 'task-3']);
  });

  it('filters deliverables by search query across title and notes', () => {
    const query = 'figma';
    const matches = mockPortalTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query)),
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('task-1');

    const copyQuery = 'landing page';
    const copyMatches = mockPortalTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(copyQuery) ||
        (t.notes && t.notes.toLowerCase().includes(copyQuery)),
    );

    expect(copyMatches).toHaveLength(1);
    expect(copyMatches[0].id).toBe('task-3');
  });
});
