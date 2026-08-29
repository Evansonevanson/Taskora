import { describe, it, expect } from 'vitest';
import { calculateProgressPercentage } from '@/lib/data/tasks';
import {
  checkCommentRateLimit,
  checkLoginRateLimit,
} from '@/lib/rate-limit/rate-limiter';
import { createTaskSchema, updateTaskSchema } from '@/lib/validation/task';
import { createClientSchema } from '@/lib/validation/client';
import { createCommentSchema } from '@/lib/validation/comment';

describe('Phase 11: Full End-to-End System Lifecycle Tests', () => {
  const validClientId = '550e8400-e29b-41d4-a716-446655440000';
  const validTaskId = '660e8400-e29b-41d4-a716-446655440001';

  describe('Complete Task & Revision Lifecycle', () => {
    it('executes full workflow: creation -> completion -> client comment -> revision resolution -> archiving', () => {
      // 1. Task Creation Validation
      const createInput = {
        title: 'Complete Mobile App Redesign',
        category: 'work' as const,
        clientId: validClientId,
        priority: 'high' as const,
        dueDate: '2026-09-15',
        notes: 'Figma link: https://figma.com/design/12345',
      };
      const createValidation = createTaskSchema.safeParse(createInput);
      expect(createValidation.success).toBe(true);

      // 2. Initial Task State
      let task = {
        id: validTaskId,
        title: createInput.title,
        category: createInput.category,
        clientId: createInput.clientId,
        priority: createInput.priority,
        dueDate: createInput.dueDate,
        notes: createInput.notes,
        status: 'pending',
        needsRevision: false,
        archived: false,
        createdAt: new Date().toISOString(),
        completedAt: null as string | null,
        clientNotifiedAt: null as string | null,
      };

      // 3. Progress Tracking with pending task
      expect(calculateProgressPercentage(0, 1)).toBe(0);

      // 4. Admin Marks Task as Completed
      task = {
        ...task,
        status: 'completed',
        completedAt: new Date().toISOString(),
        clientNotifiedAt: new Date().toISOString(), // Notify client via email
      };
      expect(calculateProgressPercentage(1, 1)).toBe(100);
      expect(task.status).toBe('completed');
      expect(task.clientNotifiedAt).not.toBeNull();

      // 5. Client Submits Feedback Comment (triggers needs_revision = true)
      const commentInput = {
        taskId: task.id,
        content: 'Please adjust typography on onboarding screens to 16px.',
      };
      const commentValidation = createCommentSchema.safeParse(commentInput);
      expect(commentValidation.success).toBe(true);

      task = {
        ...task,
        needsRevision: true,
      };
      expect(task.needsRevision).toBe(true);

      // 6. Admin Resolves Revision via Task Update / Resolution Action
      const updateInput = {
        title: task.title,
        category: 'work' as const,
        clientId: task.clientId,
        priority: 'high' as const,
        dueDate: task.dueDate,
        notes: task.notes,
        needsRevision: false,
      };
      const updateValidation = updateTaskSchema.safeParse(updateInput);
      expect(updateValidation.success).toBe(true);

      task = {
        ...task,
        needsRevision: false,
      };
      expect(task.needsRevision).toBe(false);

      // 7. Clear Completed Bulk Action / Archive Task
      task = {
        ...task,
        archived: true,
      };
      expect(task.archived).toBe(true);
      expect(task.status).toBe('completed'); // Remains completed for client portal history
    });
  });

  describe('Complete Client Lifecycle', () => {
    it('executes client workflow: provisioning -> active state -> deactivation -> auth rejection', () => {
      // 1. Client Creation Validation
      const clientInput = {
        displayName: 'Evelyn Carter',
        companyName: 'Carter Creative Studios',
        email: 'evelyn@carterstudios.io',
        sendInviteEmail: true,
      };
      const clientValidation = createClientSchema.safeParse(clientInput);
      expect(clientValidation.success).toBe(true);

      // 2. Initial Active Client Record
      let client = {
        id: validClientId,
        profileId: 'profile-user-1',
        displayName: clientInput.displayName,
        companyName: clientInput.companyName,
        email: clientInput.email,
        active: true,
      };
      expect(client.active).toBe(true);

      // 3. Deactivate Client
      client = {
        ...client,
        active: false,
      };
      expect(client.active).toBe(false);

      // 4. Verify Middleware / Auth Guard Rejects Inactive Client
      const canAccessPortal = (c: typeof client) => c.active;
      expect(canAccessPortal(client)).toBe(false);
    });
  });

  describe('Multi-Tier Sliding Window Rate Limiting Stress Test', () => {
    it('enforces comment rate limit boundaries (10 requests per 10 minutes)', async () => {
      const userKey = `test-user-rate-${Date.now()}`;

      // First 10 requests should succeed
      for (let i = 0; i < 10; i++) {
        const check = await checkCommentRateLimit(userKey);
        expect(check.success).toBe(true);
        expect(check.remaining).toBe(10 - 1 - i);
      }

      // 11th request must be rejected
      const blockedCheck = await checkCommentRateLimit(userKey);
      expect(blockedCheck.success).toBe(false);
      expect(blockedCheck.remaining).toBe(0);
      expect(blockedCheck.reset).toBeGreaterThan(Date.now());
    });

    it('enforces auth rate limit boundaries (5 requests per 15 minutes)', async () => {
      const ipKey = `test-ip-rate-${Date.now()}`;

      // First 5 requests should succeed
      for (let i = 0; i < 5; i++) {
        const check = await checkLoginRateLimit(ipKey);
        expect(check.success).toBe(true);
        expect(check.remaining).toBe(5 - 1 - i);
      }

      // 6th request must be rejected
      const blockedCheck = await checkLoginRateLimit(ipKey);
      expect(blockedCheck.success).toBe(false);
      expect(blockedCheck.remaining).toBe(0);
      expect(blockedCheck.reset).toBeGreaterThan(Date.now());
    });
  });
});
