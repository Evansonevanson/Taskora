'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@/lib/validation/task';
import { sendEmail } from '@/lib/email/client';
import { generateJobCompletedEmailHtml } from '@/lib/email/templates/job-completed';
import type { Database } from '@/lib/supabase/database.types';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createTask(
  rawInput: CreateTaskInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const parseResult = createTaskSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const input = parseResult.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

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

    const clientId = input.category === 'work' ? input.clientId || null : null;
    const dueDate =
      input.dueDate && input.dueDate.trim() !== '' ? input.dueDate : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('tasks') as any)
      .insert({
        title: input.title,
        category: input.category,
        client_id: clientId,
        priority: input.priority,
        due_date: dueDate,
        notes: input.notes || null,
        status: 'pending',
        archived: false,
        needs_revision: false,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }

    const task = data as { id: string };
    revalidatePath('/admin/dashboard');
    return { success: true, data: { id: task.id } };
  } catch (err) {
    console.error('Unexpected error in createTask:', err);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function updateTask(
  taskId: string,
  rawInput: UpdateTaskInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const parseResult = updateTaskSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const input = parseResult.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

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

    const clientId = input.category === 'work' ? input.clientId || null : null;
    const dueDate =
      input.dueDate && input.dueDate.trim() !== '' ? input.dueDate : null;

    const updatePayload: Record<string, unknown> = {
      title: input.title,
      category: input.category,
      client_id: clientId,
      priority: input.priority,
      due_date: dueDate,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    };

    if (typeof input.needsRevision === 'boolean') {
      updatePayload.needs_revision = input.needsRevision;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('tasks') as any)
      .update(updatePayload)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    return { success: true, data: { id: taskId } };
  } catch (err) {
    console.error('Unexpected error in updateTask:', err);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function completeTask(
  taskId: string,
  options?: { notifyClient?: boolean },
): Promise<ActionResponse<{ status: string; notified: boolean }>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch existing task with client details
    const { data: existingTaskData, error: fetchError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        category,
        client_id,
        status,
        completed_at,
        client_notified_at,
        clients (
          id,
          display_name,
          company_name,
          active,
          profile_id,
          profiles (
            email,
            full_name
          )
        )
      `,
      )
      .eq('id', taskId)
      .maybeSingle();

    if (fetchError || !existingTaskData) {
      return { success: false, error: 'Task not found' };
    }

    type TaskWithClientProfile = {
      id: string;
      title: string;
      category: string;
      client_id: string | null;
      status: string;
      completed_at: string | null;
      client_notified_at: string | null;
      clients: {
        id: string;
        display_name: string;
        company_name: string | null;
        active: boolean;
        profile_id: string;
        profiles: {
          email: string;
          full_name: string;
        } | null;
      } | null;
    };

    const task = existingTaskData as unknown as TaskWithClientProfile;
    const nowIso = new Date().toISOString();

    // 1. Update task to completed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('tasks') as any)
      .update({
        status: 'completed',
        completed_at: task.completed_at || nowIso,
        updated_at: nowIso,
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error completing task:', updateError);
      return { success: false, error: updateError.message };
    }

    let notified = false;

    // 2. Handle Client email notification if requested and category is work
    if (
      options?.notifyClient &&
      task.category === 'work' &&
      task.client_id &&
      task.clients?.profiles?.email
    ) {
      // Idempotency Check: only send if client_notified_at is null
      if (!task.client_notified_at) {
        const appUrl =
          process.env.APP_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          'http://localhost:3000';
        const clientEmail = task.clients.profiles.email;
        const clientDisplayName =
          task.clients.display_name ||
          task.clients.company_name ||
          task.clients.profiles.full_name;

        const emailHtml = generateJobCompletedEmailHtml({
          clientName: clientDisplayName,
          taskTitle: task.title,
          taskId: task.id,
          appUrl,
        });

        const emailResult = await sendEmail({
          to: clientEmail,
          subject: `Deliverable Completed: ${task.title}`,
          html: emailHtml,
        });

        if (emailResult.success) {
          notified = true;
          // Set client_notified_at only on successful send
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('tasks') as any)
            .update({ client_notified_at: new Date().toISOString() })
            .eq('id', taskId);
        } else {
          console.warn(
            `Failed to send completion email for task ${taskId}:`,
            emailResult.error,
          );
        }
      } else {
        notified = true; // Already notified previously
      }
    }

    revalidatePath('/admin/dashboard');
    return { success: true, data: { status: 'completed', notified } };
  } catch (err) {
    console.error('Unexpected error in completeTask:', err);
    return { success: false, error: 'Failed to complete task' };
  }
}

export async function toggleTaskStatus(
  taskId: string,
  currentStatus: string,
): Promise<ActionResponse<{ status: string }>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const nextStatus: Database['public']['Tables']['tasks']['Row']['status'] =
      currentStatus.toLowerCase() === 'completed' ? 'pending' : 'completed';

    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
      updated_at: nowIso,
    };

    if (nextStatus === 'completed') {
      updatePayload.completed_at = nowIso;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('tasks') as any)
      .update(updatePayload)
      .eq('id', taskId);

    if (error) {
      console.error('Error toggling task status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    return { success: true, data: { status: nextStatus } };
  } catch (err) {
    console.error('Unexpected error in toggleTaskStatus:', err);
    return { success: false, error: 'Failed to update task status' };
  }
}

export async function archiveCompletedTasks(): Promise<
  ActionResponse<{ archivedCount: number }>
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify admin role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as {
      role: Database['public']['Tables']['profiles']['Row']['role'];
    } | null;

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('tasks') as any)
      .update({ archived: true })
      .eq('status', 'completed')
      .eq('archived', false)
      .select('id');

    if (error) {
      console.error('Error archiving completed tasks:', error);
      return { success: false, error: error.message };
    }

    const archivedCount = data ? (data as unknown[]).length : 0;
    revalidatePath('/admin/dashboard');
    return { success: true, data: { archivedCount } };
  } catch (err) {
    console.error('Unexpected error in archiveCompletedTasks:', err);
    return { success: false, error: 'Failed to clear completed tasks' };
  }
}

export async function archiveTask(
  taskId: string,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify admin role
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('tasks') as any)
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('Error archiving task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/dashboard');
    return { success: true, data: { id: taskId } };
  } catch (err) {
    console.error('Unexpected error in archiveTask:', err);
    return { success: false, error: 'Failed to archive task' };
  }
}
