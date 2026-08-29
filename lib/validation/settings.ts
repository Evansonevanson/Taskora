import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(30, 'Category name cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Category name contains invalid characters'),
  label: z.string().min(2).max(30),
  color: z
    .enum(['indigo', 'emerald', 'amber', 'rose', 'sky', 'purple', 'stone'])
    .default('indigo'),
  isSystem: z.boolean().default(false),
});

export const updateNotificationSettingsSchema = z.object({
  defaultNotifyClient: z.boolean(),
  confirmBeforeCompleting: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateNotificationSettingsInput = z.infer<
  typeof updateNotificationSettingsSchema
>;
