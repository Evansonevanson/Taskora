'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireWorkspaceAdmin } from '@/lib/supabase/workspace';
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
 * Uploads a deliverable attachment for a task (Workspace Admin-only).
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

    // 1. Verify Workspace Admin Context
    const workspaceCtx = await requireWorkspaceAdmin(supabase, user.id);
    if (!workspaceCtx) {
      return {
        success: false,
        error: 'Forbidden: Workspace Admin access required',
      };
    }

    // 2. Verify task belongs to admin's workspace
    const { data: taskData, error: taskFetchError } = await supabase
      .from('tasks')
      .select('id, client_id, workspace_id')
      .eq('id', taskId)
      .eq('workspace_id', workspaceCtx.workspaceId)
      .maybeSingle();

    const taskRecord = taskData as {
      id: string;
      client_id: string | null;
      workspace_id: string;
    } | null;

    if (taskFetchError || !taskRecord) {
      return { success: false, error: 'Task not found in this workspace' };
    }

    // 3. Rate Limiting: 30 uploads / 10 min
    const rateLimit = await checkAttachmentUploadRateLimit(user.id);
    if (!rateLimit.success) {
      return {
        success: false,
        error:
          'Upload rate limit exceeded. Please wait a few minutes before trying again.',
      };
    }

    // 4. Extract and validate file
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

    // 5. Generate secure storage path with workspace prefix
    const attachmentId = crypto.randomUUID();
    const safeFileName = sanitizeFileName(file.name);
    const storagePath = `workspaces/${workspaceCtx.workspaceId}/tasks/${taskId}/${attachmentId}-${safeFileName}`;

    const adminClient = createAdminClient();

    // 6. Upload file buffer to Supabase Storage private bucket
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await adminClient.storage
      .from('task-deliverables')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage Upload Error]', uploadError);
      return { success: false, error: 'Failed to store deliverable file' };
    }

    // 7. Insert task_attachment record
    const { data: attachmentRecord, error: dbError } = await adminClient
      .from('task_attachments')
      .insert({
        id: attachmentId,
        workspace_id: workspaceCtx.workspaceId,
        task_id: taskId,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      })
      .select('*')
      .single();

    if (dbError || !attachmentRecord) {
      console.error('[Attachment DB Error]', dbError);
      // Cleanup storage object if DB insert fails
      await adminClient.storage.from('task-deliverables').remove([storagePath]);
      return {
        success: false,
        error: 'Failed to record attachment metadata',
      };
    }

    revalidatePath('/admin/dashboard');
    if (taskRecord.client_id) {
      revalidatePath(`/admin/clients/${taskRecord.client_id}`);
    }
    revalidatePath(`/portal/jobs/${taskId}`);

    return {
      success: true,
      data: attachmentRecord as TaskAttachmentRow,
    };
  } catch (err) {
    console.error('Unexpected error in uploadTaskAttachment:', err);
    return { success: false, error: 'Failed to upload attachment' };
  }
}

/**
 * Deletes a deliverable attachment (Workspace Admin-only).
 */
export async function deleteTaskAttachment(
  attachmentId: string,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const workspaceCtx = await requireWorkspaceAdmin(supabase, user.id);
    if (!workspaceCtx) {
      return {
        success: false,
        error: 'Forbidden: Workspace Admin access required',
      };
    }

    const adminClient = createAdminClient();

    // 1. Fetch attachment details verifying workspace ownership
    const { data: attachment, error: fetchError } = await adminClient
      .from('task_attachments')
      .select(
        'id, storage_path, task_id, workspace_id, tasks:task_id(client_id)',
      )
      .eq('id', attachmentId)
      .eq('workspace_id', workspaceCtx.workspaceId)
      .maybeSingle();

    if (fetchError || !attachment) {
      return {
        success: false,
        error: 'Attachment not found in this workspace',
      };
    }

    // 2. Remove file from storage
    const { error: storageError } = await adminClient.storage
      .from('task-deliverables')
      .remove([attachment.storage_path]);

    if (storageError) {
      console.warn('[Storage Cleanup Warning]', storageError);
    }

    // 3. Delete row from task_attachments
    const { error: deleteError } = await adminClient
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('workspace_id', workspaceCtx.workspaceId);

    if (deleteError) {
      console.error('[Attachment Delete DB Error]', deleteError);
      return {
        success: false,
        error: 'Failed to remove attachment record',
      };
    }

    const associatedClientId = (
      attachment.tasks as unknown as { client_id: string | null } | null
    )?.client_id;

    revalidatePath('/admin/dashboard');
    if (associatedClientId) {
      revalidatePath(`/admin/clients/${associatedClientId}`);
    }
    revalidatePath(`/portal/jobs/${attachment.task_id}`);

    return {
      success: true,
      data: { id: attachmentId },
    };
  } catch (err) {
    console.error('Unexpected error in deleteTaskAttachment:', err);
    return { success: false, error: 'Failed to delete attachment' };
  }
}

/**
 * Generates a short-lived signed download URL (300s TTL) for an attachment.
 * Strict multi-tenant authorization:
 * - Admin: can access attachments in workspaces they administer.
 * - Client: can access ONLY attachments for their own Completed tasks in their workspace.
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

    // 1. Fetch user profile
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
        workspace_id,
        tasks:task_id (
          id,
          client_id,
          workspace_id,
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
      workspace_id: string;
      status: string;
    } | null;

    if (!associatedTask) {
      return { success: false, error: 'Associated task not found' };
    }

    // 3. Enforce Multi-Tenant Access Rules
    if (profile.role === 'client') {
      // Find client record for current user
      const { data: clientRecord } = await supabase
        .from('clients')
        .select('id, active, workspace_id')
        .eq('profile_id', user.id)
        .maybeSingle();

      const client = clientRecord as {
        id: string;
        active: boolean;
        workspace_id: string;
      } | null;

      if (!client || !client.active) {
        return { success: false, error: 'Forbidden' };
      }

      // Check workspace isolation, task ownership, and completed status
      if (
        client.workspace_id !== attachmentData.workspace_id ||
        associatedTask.client_id !== client.id ||
        associatedTask.status !== 'completed'
      ) {
        return {
          success: false,
          error: 'Forbidden: Access to this deliverable is restricted.',
        };
      }
    } else {
      // Admin Access: Ensure calling user is an admin/owner of the attachment's workspace
      const workspaceCtx = await requireWorkspaceAdmin(
        supabase,
        user.id,
        attachmentData.workspace_id,
      );

      if (!workspaceCtx) {
        return {
          success: false,
          error: 'Forbidden: You do not have admin access to this workspace.',
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
