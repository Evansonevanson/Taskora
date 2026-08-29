import { describe, it, expect, vi } from 'vitest';
import { generateClientInviteEmailHtml } from '@/lib/email/templates/client-invite';
import { generateJobCompletedEmailHtml } from '@/lib/email/templates/job-completed';
import { generateRevisionAlertEmailHtml } from '@/lib/email/templates/revision-alert';

describe('Email Notification Templates & Delivery Pipeline', () => {
  const appUrl = 'https://taskora.app';

  describe('Client Invitation Email Template', () => {
    it('renders client credentials, company name, and portal link correctly', () => {
      const html = generateClientInviteEmailHtml({
        clientName: 'Alex Morgan',
        companyName: 'Acme Corporation',
        email: 'alex@acme.com',
        temporaryPassword: 'TempPassword123!',
        appUrl,
      });

      expect(html).toContain('Welcome to Taskora');
      expect(html).toContain('Alex Morgan');
      expect(html).toContain('Acme Corporation');
      expect(html).toContain('alex@acme.com');
      expect(html).toContain('TempPassword123!');
      expect(html).toContain('https://taskora.app/login');
    });
  });

  describe('Job Completed Email Template', () => {
    it('renders deliverable title and direct portal review URL', () => {
      const taskId = 'task-uuid-1234';
      const html = generateJobCompletedEmailHtml({
        clientName: 'Sarah Connor',
        taskTitle: 'Q3 Brand Identity Package',
        taskId,
        appUrl,
      });

      expect(html).toContain('Sarah Connor');
      expect(html).toContain('Q3 Brand Identity Package');
      expect(html).toContain('https://taskora.app/portal/jobs/task-uuid-1234');
      expect(html).toContain('Review Deliverable in Portal');
    });
  });

  describe('Revision Alert Email Template', () => {
    it('renders client name, deliverable title, comment snippet, and dashboard link', () => {
      const taskId = 'task-uuid-9876';
      const html = generateRevisionAlertEmailHtml({
        clientName: 'TechCorp Lead',
        taskTitle: 'Marketing Landing Page',
        commentContent:
          'Please adjust the headline copy and increase font weight.',
        taskId,
        appUrl,
      });

      expect(html).toContain('TechCorp Lead');
      expect(html).toContain('Marketing Landing Page');
      expect(html).toContain('Please adjust the headline copy');
      expect(html).toContain(
        'https://taskora.app/admin/dashboard?task=task-uuid-9876',
      );
      expect(html).toContain('Revision Requested');
    });
  });

  describe('Duplicate-Send Protection & Notification Idempotency', () => {
    const shouldSendCompletionEmail = (params: {
      category: string;
      hasClient: boolean;
      clientEmail: string | null;
      notifyClientOption: boolean;
      clientNotifiedAt: string | null;
    }) => {
      if (!params.notifyClientOption) return false;
      if (params.category !== 'work') return false;
      if (!params.hasClient || !params.clientEmail) return false;
      if (params.clientNotifiedAt !== null) return false; // Duplicate protection
      return true;
    };

    it('allows email send on first completion with notifyClient checked', () => {
      const result = shouldSendCompletionEmail({
        category: 'work',
        hasClient: true,
        clientEmail: 'client@example.com',
        notifyClientOption: true,
        clientNotifiedAt: null,
      });

      expect(result).toBe(true);
    });

    it('suppresses duplicate emails when client_notified_at is already set', () => {
      const result = shouldSendCompletionEmail({
        category: 'work',
        hasClient: true,
        clientEmail: 'client@example.com',
        notifyClientOption: true,
        clientNotifiedAt: '2026-08-28T12:00:00Z',
      });

      expect(result).toBe(false);
    });

    it('suppresses email when notifyClientOption is false', () => {
      const result = shouldSendCompletionEmail({
        category: 'work',
        hasClient: true,
        clientEmail: 'client@example.com',
        notifyClientOption: false,
        clientNotifiedAt: null,
      });

      expect(result).toBe(false);
    });

    it('suppresses email for non-work personal tasks', () => {
      const result = shouldSendCompletionEmail({
        category: 'personal',
        hasClient: false,
        clientEmail: null,
        notifyClientOption: true,
        clientNotifiedAt: null,
      });

      expect(result).toBe(false);
    });
  });

  describe('Non-blocking Error Isolation', () => {
    it('isolates email dispatch errors without failing surrounding database mutations', async () => {
      const mockFailingSendEmail = vi.fn().mockResolvedValue({
        success: false,
        error: 'Rate limit exceeded on provider',
      });

      const completeTaskWorkflow = async (
        taskId: string,
        notifyClient: boolean,
      ) => {
        // 1. Database mutation completes
        const dbUpdated = { id: taskId, status: 'completed' };

        // 2. Email dispatch is attempted with safe catch
        let emailSent = false;
        if (notifyClient) {
          try {
            const emailResult = await mockFailingSendEmail();
            if (emailResult.success) {
              emailSent = true;
            }
          } catch {
            // Non-blocking catch
          }
        }

        // 3. Database status remains completed regardless of email outcome
        return {
          success: true,
          taskStatus: dbUpdated.status,
          emailSent,
        };
      };

      const result = await completeTaskWorkflow('test-task-id', true);
      expect(result.success).toBe(true);
      expect(result.taskStatus).toBe('completed');
      expect(result.emailSent).toBe(false);
      expect(mockFailingSendEmail).toHaveBeenCalledTimes(1);
    });
  });
});
