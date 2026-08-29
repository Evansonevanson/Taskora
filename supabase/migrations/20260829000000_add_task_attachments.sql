-- ==============================================================================
-- Migration: 20260829000000_add_task_attachments.sql
-- Description: Adds project_url to tasks, creates task_attachments table,
--              sets up RLS policies, and configures private storage bucket.
-- ==============================================================================

-- 1. Add project_url to tasks
alter table public.tasks
add column if not exists project_url text;

-- 2. Create task_attachments table
create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size bigint not null,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. Performance Indexes
create index if not exists idx_task_attachments_task_id on public.task_attachments(task_id);
create index if not exists idx_task_attachments_uploaded_by on public.task_attachments(uploaded_by);

-- 4. Enable Row Level Security
alter table public.task_attachments enable row level security;

-- 5. Task Attachments RLS Policies
-- Admin full CRUD
create policy "task_attachments_admin_all_policy"
on public.task_attachments for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Client read access: only on attachments belonging to their own completed tasks
create policy "task_attachments_client_select_completed_policy"
on public.task_attachments for select
using (
  public.current_role() = 'client'
  and exists (
    select 1 from public.tasks t
    where t.id = task_attachments.task_id
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);

-- 6. Supabase Storage Bucket & Storage Object RLS Policies
-- Insert private storage bucket if not present
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-deliverables',
  'task-deliverables',
  false,
  20971520, -- 20 MB in bytes
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Storage Object Policies
create policy "admin_storage_task_deliverables_all"
on storage.objects for all
using (
  bucket_id = 'task-deliverables'
  and public.current_role() = 'admin'
)
with check (
  bucket_id = 'task-deliverables'
  and public.current_role() = 'admin'
);

create policy "client_storage_task_deliverables_select"
on storage.objects for select
using (
  bucket_id = 'task-deliverables'
  and public.current_role() = 'client'
  and exists (
    select 1 from public.task_attachments a
    join public.tasks t on t.id = a.task_id
    where a.storage_path = storage.objects.name
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);
