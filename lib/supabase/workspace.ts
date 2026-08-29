import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, WorkspaceMemberRole } from './database.types';

export interface UserWorkspaceContext {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  memberRole: WorkspaceMemberRole;
}

/**
 * Resolves the active workspace context for the authenticated user.
 * In the single-active-workspace MVP model, it resolves the user's primary
 * workspace membership from public.workspace_members joined to public.workspaces.
 */
export async function getActiveWorkspaceContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<Database, any, any>,
  userId: string,
  targetWorkspaceId?: string,
): Promise<UserWorkspaceContext | null> {
  let query = supabase
    .from('workspace_members')
    .select(
      `
      workspace_id,
      role,
      workspaces!inner (
        id,
        name,
        slug
      )
    `,
    )
    .eq('profile_id', userId);

  if (targetWorkspaceId) {
    query = query.eq('workspace_id', targetWorkspaceId);
  }

  const { data, error } = await query
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const workspace = data.workspaces as unknown as {
    id: string;
    name: string;
    slug: string;
  };

  return {
    workspaceId: data.workspace_id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug,
    memberRole: data.role as WorkspaceMemberRole,
  };
}

/**
 * Verifies that the user has admin/owner rights in their active workspace.
 */
export async function requireWorkspaceAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<Database, any, any>,
  userId: string,
  targetWorkspaceId?: string,
): Promise<UserWorkspaceContext | null> {
  const context = await getActiveWorkspaceContext(
    supabase,
    userId,
    targetWorkspaceId,
  );
  if (
    !context ||
    (context.memberRole !== 'owner' && context.memberRole !== 'admin')
  ) {
    return null;
  }
  return context;
}
