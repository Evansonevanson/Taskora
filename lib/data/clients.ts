import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { AdminTaskItem } from './tasks';

export interface ActiveClientOption {
  id: string;
  displayName: string;
  companyName: string | null;
}

export interface ClientOverviewItem {
  id: string;
  profileId: string;
  displayName: string;
  companyName: string | null;
  email: string;
  fullName: string;
  active: boolean;
  createdAt: string;
  activeTasksCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export interface ClientDetailStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  revisionRequestedTasks: number;
}

export interface ClientDetailData {
  client: {
    id: string;
    profileId: string;
    displayName: string;
    companyName: string | null;
    email: string;
    fullName: string;
    active: boolean;
    createdAt: string;
  };
  tasks: AdminTaskItem[];
  stats: ClientDetailStats;
}

export async function getActiveClients(): Promise<ActiveClientOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('id, display_name, company_name')
    .eq('active', true)
    .order('company_name', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching active clients:', error);
    return [];
  }

  type ClientRecord = {
    id: string;
    display_name: string;
    company_name: string | null;
  };

  const records = (data || []) as unknown as ClientRecord[];

  return records.map((c) => ({
    id: c.id,
    displayName: c.display_name,
    companyName: c.company_name,
  }));
}

export async function getClientsOverview(): Promise<ClientOverviewItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('clients')
    .select(
      `
      id,
      profile_id,
      display_name,
      company_name,
      active,
      created_at,
      profiles (
        email,
        full_name
      ),
      tasks (
        id,
        status,
        archived
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients overview:', error);
    return [];
  }

  type RawClientQuery = {
    id: string;
    profile_id: string;
    display_name: string;
    company_name: string | null;
    active: boolean;
    created_at: string;
    profiles: {
      email: string;
      full_name: string;
    } | null;
    tasks: Array<{
      id: string;
      status: string;
      archived: boolean;
    }> | null;
  };

  const rawRecords = (data || []) as unknown as RawClientQuery[];

  return rawRecords.map((item) => {
    const tasks = item.tasks || [];
    const activeTasksCount = tasks.filter(
      (t) => t.status.toLowerCase() === 'pending' && !t.archived,
    ).length;
    const completedTasksCount = tasks.filter(
      (t) => t.status.toLowerCase() === 'completed',
    ).length;

    return {
      id: item.id,
      profileId: item.profile_id,
      displayName: item.display_name,
      companyName: item.company_name,
      email: item.profiles?.email || '',
      fullName: item.profiles?.full_name || item.display_name,
      active: item.active,
      createdAt: item.created_at,
      activeTasksCount,
      completedTasksCount,
      totalTasksCount: tasks.length,
    };
  });
}

export async function getClientDetail(
  clientId: string,
): Promise<ClientDetailData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch Client with Profile
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select(
      `
      id,
      profile_id,
      display_name,
      company_name,
      active,
      created_at,
      profiles (
        email,
        full_name
      )
    `,
    )
    .eq('id', clientId)
    .maybeSingle();

  if (clientError || !clientData) {
    console.error('Error fetching client details:', clientError);
    return null;
  }

  type RawClientDetail = {
    id: string;
    profile_id: string;
    display_name: string;
    company_name: string | null;
    active: boolean;
    created_at: string;
    profiles: {
      email: string;
      full_name: string;
    } | null;
  };

  const rawClient = clientData as unknown as RawClientDetail;

  // 2. Fetch Tasks assigned to this client
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select(
      `
      id,
      title,
      description,
      category,
      status,
      priority,
      due_date,
      created_at,
      updated_at,
      archived,
      needs_revision,
      client_id
    `,
    )
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (taskError) {
    console.error('Error fetching client tasks:', taskError);
    return null;
  }

  type RawTask = {
    id: string;
    title: string;
    description: string | null;
    category: string;
    status: string;
    priority: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    archived: boolean;
    needs_revision: boolean;
    client_id: string | null;
  };

  const rawTasks = (taskData || []) as unknown as RawTask[];

  const tasks: AdminTaskItem[] = rawTasks.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.description,
    category: t.category.toLowerCase(),
    status: t.status.toLowerCase(),
    priority: t.priority.toLowerCase(),
    dueDate: t.due_date,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    archived: t.archived,
    needsRevision: t.needs_revision,
    clientId: t.client_id,
    clientName: rawClient.display_name,
  }));

  const activeTasks = tasks.filter(
    (t) => t.status.toLowerCase() === 'pending' && !t.archived,
  ).length;
  const completedTasks = tasks.filter(
    (t) => t.status.toLowerCase() === 'completed',
  ).length;
  const revisionRequestedTasks = tasks.filter((t) => t.needsRevision).length;

  return {
    client: {
      id: rawClient.id,
      profileId: rawClient.profile_id,
      displayName: rawClient.display_name,
      companyName: rawClient.company_name,
      email: rawClient.profiles?.email || '',
      fullName: rawClient.profiles?.full_name || rawClient.display_name,
      active: rawClient.active,
      createdAt: rawClient.created_at,
    },
    tasks,
    stats: {
      totalTasks: tasks.length,
      activeTasks,
      completedTasks,
      revisionRequestedTasks,
    },
  };
}
