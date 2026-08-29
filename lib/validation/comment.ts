import { z } from 'zod';

export const createCommentSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2,000 characters'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const resolveRevisionSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

export type ResolveRevisionInput = z.infer<typeof resolveRevisionSchema>;
