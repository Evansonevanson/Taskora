import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export interface CommentItem {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'client' | string;
  content: string;
  createdAt: string;
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

export async function getTaskComments(taskId: string): Promise<CommentItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // 1. Fetch user role
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as Pick<ProfileRow, 'role' | 'full_name'> | null;
  if (!profile) {
    return [];
  }

  // 2. Fetch task details to verify access control
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select('id, client_id, status')
    .eq('id', taskId)
    .maybeSingle();

  const task = taskData as Pick<TaskRow, 'id' | 'client_id' | 'status'> | null;
  if (taskError || !task) {
    return [];
  }

  // 3. RBAC Enforcement:
  // If user is client, task must belong to them and be status = 'completed'
  if (profile.role === 'client') {
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, active')
      .eq('profile_id', user.id)
      .maybeSingle();

    const client = clientData as Pick<ClientRow, 'id' | 'active'> | null;

    if (
      !client ||
      !client.active ||
      client.id !== task.client_id ||
      task.status !== 'completed'
    ) {
      return [];
    }
  }

  // 4. Fetch comments ordered chronologically
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select(
      `
      id,
      task_id,
      author_id,
      body,
      created_at,
      profiles (
        full_name,
        role
      )
    `,
    )
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (commentsError || !commentsData) {
    console.error('Error fetching comments:', commentsError);
    return [];
  }

  type RawCommentRecord = {
    id: string;
    task_id: string;
    author_id: string;
    body: string;
    created_at: string;
    profiles: {
      full_name: string;
      role: string;
    } | null;
  };

  const rawComments = commentsData as unknown as RawCommentRecord[];

  return rawComments.map((c) => ({
    id: c.id,
    taskId: c.task_id,
    authorId: c.author_id,
    authorName: c.profiles?.full_name || 'User',
    authorRole: c.profiles?.role || 'client',
    content: c.body,
    createdAt: c.created_at,
  }));
}
