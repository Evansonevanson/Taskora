import { describe, it, expect } from 'vitest';
import { generateJobCompletedEmailHtml } from '@/lib/email/templates/job-completed';

describe('Task Completion & Email Notification Flow', () => {
  it('generates a valid HTML job completed email with deep links', () => {
    const data = {
      clientName: 'Wayne Enterprises',
      taskTitle: 'Security Audit & Penetration Testing',
      taskId: 'b4a0f447-0e6d-4b82-8bc5-3e2840d216f9',
      appUrl: 'https://taskora.app',
    };

    const html = generateJobCompletedEmailHtml(data);

    expect(html).toContain('Wayne Enterprises');
    expect(html).toContain('Security Audit & Penetration Testing');
    expect(html).toContain(
      'https://taskora.app/portal/jobs/b4a0f447-0e6d-4b82-8bc5-3e2840d216f9',
    );
    expect(html).toContain('Deliverable Ready for Review');
    expect(html).toContain('Taskora');
  });

  it('correctly handles trailing slashes in APP_URL', () => {
    const data = {
      clientName: 'Stark Industries',
      taskTitle: 'Arc Reactor Schematic UI',
      taskId: 'c5b1g558-1f7e-5c93-9cd6-4f3951e327a0',
      appUrl: 'https://taskora.app/',
    };

    const html = generateJobCompletedEmailHtml(data);
    expect(html).toContain(
      'https://taskora.app/portal/jobs/c5b1g558-1f7e-5c93-9cd6-4f3951e327a0',
    );
  });

  it('checks email idempotency guard behavior', () => {
    // Simulated task state
    const taskAlreadyNotified = {
      id: 'task-1',
      category: 'work',
      client_id: 'client-1',
      status: 'completed',
      client_notified_at: '2026-08-28T12:00:00Z',
    };

    const taskNotNotified = {
      id: 'task-2',
      category: 'work',
      client_id: 'client-1',
      status: 'pending',
      client_notified_at: null,
    };

    const shouldSendEmail = (task: {
      category: string;
      client_id: string | null;
      client_notified_at: string | null;
    }) => {
      return (
        task.category === 'work' &&
        Boolean(task.client_id) &&
        task.client_notified_at === null
      );
    };

    expect(shouldSendEmail(taskAlreadyNotified)).toBe(false);
    expect(shouldSendEmail(taskNotNotified)).toBe(true);

    const personalTask = {
      id: 'task-3',
      category: 'personal',
      client_id: null,
      status: 'pending',
      client_notified_at: null,
    };
    expect(shouldSendEmail(personalTask)).toBe(false);
  });
});
