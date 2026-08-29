'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type AllowedMimeType,
} from '@/lib/validation/attachment';
import { checkAttachmentUploadRateLimit } from '@/lib/rate-limit/rate-limiter';
import type { Database } from '@/lib/supabase/database.types';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export type TaskAttachmentRow =
  Database['public']['Tables']['task_attachments']['Row'];

/**
 * Sanitizes file names to prevent path traversal and unsafe characters.
 */
function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 100);
}

/**
 * Uploads a deliverable attachment for a task (Admin-only).
 */
export async function uploadTaskAttachment(
  taskId: string,
  formData: FormData,
): Promise<ActionResponse<TaskAttachmentRow>> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Verify Admin Role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as {
      role: Database['public']['Tables']['profiles']['Row']['role'];
    } | null;

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    // 2. Rate Limiting: 30 uploads / 10 min
    const rateLimit = await checkAttachmentUploadRateLimit(user.id);
    if (!rateLimit.success) {
      return {
        success: false,
        error:
          'Upload rate limit exceeded. Please wait a few minutes before trying again.',
      };
    }

    // 3. Extract and validate file
    const file = formData.get('file') as File | null;
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'No file provided' };
    }

    if (file.size <= 0) {
      return { success: false, error: 'Cannot upload an empty file' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'File size exceeds maximum allowed limit of 20MB',
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
      return {
        success: false,
        error:
          'Unsupported file type. Only JPG, PNG, WEBP, and PDF files are allowed.',
      };
    }

    // 4. Verify Task exists
    const { data: taskData, error: taskFetchError } = await supabase
      .from('tasks')
      .select('id, client_id')
      .eq('id', taskId)
      .maybeSingle();

    if (taskFetchError || !taskData) {
      return { success: false, error: 'Task not found' };
    }

    // 5. Generate secure storage path
    const attachmentId = crypto.randomUUID();
    const sanitizedName = sanitizeFileName(file.name || 'deliverable');
    const storagePath = `tasks/${taskId}/${attachmentId}-${sanitizedName}`;

    const adminClient = createAdminClient();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 6. Upload to private Supabase Storage bucket
    const { error: uploadError } = await adminClient.storage
      .from('task-deliverables')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage Upload Error]', uploadError);
      return { success: false, error: 'Failed to upload deliverable file' };
    }

    // 7. Insert metadata into public.task_attachments
    const { data: attachmentRecord, error: dbError } = await adminClient
      .from('task_attachments')
      .insert({
        id: attachmentId,
        task_id: taskId,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError || !attachmentRecord) {
      console.error('[DB Attachment Insert Error]', dbError);
      // Clean up orphaned storage object
      await adminClient.storage.from('task-deliverables').remove([storagePath]);
      return { success: false, error: 'Failed to record attachment metadata' };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath(`/portal/jobs/${taskId}`);

    return {
      success: true,
      data: attachmentRecord as TaskAttachmentRow,
    };
  } catch (err) {
    console.error('Unexpected error in uploadTaskAttachment action:', err);
    return {
      success: false,
      error: 'An unexpected error occurred during upload',
    };
  }
}

/**
 * Deletes a deliverable attachment and cleans up its storage object (Admin-only).
 */
export async function deleteTaskAttachment(
  attachmentId: string,
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Verify Admin Role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as {
      role: Database['public']['Tables']['profiles']['Row']['role'];
    } | null;

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    const adminClient = createAdminClient();

    // 2. Fetch attachment metadata to locate storage path
    const { data: attachmentData, error: fetchError } = await adminClient
      .from('task_attachments')
      .select('id, task_id, storage_path')
      .eq('id', attachmentId)
      .maybeSingle();

    if (fetchError || !attachmentData) {
      return { success: false, error: 'Attachment not found' };
    }

    // 3. Remove storage object
    const { error: storageError } = await adminClient.storage
      .from('task-deliverables')
      .remove([attachmentData.storage_path]);

    if (storageError) {
      console.warn('[Storage Delete Warning]', storageError);
    }

    // 4. Delete database metadata
    const { error: dbDeleteError } = await adminClient
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbDeleteError) {
      console.error('[DB Delete Error]', dbDeleteError);
      return { success: false, error: 'Failed to delete attachment record' };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath(`/portal/jobs/${attachmentData.task_id}`);

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteTaskAttachment action:', err);
    return { success: false, error: 'Failed to delete attachment' };
  }
}

/**
 * Generates a short-lived signed download URL (300s TTL) for an attachment.
 * Strict authorization:
 * - Admin: can access any attachment.
 * - Client: can access ONLY attachments for their own Completed tasks.
 */
export async function getAttachmentSignedUrl(
  attachmentId: string,
): Promise<ActionResponse<{ signedUrl: string; fileName: string }>> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Fetch user role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as {
      role: Database['public']['Tables']['profiles']['Row']['role'];
    } | null;

    if (!profile) {
      return { success: false, error: 'Forbidden' };
    }

    const adminClient = createAdminClient();

    // 2. Fetch attachment with associated task details
    const { data: attachmentData, error: attachFetchError } = await adminClient
      .from('task_attachments')
      .select(
        `
        id,
        file_name,
        storage_path,
        task_id,
        tasks:task_id (
          id,
          client_id,
          status
        )
      `,
      )
      .eq('id', attachmentId)
      .maybeSingle();

    if (attachFetchError || !attachmentData) {
      return { success: false, error: 'Attachment not found' };
    }

    const associatedTask = attachmentData.tasks as unknown as {
      id: string;
      client_id: string | null;
      status: string;
    } | null;

    if (!associatedTask) {
      return { success: false, error: 'Associated task not found' };
    }

    // 3. Enforce Access Rules
    if (profile.role === 'client') {
      // Find client record for current user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: clientRecord } = await (supabase.from('clients') as any)
        .select('id, active')
        .eq('profile_id', user.id)
        .maybeSingle();

      const client = clientRecord as { id: string; active: boolean } | null;

      if (!client || !client.active) {
        return { success: false, error: 'Forbidden' };
      }

      // Check task ownership and completed status
      if (
        associatedTask.client_id !== client.id ||
        associatedTask.status !== 'completed'
      ) {
        return {
          success: false,
          error: 'Forbidden: Access to this deliverable is restricted.',
        };
      }
    }

    // 4. Generate signed URL with 300s expiration
    const { data: signedData, error: signError } = await adminClient.storage
      .from('task-deliverables')
      .createSignedUrl(attachmentData.storage_path, 300);

    if (signError || !signedData?.signedUrl) {
      console.error('[Signed URL Generation Error]', signError);
      return { success: false, error: 'Failed to generate download link' };
    }

    return {
      success: true,
      data: {
        signedUrl: signedData.signedUrl,
        fileName: attachmentData.file_name,
      },
    };
  } catch (err) {
    console.error('Unexpected error in getAttachmentSignedUrl:', err);
    return { success: false, error: 'Failed to prepare download link' };
  }
}
