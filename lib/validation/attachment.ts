import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
] as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB (20,971,520 bytes)

/**
 * Validates that a string is a safe HTTP or HTTPS URL.
 * Strictly prohibits dangerous schemes like javascript:, data:, file:, vbscript:, etc.
 */
export function isSafeProjectUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') {
    return true;
  }

  const trimmed = url.trim();

  // 1. Basic regex check for http/https scheme prefix
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  // 2. Full URL object parsing to verify protocol
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Safe project URL Zod validator schema.
 */
export const projectUrlSchema = z
  .string()
  .trim()
  .max(1000, 'Project URL must be 1000 characters or less')
  .refine(isSafeProjectUrl, {
    message: 'Project link must be a valid http:// or https:// URL',
  })
  .nullable()
  .optional()
  .or(z.literal(''));

export const uploadAttachmentInputSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  fileName: z
    .string()
    .trim()
    .min(1, 'File name is required')
    .max(255, 'File name is too long'),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    message: 'Only JPG, PNG, WEBP, and PDF files are supported.',
  }),
  fileSize: z
    .number()
    .int()
    .positive('File size must be greater than 0')
    .max(MAX_FILE_SIZE_BYTES, 'File size cannot exceed 20MB.'),
});

export type UploadAttachmentInput = z.infer<typeof uploadAttachmentInputSchema>;

export const deleteAttachmentInputSchema = z.object({
  attachmentId: z.string().uuid('Invalid attachment ID'),
});

export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentInputSchema>;

export const getSignedUrlInputSchema = z.object({
  attachmentId: z.string().uuid('Invalid attachment ID'),
});

export type GetSignedUrlInput = z.infer<typeof getSignedUrlInputSchema>;
