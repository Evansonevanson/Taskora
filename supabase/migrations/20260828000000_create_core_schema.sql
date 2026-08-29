-- ==============================================================================
-- Migration: 20260828000000_create_core_schema.sql
-- Description: Core schema, constraints, indexes, triggers, helper functions, and RLS policies
-- Tables: profiles, clients, tasks, comments
-- Dependency-safe execution order for blank database deployment
-- ==============================================================================

-- 1. Profiles Table (mirrors auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'client')),
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- 2. Clients Table
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  display_name text not null,
  company_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Tasks Table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('general', 'work', 'personal', 'urgent', 'shopping')),
  client_id uuid references public.clients(id) on delete set null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  needs_revision boolean not null default false,
  notes text,
  archived boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  client_notified_at timestamptz,
  constraint check_work_task_requires_client check (category != 'work' or client_id is not null)
);

-- 4. Comments Table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

-- 5. Updated_at Trigger for Tasks
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_tasks_updated_at
before update on public.tasks
for each row
execute function public.handle_updated_at();

-- 6. Performance Indexes
create index idx_tasks_client_id on public.tasks(client_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_category on public.tasks(category);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_archived on public.tasks(archived);
create index idx_comments_task_id on public.comments(task_id);
create index idx_clients_profile_id on public.clients(profile_id);

-- 7. Helper Functions for RLS (created after profiles and clients tables exist)
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clients where profile_id = auth.uid();
$$;

-- 8. Enable Row-Level Security on All Tables
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;

-- ==============================================================================
-- 9. Row-Level Security Policies
-- ==============================================================================

-- --- Profiles Policies ---
create policy "profiles_select_policy"
on public.profiles for select
using (
  id = auth.uid()
  or public.current_role() = 'admin'
);

create policy "profiles_update_own_name_policy"
on public.profiles for update
using (
  id = auth.uid()
  or public.current_role() = 'admin'
)
with check (
  (public.current_role() = 'admin')
  or (id = auth.uid() and role = 'client')
);

-- --- Clients Policies ---
create policy "clients_select_policy"
on public.clients for select
using (
  public.current_role() = 'admin'
  or profile_id = auth.uid()
);

create policy "clients_admin_insert_policy"
on public.clients for insert
with check (public.current_role() = 'admin');

create policy "clients_admin_update_policy"
on public.clients for update
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "clients_admin_delete_policy"
on public.clients for delete
using (public.current_role() = 'admin');

-- --- Tasks Policies ---
-- Admin full CRUD access
create policy "tasks_admin_all_policy"
on public.tasks for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Client read access: own completed tasks only (including archived delivered tasks)
create policy "tasks_client_select_completed_policy"
on public.tasks for select
using (
  public.current_role() = 'client'
  and client_id = public.current_client_id()
  and status = 'completed'
);

-- --- Comments Policies ---
-- Admin full select
create policy "comments_admin_select_policy"
on public.comments for select
using (public.current_role() = 'admin');

-- Admin insert on any task
create policy "comments_admin_insert_policy"
on public.comments for insert
with check (
  public.current_role() = 'admin'
  and author_id = auth.uid()
);

-- Client select comments on own completed tasks
create policy "comments_client_select_policy"
on public.comments for select
using (
  public.current_role() = 'client'
  and exists (
    select 1 from public.tasks t
    where t.id = comments.task_id
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);

-- Client insert comment on own completed tasks only
create policy "comments_client_insert_policy"
on public.comments for insert
with check (
  public.current_role() = 'client'
  and author_id = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = comments.task_id
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);
