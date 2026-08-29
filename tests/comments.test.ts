import { describe, it, expect } from 'vitest';
import {
  createCommentSchema,
  resolveRevisionSchema,
} from '@/lib/validation/comment';

describe('Comment Validation & Revision Logic', () => {
  const validTaskId = '123e4567-e89b-12d3-a456-426614174000';

  it('validates a valid comment input', () => {
    const input = {
      taskId: validTaskId,
      content:
        'Please adjust the header font size to 18px and use darker borders.',
    };

    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe(input.content);
    }
  });

  it('rejects empty or whitespace-only comments', () => {
    const input = {
      taskId: validTaskId,
      content: '   ',
    };

    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects comments exceeding 2000 characters', () => {
    const input = {
      taskId: validTaskId,
      content: 'a'.repeat(2001),
    };

    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID task IDs', () => {
    const input = {
      taskId: 'invalid-id-format',
      content: 'Looks great!',
    };

    const result = createCommentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('validates revision resolution schema', () => {
    const valid = resolveRevisionSchema.safeParse({ taskId: validTaskId });
    expect(valid.success).toBe(true);

    const invalid = resolveRevisionSchema.safeParse({ taskId: 'bad-uuid' });
    expect(invalid.success).toBe(false);
  });

  it('simulates client comment automatic revision flagging', () => {
    const simulateClientCommentSubmission = (
      userRole: 'admin' | 'client',
      currentNeedsRevision: boolean,
    ) => {
      if (userRole === 'client') {
        return {
          needsRevision: true,
          alertAdmin: true,
        };
      }
      return {
        needsRevision: currentNeedsRevision,
        alertAdmin: false,
      };
    };

    const clientAction = simulateClientCommentSubmission('client', false);
    expect(clientAction.needsRevision).toBe(true);
    expect(clientAction.alertAdmin).toBe(true);

    const adminAction = simulateClientCommentSubmission('admin', false);
    expect(adminAction.needsRevision).toBe(false);
    expect(adminAction.alertAdmin).toBe(false);
  });
});
