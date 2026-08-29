-- ==============================================================================
-- Migration: 20260829100000_multi_tenant_workspaces.sql
-- Description: Multi-tenant workspace architecture, backfill, workspace-scoped
--              RLS policies, privilege escalation guards, and Storage policies.
-- ==============================================================================

-- 1. Create workspaces table
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger for workspaces
create trigger trigger_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.handle_updated_at();

-- 2. Create workspace_members table
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'client')),
  created_at timestamptz not null default now(),
  constraint unique_workspace_profile unique (workspace_id, profile_id)
);

-- 3. Add workspace_id columns to clients, tasks, and task_attachments (initially nullable for backfill)
alter table public.clients
add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.tasks
add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

alter table public.task_attachments
add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

-- 4. Fail-Safe Production Backfill Block
do $$
declare
  v_initial_workspace_id uuid;
  v_admin_count integer;
  v_admin_profile_id uuid;
begin
  -- Verify existing admin profiles count for unambiguous ownership assignment
  select count(*) into v_admin_count
  from public.profiles
  where role = 'admin';

  if v_admin_count = 0 then
    raise exception 'Migration halted: No existing admin profile found in public.profiles. Cannot assign initial workspace ownership.';
  elsif v_admin_count > 1 then
    raise exception 'Migration halted: Found % admin profiles in public.profiles. Ambiguous initial workspace ownership. Resolve manually before migrating.', v_admin_count;
  end if;

  -- Locate the single established admin profile
  select id into v_admin_profile_id
  from public.profiles
  where role = 'admin'
  limit 1;

  -- Create or retrieve initial default workspace
  select id into v_initial_workspace_id
  from public.workspaces
  limit 1;

  if v_initial_workspace_id is null then
    insert into public.workspaces (name, slug)
    values ('Taskora Workspace', 'taskora-workspace')
    returning id into v_initial_workspace_id;
  end if;

  -- Assign established admin as owner of the initial workspace
  insert into public.workspace_members (workspace_id, profile_id, role)
  values (v_initial_workspace_id, v_admin_profile_id, 'owner')
  on conflict (workspace_id, profile_id) do update set role = 'owner';

  -- Backfill existing clients into workspace_members as role = 'client'
  insert into public.workspace_members (workspace_id, profile_id, role)
  select v_initial_workspace_id, c.profile_id, 'client'
  from public.clients c
  on conflict (workspace_id, profile_id) do nothing;

  -- Backfill workspace_id on clients
  update public.clients
  set workspace_id = v_initial_workspace_id
  where workspace_id is null;

  -- Backfill workspace_id on tasks
  update public.tasks
  set workspace_id = v_initial_workspace_id
  where workspace_id is null;

  -- Backfill workspace_id on task_attachments
  update public.task_attachments
  set workspace_id = v_initial_workspace_id
  where workspace_id is null;
end $$;

-- 5. Enforce NOT NULL constraints after successful backfill
alter table public.clients alter column workspace_id set not null;
alter table public.tasks alter column workspace_id set not null;
alter table public.task_attachments alter column workspace_id set not null;

-- 6. Performance Indexes
create index if not exists idx_workspaces_slug on public.workspaces(slug);
create index if not exists idx_workspace_members_workspace on public.workspace_members(workspace_id);
create index if not exists idx_workspace_members_profile on public.workspace_members(profile_id);
create index if not exists idx_clients_workspace on public.clients(workspace_id);
create index if not exists idx_tasks_workspace on public.tasks(workspace_id);
create index if not exists idx_task_attachments_workspace on public.task_attachments(workspace_id);

-- 7. Immutability Trigger for workspace_id on Existing Records
create or replace function public.enforce_immutable_workspace_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.workspace_id is not null and new.workspace_id is distinct from old.workspace_id then
    raise exception 'workspace_id is immutable on existing records';
  end if;
  return new;
end;
$$;

create trigger trigger_clients_immutable_workspace
before update on public.clients
for each row
execute function public.enforce_immutable_workspace_id();

create trigger trigger_tasks_immutable_workspace
before update on public.tasks
for each row
execute function public.enforce_immutable_workspace_id();

create trigger trigger_task_attachments_immutable_workspace
before update on public.task_attachments
for each row
execute function public.enforce_immutable_workspace_id();

create trigger trigger_workspace_members_immutable_workspace
before update on public.workspace_members
for each row
execute function public.enforce_immutable_workspace_id();

-- 8. Workspace-Aware Security Definer Helper Functions
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and profile_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and profile_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and profile_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.get_user_workspace_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from public.workspace_members where profile_id = auth.uid();
$$;

-- 9. Enable Row-Level Security on new tables
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- 10. Drop Legacy Global Admin RLS Policies
drop policy if exists "profiles_select_policy" on public.profiles;
drop policy if exists "profiles_update_own_name_policy" on public.profiles;

drop policy if exists "clients_select_policy" on public.clients;
drop policy if exists "clients_admin_insert_policy" on public.clients;
drop policy if exists "clients_admin_update_policy" on public.clients;
drop policy if exists "clients_admin_delete_policy" on public.clients;

drop policy if exists "tasks_admin_all_policy" on public.tasks;
drop policy if exists "tasks_client_select_completed_policy" on public.tasks;

drop policy if exists "comments_admin_select_policy" on public.comments;
drop policy if exists "comments_admin_insert_policy" on public.comments;
drop policy if exists "comments_client_select_policy" on public.comments;
drop policy if exists "comments_client_insert_policy" on public.comments;

drop policy if exists "task_attachments_admin_all_policy" on public.task_attachments;
drop policy if exists "task_attachments_client_select_completed_policy" on public.task_attachments;

drop policy if exists "admin_storage_task_deliverables_all" on storage.objects;
drop policy if exists "client_storage_task_deliverables_select" on storage.objects;

-- ==============================================================================
-- 11. Multi-Tenant Workspace-Scoped RLS Policies (With Privilege Escalation Guards)
-- ==============================================================================

-- --- Workspaces Policies ---
create policy "workspaces_select_policy"
on public.workspaces for select
using (public.is_workspace_member(id));

create policy "workspaces_insert_policy"
on public.workspaces for insert
with check (auth.uid() is not null);

create policy "workspaces_update_policy"
on public.workspaces for update
using (public.is_workspace_admin(id))
with check (public.is_workspace_admin(id));

create policy "workspaces_delete_policy"
on public.workspaces for delete
using (public.is_workspace_owner(id));

-- --- Workspace Members Policies (Hardened Against Privilege Escalation) ---
create policy "workspace_members_select_policy"
on public.workspace_members for select
using (public.is_workspace_member(workspace_id));

-- Insert: Owners can insert any role; Admins can only insert non-owner roles (admin or client)
create policy "workspace_members_owner_insert_policy"
on public.workspace_members for insert
with check (public.is_workspace_owner(workspace_id));

create policy "workspace_members_admin_insert_policy"
on public.workspace_members for insert
with check (
  public.is_workspace_admin(workspace_id)
  and role in ('admin', 'client')
);

-- Update: Owners can update memberships; Admins can only update non-owner rows to non-owner roles
create policy "workspace_members_owner_update_policy"
on public.workspace_members for update
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "workspace_members_admin_update_policy"
on public.workspace_members for update
using (
  public.is_workspace_admin(workspace_id)
  and role in ('admin', 'client')
)
with check (
  public.is_workspace_admin(workspace_id)
  and role in ('admin', 'client')
);

-- Delete: Admins can delete only non-owner members. Owners cannot be deleted via normal policy.
create policy "workspace_members_delete_policy"
on public.workspace_members for delete
using (
  public.is_workspace_admin(workspace_id)
  and role in ('admin', 'client')
);

-- --- Profiles Policies (Privacy Preserved: Only self or same-workspace profiles) ---
create policy "profiles_select_policy"
on public.profiles for select
using (
  id = auth.uid()
  or exists (
    select 1 from public.workspace_members m1
    join public.workspace_members m2 on m1.workspace_id = m2.workspace_id
    where m1.profile_id = auth.uid()
      and m2.profile_id = public.profiles.id
  )
);

create policy "profiles_update_own_name_policy"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- --- Clients Policies (Workspace Isolated) ---
create policy "clients_select_policy"
on public.clients for select
using (
  public.is_workspace_admin(workspace_id)
  or profile_id = auth.uid()
);

create policy "clients_admin_insert_policy"
on public.clients for insert
with check (public.is_workspace_admin(workspace_id));

create policy "clients_admin_update_policy"
on public.clients for update
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "clients_admin_delete_policy"
on public.clients for delete
using (public.is_workspace_admin(workspace_id));

-- --- Tasks Policies (Workspace Isolated) ---
create policy "tasks_admin_select_policy"
on public.tasks for select
using (public.is_workspace_admin(workspace_id));

create policy "tasks_admin_insert_policy"
on public.tasks for insert
with check (public.is_workspace_admin(workspace_id));

create policy "tasks_admin_update_policy"
on public.tasks for update
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "tasks_admin_delete_policy"
on public.tasks for delete
using (public.is_workspace_admin(workspace_id));

create policy "tasks_client_select_completed_policy"
on public.tasks for select
using (
  client_id = public.current_client_id()
  and status = 'completed'
);

-- --- Comments Policies (Workspace Isolated via task) ---
create policy "comments_admin_select_policy"
on public.comments for select
using (
  exists (
    select 1 from public.tasks t
    where t.id = comments.task_id
      and public.is_workspace_admin(t.workspace_id)
  )
);

create policy "comments_admin_insert_policy"
on public.comments for insert
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = comments.task_id
      and public.is_workspace_admin(t.workspace_id)
  )
);

create policy "comments_client_select_policy"
on public.comments for select
using (
  exists (
    select 1 from public.tasks t
    where t.id = comments.task_id
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);

create policy "comments_client_insert_policy"
on public.comments for insert
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = comments.task_id
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);

-- --- Task Attachments Policies (Workspace Isolated) ---
create policy "task_attachments_admin_select_policy"
on public.task_attachments for select
using (public.is_workspace_admin(workspace_id));

create policy "task_attachments_admin_insert_policy"
on public.task_attachments for insert
with check (public.is_workspace_admin(workspace_id));

create policy "task_attachments_admin_update_policy"
on public.task_attachments for update
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "task_attachments_admin_delete_policy"
on public.task_attachments for delete
using (public.is_workspace_admin(workspace_id));

create policy "task_attachments_client_select_completed_policy"
on public.task_attachments for select
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_attachments.task_id
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);

-- --- Storage Object Policies (Workspace Isolated) ---
create policy "admin_storage_task_deliverables_all"
on storage.objects for all
using (
  bucket_id = 'task-deliverables'
  and exists (
    select 1 from public.task_attachments a
    where a.storage_path = storage.objects.name
      and public.is_workspace_admin(a.workspace_id)
  )
)
with check (
  bucket_id = 'task-deliverables'
  and exists (
    select 1 from public.task_attachments a
    where a.storage_path = storage.objects.name
      and public.is_workspace_admin(a.workspace_id)
  )
);

create policy "client_storage_task_deliverables_select"
on storage.objects for select
using (
  bucket_id = 'task-deliverables'
  and exists (
    select 1 from public.task_attachments a
    join public.tasks t on t.id = a.task_id
    where a.storage_path = storage.objects.name
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);
