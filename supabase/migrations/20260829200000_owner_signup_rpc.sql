-- ==============================================================================
-- Migration: 20260829200000_owner_signup_rpc.sql
-- Description: Transactional RPC function for atomic workspace owner registration.
--              Provisions profile, generates collision-safe unique workspace slug,
--              creates workspace, and binds owner membership.
--              Execution is strictly restricted to service_role.
-- ==============================================================================

create or replace function public.create_workspace_for_owner(
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_workspace_name text,
  p_workspace_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_final_slug text;
  v_counter integer := 1;
  v_slug_candidate text;
  v_exists boolean;
begin
  -- 1. Input sanitization & validation
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  if trim(coalesce(p_full_name, '')) = '' then
    raise exception 'full_name is required';
  end if;

  if trim(coalesce(p_email, '')) = '' then
    raise exception 'email is required';
  end if;

  if trim(coalesce(p_workspace_name, '')) = '' then
    raise exception 'workspace_name is required';
  end if;

  -- Defense-in-depth: Prevent elevating existing client accounts into owners
  if exists (select 1 from public.clients where profile_id = p_user_id) then
    raise exception 'Cannot create owner workspace for an existing client profile';
  end if;

  -- Normalize base slug
  v_slug_candidate := lower(regexp_replace(trim(coalesce(p_workspace_slug, '')), '[^a-z0-9-]+', '-', 'g'));
  v_slug_candidate := regexp_replace(v_slug_candidate, '^-+|-+$', '', 'g');
  if v_slug_candidate = '' then
    v_slug_candidate := 'workspace';
  end if;

  -- 2. Collision-safe unique slug resolution
  v_final_slug := v_slug_candidate;
  loop
    select exists (
      select 1 from public.workspaces where slug = v_final_slug
    ) into v_exists;

    if not v_exists then
      exit;
    end if;

    v_counter := v_counter + 1;
    v_final_slug := v_slug_candidate || '-' || v_counter;
  end loop;

  -- 3. Upsert Profile (role='admin' for backwards compatibility, actual permission from workspace_members)
  insert into public.profiles (id, full_name, email, role)
  values (p_user_id, trim(p_full_name), lower(trim(p_email)), 'admin')
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    role = 'admin';

  -- 4. Create Workspace
  insert into public.workspaces (name, slug)
  values (trim(p_workspace_name), v_final_slug)
  returning id into v_workspace_id;

  -- 5. Create Workspace Member with role 'owner'
  insert into public.workspace_members (workspace_id, profile_id, role)
  values (v_workspace_id, p_user_id, 'owner');

  -- 6. Return created context
  return jsonb_build_object(
    'workspace_id', v_workspace_id,
    'name', trim(p_workspace_name),
    'slug', v_final_slug,
    'owner_id', p_user_id
  );
end;
$$;

-- 7. Restrict execution privileges strictly to service_role (prevent direct PostgREST RPC access)
revoke execute on function public.create_workspace_for_owner(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_workspace_for_owner(uuid, text, text, text, text) to service_role;
