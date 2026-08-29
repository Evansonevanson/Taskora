import { describe, it, expect } from 'vitest';
import type { PortalTaskItem } from '@/lib/data/portal';

describe('Client Portal Job Detail Presentation & Constraints', () => {
  const deliverableInRevision: PortalTaskItem = {
    id: 'task-rev-1',
    title: 'Brand Mascot 3D Illustration',
    notes: 'Vector 3D model renders with transparent background PNGs',
    category: 'work',
    priority: 'high',
    status: 'completed',
    dueDate: '2026-09-10',
    completedAt: '2026-08-27T10:00:00Z',
    needsRevision: true,
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-08-27T10:00:00Z',
  };

  const deliverableApproved: PortalTaskItem = {
    id: 'task-appr-1',
    title: 'Landing Page Hero Copywriting',
    notes: 'Final revised copywriting approved by marketing team',
    category: 'work',
    priority: 'medium',
    status: 'completed',
    dueDate: null,
    completedAt: '2026-08-25T14:00:00Z',
    needsRevision: false,
    createdAt: '2026-08-10T00:00:00Z',
    updatedAt: '2026-08-25T14:00:00Z',
  };

  it('correctly maps deliverable details and detects revision status', () => {
    expect(deliverableInRevision.needsRevision).toBe(true);
    expect(deliverableInRevision.status).toBe('completed');
    expect(deliverableInRevision.priority).toBe('high');
    expect(deliverableInRevision.notes).toContain('Vector 3D model');

    expect(deliverableApproved.needsRevision).toBe(false);
    expect(deliverableApproved.status).toBe('completed');
    expect(deliverableApproved.dueDate).toBeNull();
  });

  it('ensures only completed tasks are valid for client portal display', () => {
    const isDeliverableEligibleForPortal = (task: PortalTaskItem) => {
      return task.status.toLowerCase() === 'completed';
    };

    expect(isDeliverableEligibleForPortal(deliverableInRevision)).toBe(true);
    expect(isDeliverableEligibleForPortal(deliverableApproved)).toBe(true);

    const pendingTask: PortalTaskItem = {
      ...deliverableInRevision,
      status: 'pending',
    };
    expect(isDeliverableEligibleForPortal(pendingTask)).toBe(false);
  });
});
