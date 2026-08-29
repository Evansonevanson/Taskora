import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface AdminDashboardStats {
  total: number;
  pending: number;
  completed: number;
  highPriority: number;
  percentage: number;
}

export interface AdminTaskItem {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | string;
  status: 'pending' | 'completed' | string;
  dueDate: string | null;
  notes: string | null;
  projectUrl: string | null;
  clientId: string | null;
  clientName: string | null;
  needsRevision: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export function calculateProgressPercentage(
  completed: number,
  total: number,
): number {
  if (total <= 0) return 0;
  const raw = (completed / total) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('id, status, priority, archived')
    .eq('archived', false);

  if (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      highPriority: 0,
      percentage: 0,
    };
  }

  const activeTasks = (data || []) as Array<{
    id: string;
    status: string;
    priority: string;
    archived: boolean;
  }>;
  const total = activeTasks.length;
  const completed = activeTasks.filter(
    (t) => t.status.toLowerCase() === 'completed',
  ).length;
  const pending = activeTasks.filter(
    (t) => t.status.toLowerCase() !== 'completed',
  ).length;
  const highPriority = activeTasks.filter(
    (t) =>
      t.priority.toLowerCase() === 'high' &&
      t.status.toLowerCase() !== 'completed',
  ).length;

  const percentage = calculateProgressPercentage(completed, total);

  return {
    total,
    pending,
    completed,
    highPriority,
    percentage,
  };
}

export async function getAdminTasks(): Promise<AdminTaskItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(
      `
      id,
      title,
      category,
      priority,
      status,
      due_date,
      notes,
      project_url,
      client_id,
      needs_revision,
      archived,
      created_at,
      updated_at,
      clients (
        id,
        display_name,
        company_name
      )
    `,
    )
    .eq('archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin tasks:', error);
    return [];
  }

  type TaskWithClient = {
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    due_date: string | null;
    notes: string | null;
    project_url: string | null;
    client_id: string | null;
    needs_revision: boolean;
    archived: boolean;
    created_at: string;
    updated_at: string;
    clients: {
      id: string;
      display_name: string;
      company_name: string | null;
    } | null;
  };

  const tasks = (data || []) as unknown as TaskWithClient[];

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    status: t.status,
    dueDate: t.due_date,
    notes: t.notes,
    projectUrl: t.project_url,
    clientId: t.client_id,
    clientName: t.clients?.company_name || t.clients?.display_name || null,
    needsRevision: t.needs_revision,
    archived: t.archived,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
}
