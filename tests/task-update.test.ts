import { describe, it, expect } from 'vitest';
import { updateTaskSchema } from '@/lib/validation/task';

describe('Task Update Validation Schema (updateTaskSchema)', () => {
  it('validates a valid task update', () => {
    const input = {
      title: 'Update Documentation',
      category: 'general' as const,
      priority: 'high' as const,
      dueDate: '2026-09-20',
      notes: 'Add architecture section',
      needsRevision: false,
    };

    const result = updateTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Update Documentation');
      expect(result.data.priority).toBe('high');
      expect(result.data.needsRevision).toBe(false);
    }
  });

  it('validates updating category to work with a valid client_id', () => {
    const input = {
      title: 'Implement OAuth Flow',
      category: 'work' as const,
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      priority: 'high' as const,
      dueDate: '2026-09-05',
    };

    const result = updateTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects updating category to work without a client_id', () => {
    const input = {
      title: 'Implement OAuth Flow',
      category: 'work' as const,
      clientId: '',
      priority: 'high' as const,
    };

    const result = updateTaskSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.clientId).toContain(
        'A client is required for Work tasks',
      );
    }
  });

  it('validates resolving revision request (needsRevision = false)', () => {
    const input = {
      title: 'Revise Color Palette',
      category: 'work' as const,
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      priority: 'medium' as const,
      notes: 'Applied requested emerald accents',
      needsRevision: false,
    };

    const result = updateTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.needsRevision).toBe(false);
    }
  });

  it('rejects invalid title and invalid date format during update', () => {
    const input = {
      title: '',
      category: 'personal' as const,
      priority: 'low' as const,
      dueDate: '2026/09/20',
    };

    const result = updateTaskSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.title).toBeDefined();
      expect(fieldErrors.dueDate).toBeDefined();
    }
  });
});
