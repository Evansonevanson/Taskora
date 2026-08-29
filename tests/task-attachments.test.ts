import { describe, it, expect } from 'vitest';
import {
  isSafeProjectUrl,
  projectUrlSchema,
  uploadAttachmentInputSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/validation/attachment';
import { createTaskSchema, updateTaskSchema } from '@/lib/validation/task';

describe('Project Link & Deliverable Attachments Validation & Security', () => {
  describe('1. Project Link (project_url) Security & Protocol Rules', () => {
    it('accepts valid HTTPS and HTTP URLs', () => {
      expect(isSafeProjectUrl('https://figma.com/file/abcdef123')).toBe(true);
      expect(
        isSafeProjectUrl('https://drive.google.com/drive/folders/xyz'),
      ).toBe(true);
      expect(isSafeProjectUrl('http://my-staging-site.com')).toBe(true);
      expect(isSafeProjectUrl('https://behance.net/gallery/123/project')).toBe(
        true,
      );
      expect(
        projectUrlSchema.safeParse('https://figma.com/file/abcdef123').success,
      ).toBe(true);
    });

    it('accepts null, undefined, or empty string (optional field)', () => {
      expect(isSafeProjectUrl(null)).toBe(true);
      expect(isSafeProjectUrl(undefined)).toBe(true);
      expect(isSafeProjectUrl('')).toBe(true);
      expect(isSafeProjectUrl('   ')).toBe(true);
    });

    it('strictly rejects dangerous schemes like javascript:, data:, file:, vbscript:', () => {
      expect(isSafeProjectUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeProjectUrl('javascript://alert(1)')).toBe(false);
      expect(
        isSafeProjectUrl(
          'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        ),
      ).toBe(false);
      expect(isSafeProjectUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeProjectUrl('vbscript:msgbox("hello")')).toBe(false);
      expect(isSafeProjectUrl('custom-app://open/something')).toBe(false);
      expect(isSafeProjectUrl('not a url at all')).toBe(false);
    });

    it('validates projectUrl in createTaskSchema and updateTaskSchema', () => {
      const validCreate = createTaskSchema.safeParse({
        title: 'Task with safe Figma link',
        category: 'work',
        clientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        projectUrl: 'https://figma.com/file/123',
      });
      expect(validCreate.success).toBe(true);

      const dangerousCreate = createTaskSchema.safeParse({
        title: 'Task with dangerous script link',
        category: 'general',
        projectUrl: 'javascript:stealCredentials()',
      });
      expect(dangerousCreate.success).toBe(false);
      if (!dangerousCreate.success) {
        expect(
          dangerousCreate.error.flatten().fieldErrors.projectUrl,
        ).toBeDefined();
      }

      const validUpdate = updateTaskSchema.safeParse({
        title: 'Updated task with live link',
        category: 'general',
        priority: 'high',
        projectUrl: 'https://example.com/demo',
      });
      expect(validUpdate.success).toBe(true);

      const invalidUpdate = updateTaskSchema.safeParse({
        title: 'Updated task with data URI',
        category: 'general',
        priority: 'medium',
        projectUrl: 'data:application/javascript;alert(1)',
      });
      expect(invalidUpdate.success).toBe(false);
    });
  });

  describe('2. Deliverable Attachment Metadata & MIME Type Validation', () => {
    it('allows valid MIME types (image/jpeg, image/png, image/webp, application/pdf)', () => {
      ALLOWED_MIME_TYPES.forEach((mime) => {
        const result = uploadAttachmentInputSchema.safeParse({
          taskId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          fileName: `sample.${mime.split('/')[1]}`,
          mimeType: mime,
          fileSize: 1024 * 100, // 100 KB
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects unsupported MIME types (e.g., exe, zip, html, svg)', () => {
      const unsupportedTypes = [
        'application/x-msdownload',
        'application/zip',
        'text/html',
        'image/svg+xml',
        'text/javascript',
      ];

      unsupportedTypes.forEach((mime) => {
        const result = uploadAttachmentInputSchema.safeParse({
          taskId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          fileName: 'unsupported.ext',
          mimeType: mime,
          fileSize: 1024,
        });
        expect(result.success).toBe(false);
      });
    });

    it('enforces 20MB maximum file size limit', () => {
      const validSize = uploadAttachmentInputSchema.safeParse({
        taskId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        fileName: 'brand_guide.pdf',
        mimeType: 'application/pdf',
        fileSize: MAX_FILE_SIZE_BYTES, // Exactly 20MB
      });
      expect(validSize.success).toBe(true);

      const oversized = uploadAttachmentInputSchema.safeParse({
        taskId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        fileName: 'huge_archive.pdf',
        mimeType: 'application/pdf',
        fileSize: MAX_FILE_SIZE_BYTES + 1, // 20MB + 1 byte
      });
      expect(oversized.success).toBe(false);
      if (!oversized.success) {
        expect(oversized.error.flatten().fieldErrors.fileSize).toBeDefined();
      }
    });
  });

  describe('3. RLS & RBAC Access Matrix for Deliverable Attachments', () => {
    interface MockUser {
      id: string;
      role: 'admin' | 'client';
      clientId?: string;
      active?: boolean;
    }

    interface MockAttachment {
      id: string;
      taskId: string;
      fileName: string;
      taskClientId: string | null;
      taskStatus: 'pending' | 'completed';
    }

    const admin: MockUser = { id: 'admin-1', role: 'admin' };
    const clientA: MockUser = {
      id: 'user-a',
      role: 'client',
      clientId: 'client-a',
      active: true,
    };
    const clientB: MockUser = {
      id: 'user-b',
      role: 'client',
      clientId: 'client-b',
      active: true,
    };
    const deactivatedClient: MockUser = {
      id: 'user-c',
      role: 'client',
      clientId: 'client-a',
      active: false,
    };

    const attachCompletedClientA: MockAttachment = {
      id: 'att-1',
      taskId: 'task-a1',
      fileName: 'final_deliverable.png',
      taskClientId: 'client-a',
      taskStatus: 'completed',
    };

    const attachPendingClientA: MockAttachment = {
      id: 'att-2',
      taskId: 'task-a2',
      fileName: 'draft_preview.png',
      taskClientId: 'client-a',
      taskStatus: 'pending',
    };

    const attachCompletedClientB: MockAttachment = {
      id: 'att-3',
      taskId: 'task-b1',
      fileName: 'client_b_assets.pdf',
      taskClientId: 'client-b',
      taskStatus: 'completed',
    };

    // Simulated RLS / Action access policy evaluator
    const canAccessAttachment = (
      user: MockUser,
      att: MockAttachment,
    ): boolean => {
      if (user.role === 'admin') return true;
      if (user.role === 'client' && user.active) {
        return (
          att.taskClientId === user.clientId && att.taskStatus === 'completed'
        );
      }
      return false;
    };

    const canUploadOrDeleteAttachment = (user: MockUser): boolean => {
      return user.role === 'admin';
    };

    it('Admin has full access to all attachments (view, upload, delete, signed URL)', () => {
      expect(canAccessAttachment(admin, attachCompletedClientA)).toBe(true);
      expect(canAccessAttachment(admin, attachPendingClientA)).toBe(true);
      expect(canAccessAttachment(admin, attachCompletedClientB)).toBe(true);
      expect(canUploadOrDeleteAttachment(admin)).toBe(true);
    });

    it('Client A can access attachments on own Completed tasks', () => {
      expect(canAccessAttachment(clientA, attachCompletedClientA)).toBe(true);
    });

    it('Client A CANNOT access attachments on own Pending tasks', () => {
      expect(canAccessAttachment(clientA, attachPendingClientA)).toBe(false);
    });

    it('Client A CANNOT access Client B attachments (cross-client isolation)', () => {
      expect(canAccessAttachment(clientA, attachCompletedClientB)).toBe(false);
    });

    it('Client cannot upload or delete attachments', () => {
      expect(canUploadOrDeleteAttachment(clientA)).toBe(false);
      expect(canUploadOrDeleteAttachment(clientB)).toBe(false);
    });

    it('Deactivated Client cannot access any attachments', () => {
      expect(
        canAccessAttachment(deactivatedClient, attachCompletedClientA),
      ).toBe(false);
    });
  });
});
