'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireWorkspaceAdmin } from '@/lib/supabase/workspace';
import {
  createCommentSchema,
  resolveRevisionSchema,
  type CreateCommentInput,
  type ResolveRevisionInput,
} from '@/lib/validation/comment';
import { checkCommentRateLimit } from '@/lib/rate-limit/rate-limiter';
import { sendEmail } from '@/lib/email/client';
import { generateRevisionAlertEmailHtml } from '@/lib/email/templates/revision-alert';
import type { Database } from '@/lib/supabase/database.types';
import type { CommentItem } from '@/lib/data/comments';

export interface CreateCommentActionResult {
  success: boolean;
  error?: string;
  commentId?: string;
}

export interface ResolveRevisionActionResult {
  success: boolean;
  error?: string;
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type CommentRow = Database['public']['Tables']['comments']['Row'];

export async function createComment(
  input: CreateCommentInput,
): Promise<CreateCommentActionResult> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  // 2. Enforce Rate Limiting (10 comments per 10 minutes)
  const rateLimit = await checkCommentRateLimit(user.id);
  if (!rateLimit.success) {
    const minutesLeft = Math.ceil(
      Math.max(0, rateLimit.reset - Date.now()) / (1000 * 60),
    );
    return {
      success: false,
      error: `Rate limit reached. You can post another comment in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
    };
  }

  // 3. Validate Input
  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid comment input.',
    };
  }

  const { taskId, content } = parsed.data;

  // 4. Fetch user profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as Pick<
    ProfileRow,
    'role' | 'full_name' | 'email'
  > | null;

  if (!profile) {
    return { success: false, error: 'User profile not found.' };
  }

  const isClient = profile.role === 'client';

  // 5. Fetch task details to verify permissions
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select('id, title, client_id, workspace_id, status, needs_revision')
    .eq('id', taskId)
    .maybeSingle();

  const task = taskData as Pick<
    TaskRow,
    'id' | 'title' | 'client_id' | 'workspace_id' | 'status' | 'needs_revision'
  > | null;

  if (taskError || !task) {
    return { success: false, error: 'Deliverable not found.' };
  }

  let clientDisplayName = profile.full_name || 'Client';

  // 6. Access Check
  if (isClient) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, display_name, active, workspace_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    const client = clientData as Pick<
      ClientRow,
      'id' | 'display_name' | 'active' | 'workspace_id'
    > | null;

    if (
      !client ||
      !client.active ||
      client.id !== task.client_id ||
      client.workspace_id !== task.workspace_id ||
      task.status !== 'completed'
    ) {
      return {
        success: false,
        error:
          'Unauthorized: You can only comment on deliverables assigned to you in your workspace.',
      };
    }

    clientDisplayName = client.display_name || clientDisplayName;
  } else {
    // Admin check: ensure admin has membership in task's workspace
    const workspaceCtx = await requireWorkspaceAdmin(
      supabase,
      user.id,
      task.workspace_id,
    );
    if (!workspaceCtx) {
      return {
        success: false,
        error:
          'Forbidden: You do not have admin access to this task workspace.',
      };
    }
  }

  // 7. Insert comment (using server Supabase client enforcing RLS)
  const { data: commentData, error: commentError } = await (
    supabase.from('comments') as unknown as {
      insert: (record: {
        task_id: string;
        author_id: string;
        body: string;
      }) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string } | null;
            error: Error | null;
          }>;
        };
      };
    }
  )
    .insert({
      task_id: taskId,
      author_id: user.id,
      body: content,
    })
    .select('id')
    .single();

  const comment = commentData as Pick<CommentRow, 'id'> | null;

  if (commentError || !comment) {
    console.error('Error inserting comment:', commentError);
    return {
      success: false,
      error: 'Failed to post comment. Please try again.',
    };
  }

  // 8. If author is Client -> Automatically flag task with `needs_revision = true`
  if (isClient) {
    const adminClient = createAdminClient();
    const { error: updateError } = await (
      adminClient.from('tasks') as unknown as {
        update: (values: { needs_revision: boolean; updated_at: string }) => {
          eq: (col: string, val: string) => Promise<{ error: Error | null }>;
        };
      }
    )
      .update({
        needs_revision: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error setting needs_revision:', updateError);
    }

    // 9. Dispatch Admin Alert Email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskora.com';
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    const emailHtml = generateRevisionAlertEmailHtml({
      clientName: clientDisplayName,
      taskTitle: task.title,
      commentContent: content,
      taskId,
      appUrl,
    });

    sendEmail({
      to: adminEmail,
      subject: `Revision Requested: ${task.title} by ${clientDisplayName}`,
      html: emailHtml,
    }).catch((err) => {
      console.error('Failed to send admin revision alert email:', err);
    });
  }

  // 10. Revalidate paths
  revalidatePath(`/portal/jobs/${taskId}`);
  revalidatePath('/portal/jobs');
  revalidatePath('/portal');
  revalidatePath('/admin/dashboard');
  if (task.client_id) {
    revalidatePath(`/admin/clients/${task.client_id}`);
  }

  return { success: true, commentId: comment.id };
}

export async function resolveRevision(
  input: ResolveRevisionInput,
): Promise<ResolveRevisionActionResult> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  // 2. Validate input
  const parsed = resolveRevisionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid task ID.' };
  }

  const { taskId } = parsed.data;

  // 3. Fetch task to identify its workspace
  const { data: taskData, error: taskFetchError } = await supabase
    .from('tasks')
    .select('id, client_id, workspace_id')
    .eq('id', taskId)
    .maybeSingle();

  const task = taskData as {
    id: string;
    client_id: string | null;
    workspace_id: string;
  } | null;

  if (taskFetchError || !task) {
    return { success: false, error: 'Task not found.' };
  }

  // 4. Verify admin access in task workspace
  const workspaceCtx = await requireWorkspaceAdmin(
    supabase,
    user.id,
    task.workspace_id,
  );
  if (!workspaceCtx) {
    return {
      success: false,
      error: 'Unauthorized: Only workspace admins can resolve revisions.',
    };
  }

  // 5. Update task needs_revision = false
  const adminClient = createAdminClient();
  const { data: updatedTaskData, error: updateError } = await adminClient
    .from('tasks')
    .update({
      needs_revision: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('workspace_id', workspaceCtx.workspaceId)
    .select('id, client_id')
    .single();

  const updatedTask = updatedTaskData as Pick<
    TaskRow,
    'id' | 'client_id'
  > | null;

  if (updateError || !updatedTask) {
    console.error('Error resolving revision:', updateError);
    return { success: false, error: 'Failed to resolve revision.' };
  }

  // 6. Revalidate paths
  revalidatePath(`/portal/jobs/${taskId}`);
  revalidatePath('/portal/jobs');
  revalidatePath('/portal');
  revalidatePath('/admin/dashboard');
  if (updatedTask.client_id) {
    revalidatePath(`/admin/clients/${updatedTask.client_id}`);
  }

  return { success: true };
}

export async function getCommentsAction(
  taskId: string,
): Promise<CommentItem[]> {
  const { getTaskComments } = await import('@/lib/data/comments');
  return getTaskComments(taskId);
}
