import 'server-only';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export type TaskAttachment =
  Database['public']['Tables']['task_attachments']['Row'];

/**
 * Fetches attachments for a given task, respecting RLS:
 * - Admin: sees all attachments for the task.
 * - Client: sees attachments only if task belongs to client and is completed.
 */
export async function getTaskAttachments(
  taskId: string,
): Promise<TaskAttachment[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('task_attachments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching task attachments:', error);
    return [];
  }

  return (data as TaskAttachment[]) || [];
}
