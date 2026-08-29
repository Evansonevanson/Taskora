import { describe, it, expect } from 'vitest';
import { createTaskSchema } from '@/lib/validation/task';

describe('Task Validation Schema (createTaskSchema)', () => {
  it('validates a valid general task', () => {
    const input = {
      title: 'Buy Groceries',
      category: 'general' as const,
      priority: 'low' as const,
      dueDate: '2026-09-15',
      notes: 'Remember milk',
    };

    const result = createTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Buy Groceries');
      expect(result.data.category).toBe('general');
    }
  });

  it('validates a valid work task with a valid client_id', () => {
    const input = {
      title: 'Build Authentication Module',
      category: 'work' as const,
      clientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      priority: 'high' as const,
      dueDate: '2026-09-01',
      notes: 'Include rate limiting and MFA',
    };

    const result = createTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects a work task missing a client_id', () => {
    const input = {
      title: 'Build Landing Page',
      category: 'work' as const,
      clientId: '',
      priority: 'medium' as const,
    };

    const result = createTaskSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.clientId).toContain(
        'A client is required for Work tasks',
      );
    }
  });

  it('rejects an empty title', () => {
    const input = {
      title: '   ',
      category: 'personal' as const,
      priority: 'medium' as const,
    };

    const result = createTaskSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.title).toContain('Title is required');
    }
  });

  it('rejects a title exceeding 200 characters', () => {
    const input = {
      title: 'a'.repeat(201),
      category: 'personal' as const,
      priority: 'medium' as const,
    };

    const result = createTaskSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.title).toContain(
        'Title must be 200 characters or less',
      );
    }
  });

  it('rejects an invalid date format', () => {
    const input = {
      title: 'Submit Taxes',
      category: 'personal' as const,
      priority: 'high' as const,
      dueDate: '09/15/2026', // invalid, must be YYYY-MM-DD
    };

    const result = createTaskSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.dueDate).toContain(
        'Due date must be in YYYY-MM-DD format',
      );
    }
  });

  it('accepts an empty string or null due date', () => {
    const inputEmpty = {
      title: 'No Deadline Task',
      category: 'general' as const,
      priority: 'medium' as const,
      dueDate: '',
    };
    expect(createTaskSchema.safeParse(inputEmpty).success).toBe(true);

    const inputNull = {
      title: 'No Deadline Task 2',
      category: 'general' as const,
      priority: 'medium' as const,
      dueDate: null,
    };
    expect(createTaskSchema.safeParse(inputNull).success).toBe(true);
  });
});
