import { z } from 'zod';

export const createClientSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or fewer'),
  fullName: z
    .string()
    .trim()
    .max(100, 'Full name must be 100 characters or fewer')
    .optional(),
  companyName: z
    .string()
    .trim()
    .max(100, 'Company name must be 100 characters or fewer')
    .optional(),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  temporaryPassword: z
    .string()
    .min(8, 'Temporary password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  sendInviteEmail: z.boolean().default(true),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or fewer'),
  fullName: z
    .string()
    .trim()
    .max(100, 'Full name must be 100 characters or fewer')
    .optional(),
  companyName: z
    .string()
    .trim()
    .max(100, 'Company name must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;
