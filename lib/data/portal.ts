import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface PortalClientInfo {
  id: string;
  profileId: string;
  displayName: string;
  companyName: string | null;
  email: string;
  fullName: string;
  active: boolean;
}

export interface PortalTaskItem {
  id: string;
  title: string;
  notes: string | null;
  projectUrl: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high' | string;
  status: 'completed' | string;
  dueDate: string | null;
  completedAt: string | null;
  needsRevision: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortalStats {
  totalDelivered: number;
  inRevision: number;
  completed: number;
}

export interface PortalData {
  client: PortalClientInfo;
  tasks: PortalTaskItem[];
  stats: PortalStats;
}

export async function getClientPortalData(): Promise<PortalData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch Client profile details
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select(
      `
      id,
      profile_id,
      workspace_id,
      display_name,
      company_name,
      active,
      profiles (
        email,
        full_name
      )
    `,
    )
    .eq('profile_id', user.id)
    .maybeSingle();

  if (clientError || !clientData) {
    console.error('Error fetching client portal profile:', clientError);
    return null;
  }

  type RawClientRecord = {
    id: string;
    profile_id: string;
    workspace_id: string;
    display_name: string;
    company_name: string | null;
    active: boolean;
    profiles: {
      email: string;
      full_name: string;
    } | null;
  };

  const client = clientData as unknown as RawClientRecord;

  if (!client.active) {
    return null;
  }

  // 2. Fetch Client's Completed deliverables in their workspace (including archived delivered-work)
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select(
      `
      id,
      title,
      notes,
      project_url,
      category,
      priority,
      status,
      due_date,
      completed_at,
      needs_revision,
      created_at,
      updated_at
    `,
    )
    .eq('client_id', client.id)
    .eq('workspace_id', client.workspace_id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false, nullsFirst: false });

  if (taskError) {
    console.error('Error fetching client portal deliverables:', taskError);
    return null;
  }

  type RawTaskRecord = {
    id: string;
    title: string;
    notes: string | null;
    project_url: string | null;
    category: string;
    priority: string;
    status: string;
    due_date: string | null;
    completed_at: string | null;
    needs_revision: boolean;
    created_at: string;
    updated_at: string;
  };

  const rawTasks = (taskData || []) as unknown as RawTaskRecord[];

  const tasks: PortalTaskItem[] = rawTasks.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    projectUrl: t.project_url,
    category: t.category.toLowerCase(),
    priority: t.priority.toLowerCase(),
    status: t.status.toLowerCase(),
    dueDate: t.due_date,
    completedAt: t.completed_at,
    needsRevision: t.needs_revision,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  const inRevision = tasks.filter((t) => t.needsRevision).length;
  const completed = tasks.filter((t) => !t.needsRevision).length;

  return {
    client: {
      id: client.id,
      profileId: client.profile_id,
      displayName: client.display_name,
      companyName: client.company_name,
      email: client.profiles?.email || '',
      fullName: client.profiles?.full_name || client.display_name,
      active: client.active,
    },
    tasks,
    stats: {
      totalDelivered: tasks.length,
      inRevision,
      completed,
    },
  };
}

export async function getClientPortalJobDetail(taskId: string): Promise<{
  client: PortalClientInfo;
  task: PortalTaskItem;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch Client profile
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select(
      `
      id,
      profile_id,
      workspace_id,
      display_name,
      company_name,
      active,
      profiles (
        email,
        full_name
      )
    `,
    )
    .eq('profile_id', user.id)
    .maybeSingle();

  if (clientError || !clientData) {
    return null;
  }

  type RawClientRecord = {
    id: string;
    profile_id: string;
    workspace_id: string;
    display_name: string;
    company_name: string | null;
    active: boolean;
    profiles: {
      email: string;
      full_name: string;
    } | null;
  };

  const client = clientData as unknown as RawClientRecord;

  if (!client.active) {
    return null;
  }

  // 2. Fetch specific deliverable enforcing workspace, client_id, and status = completed
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select(
      `
      id,
      title,
      notes,
      project_url,
      category,
      priority,
      status,
      due_date,
      completed_at,
      needs_revision,
      created_at,
      updated_at
    `,
    )
    .eq('id', taskId)
    .eq('workspace_id', client.workspace_id)
    .eq('client_id', client.id)
    .eq('status', 'completed')
    .maybeSingle();

  if (taskError || !taskData) {
    return null;
  }

  type RawSingleTaskRecord = {
    id: string;
    title: string;
    notes: string | null;
    project_url: string | null;
    category: string;
    priority: string;
    status: string;
    due_date: string | null;
    completed_at: string | null;
    needs_revision: boolean;
    created_at: string;
    updated_at: string;
  };

  const t = taskData as unknown as RawSingleTaskRecord;

  return {
    client: {
      id: client.id,
      profileId: client.profile_id,
      displayName: client.display_name,
      companyName: client.company_name,
      email: client.profiles?.email || '',
      fullName: client.profiles?.full_name || client.display_name,
      active: client.active,
    },
    task: {
      id: t.id,
      title: t.title,
      notes: t.notes,
      projectUrl: t.project_url,
      category: t.category.toLowerCase(),
      priority: t.priority.toLowerCase(),
      status: t.status.toLowerCase(),
      dueDate: t.due_date,
      completedAt: t.completed_at,
      needsRevision: t.needs_revision,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    },
  };
}
