import { z } from 'zod';
import { projectUrlSchema } from './attachment';

export const taskCategorySchema = z.enum([
  'general',
  'work',
  'personal',
  'urgent',
  'shopping',
]);

export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less'),
    category: taskCategorySchema.default('general'),
    clientId: z.string().uuid('Invalid client ID').nullable().optional(),
    priority: taskPrioritySchema.default('medium'),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
      .nullable()
      .optional()
      .or(z.literal('')),
    notes: z
      .string()
      .max(2000, 'Notes must be 2000 characters or less')
      .nullable()
      .optional(),
    projectUrl: projectUrlSchema,
  })
  .refine(
    (data) => {
      if (data.category === 'work') {
        return Boolean(data.clientId && data.clientId.trim() !== '');
      }
      return true;
    },
    {
      message: 'A client is required for Work tasks',
      path: ['clientId'],
    },
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less'),
    category: taskCategorySchema,
    clientId: z.string().uuid('Invalid client ID').nullable().optional(),
    priority: taskPrioritySchema,
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
      .nullable()
      .optional()
      .or(z.literal('')),
    notes: z
      .string()
      .max(2000, 'Notes must be 2000 characters or less')
      .nullable()
      .optional(),
    projectUrl: projectUrlSchema,
    needsRevision: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.category === 'work') {
        return Boolean(data.clientId && data.clientId.trim() !== '');
      }
      return true;
    },
    {
      message: 'A client is required for Work tasks',
      path: ['clientId'],
    },
  );

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
