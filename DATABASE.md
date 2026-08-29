# DATABASE.md — Schema, Relationships, and Row-Level Security

Database: Postgres via Supabase. RLS is **mandatory** on every table below — this document defines both the schema and the exact policies. Any agent adding a table must add corresponding RLS policies in the same change.

## Entity-Relationship Overview

```
auth.users (Supabase-managed)
      │ 1:1
      ▼
public.profiles ──────────────┐
      │ 1:1 (if role=client)  │
      ▼                       │
public.clients                │
      │ 1:N                   │
      ▼                       │
public.tasks ◄─────────────── (created_by: profiles.id, admin)
      │ 1:N
      ├────────────────────────► public.comments ───────────► public.profiles (author_id)
      │ 1:N
      └────────────────────────► public.task_attachments ──► public.profiles (uploaded_by)
```

## Tables

### `profiles`

Mirrors `auth.users`, adds role and display info. One row per authenticated user (Admin or Client).

| Column       | Type        | Constraints                     |
| ------------ | ----------- | ------------------------------- |
| `id`         | uuid        | PK, references `auth.users.id`  |
| `role`       | text        | `'admin' \| 'client'`, not null |
| `full_name`  | text        | not null                        |
| `email`      | text        | not null, unique                |
| `created_at` | timestamptz | default `now()`                 |

### `clients`

One row per client business/person. Links a `profiles` row (role=client) to their client metadata.

| Column         | Type        | Constraints                                       |
| -------------- | ----------- | ------------------------------------------------- |
| `id`           | uuid        | PK, default `gen_random_uuid()`                   |
| `profile_id`   | uuid        | FK → `profiles.id`, unique, not null              |
| `display_name` | text        | not null — shown in Admin's client dropdown       |
| `company_name` | text        | nullable                                          |
| `active`       | boolean     | default `true` — deactivated clients can't log in |
| `created_at`   | timestamptz | default `now()`                                   |

### `tasks`

| Column               | Type        | Constraints                                                                                                               |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | uuid        | PK, default `gen_random_uuid()`                                                                                           |
| `title`              | text        | not null                                                                                                                  |
| `category`           | text        | `'general' \| 'work' \| 'personal' \| 'urgent' \| 'shopping'`, not null                                                   |
| `client_id`          | uuid        | FK → `clients.id`, nullable; **required if `category = 'work'`** (enforced via check constraint + application validation) |
| `priority`           | text        | `'low' \| 'medium' \| 'high'`, not null, default `'medium'`                                                               |
| `due_date`           | date        | nullable                                                                                                                  |
| `status`             | text        | `'pending' \| 'completed'`, not null, default `'pending'`                                                                 |
| `needs_revision`     | boolean     | default `false` — set true when a client comments on a completed task                                                     |
| `notes`              | text        | nullable                                                                                                                  |
| `project_url`        | text        | nullable — validated safe http/https link to external deliverables (Figma, Drive, live site)                              |
| `archived`           | boolean     | default `false` — set true by "Clear completed" instead of hard delete                                                    |
| `created_by`         | uuid        | FK → `profiles.id` (the Admin who created it)                                                                             |
| `created_at`         | timestamptz | default `now()`                                                                                                           |
| `updated_at`         | timestamptz | default `now()`, updated via trigger                                                                                      |
| `completed_at`       | timestamptz | nullable, set when status → completed                                                                                     |
| `client_notified_at` | timestamptz | nullable, set only after the task-completion email is successfully sent to the Client                                     |

**Check constraint:** `category != 'work' OR client_id IS NOT NULL` — enforces at the DB level that Work tasks must have a client.

**Email idempotency:** `client_notified_at` remains `NULL` until the Client's task-completion email is successfully sent. After a successful send it is set to `now()`. Completion alone must not populate this field. This field is used to prevent duplicate completion emails caused by repeated or double-submitted notification requests.

### `comments`

| Column       | Type        | Constraints                                  |
| ------------ | ----------- | -------------------------------------------- |
| `id`         | uuid        | PK, default `gen_random_uuid()`              |
| `task_id`    | uuid        | FK → `tasks.id`, not null, on delete cascade |
| `author_id`  | uuid        | FK → `profiles.id`, not null                 |
| `body`       | text        | not null, length > 0                         |
| `created_at` | timestamptz | default `now()`                              |

### `task_attachments`

Stores metadata for files uploaded by Admin to private Supabase Storage (`task-deliverables`).

| Column         | Type        | Constraints                                                           |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `id`           | uuid        | PK, default `gen_random_uuid()`                                       |
| `task_id`      | uuid        | FK → `tasks.id`, not null, on delete cascade                          |
| `file_name`    | text        | not null                                                              |
| `storage_path` | text        | not null, unique                                                      |
| `mime_type`    | text        | not null (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) |
| `file_size`    | bigint      | not null, max 20,971,520 bytes (20MB)                                 |
| `uploaded_by`  | uuid        | FK → `profiles.id`, not null                                          |
| `created_at`   | timestamptz | default `now()`                                                       |

## Indexes

- `tasks(client_id)`
- `tasks(status)`
- `tasks(category)`
- `tasks(due_date)`
- `comments(task_id)`
- `task_attachments(task_id)`
- `task_attachments(uploaded_by)`

## Row-Level Security Policies

RLS is enabled on `profiles`, `clients`, `tasks`, and `comments`. All policies below assume a helper function:

```sql
create or replace function public.current_role()
returns text
language sql stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_client_id()
returns uuid
language sql stable
as $$
  select id from public.clients where profile_id = auth.uid();
$$;
```

### `profiles`

- **Select:** a user can select their own row; Admin can select all rows.
- **Update:** a user can update their own `full_name`; only Admin can change `role`.
- **Insert/Delete:** service-role only (provisioning happens server-side).

### `clients`

- **Select:** Admin can select all; a Client can select only the row matching `profile_id = auth.uid()`.
- **Insert/Update/Delete:** Admin only (`current_role() = 'admin'`).

### `tasks` — the critical table

- **Select (Admin):** `current_role() = 'admin'` → all rows.
- **Select (Client):** `current_role() = 'client' AND client_id = current_client_id() AND status = 'completed'`. The `archived` flag does **not** remove Client visibility; it only removes the task from the Admin's default active-task view so delivered-work history is preserved.
- **Insert:** Admin only.
- **Update:** Admin can update any field on any row. Client can perform **no direct updates** to `tasks` (setting `needs_revision` happens via a Server Action using the server session, validated then written using an Admin-privileged path — see `API.md`). If a future iteration allows client-side task updates (e.g., an "Approve" button), add a narrowly scoped policy then — do not broaden this preemptively.
- **Delete:** Admin only, and in practice the app should archive (`archived = true`) rather than delete.

Example policy SQL:

```sql
create policy "admin_full_access_tasks"
on public.tasks for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "client_select_own_completed_tasks"
on public.tasks for select
using (
  public.current_role() = 'client'
  and client_id = public.current_client_id()
  and status = 'completed'
);
```

### `comments`

- **Select:** Admin can select all comments. Client can select comments where the related `task.client_id = current_client_id()`.
- **Insert:** Admin can insert on any task. Client can insert only where: the task belongs to them (`client_id = current_client_id()`), the task `status = 'completed'`, and `author_id = auth.uid()` (a client can't post a comment authored as someone else).
- **Update/Delete:** not allowed for either role in MVP (comments are immutable once posted — keeps the feedback trail honest).

```sql
create policy "client_insert_own_task_comment"
on public.comments for insert
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = task_id
      and t.client_id = public.current_client_id()
      and t.status = 'completed'
  )
);
```

### `task_attachments`

- **Select:** Admin can select all attachments. Client can select only attachments where the related `task.client_id = current_client_id()` AND `task.status = 'completed'`.
- **Insert/Update/Delete:** Admin only (`current_role() = 'admin'`). Clients cannot directly insert, update, or delete attachments.

```sql
create policy "admin_all_task_attachments"
on public.task_attachments for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "client_select_own_completed_task_attachments"
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
```

## Supabase Storage

### Bucket: `task-deliverables`

- **Access:** Private (`public = false`).
- **File Types Allowed:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- **Max File Size:** 20MB (`20,971,520 bytes`).
- **Storage Path Structure:** `tasks/{task_id}/{attachment_id}-{sanitized_file_name}`.
- **Client Access Pattern:** Client never accesses files via direct public URLs. Short-lived signed URLs (300s TTL) are generated on-demand by the server only after verifying the user's Client role, task ownership, and completed task status.
- **Storage Policies:**
  - Admin: Full access (`ALL`) on `storage.objects` for bucket `task-deliverables`.
  - Client: Read access (`SELECT`) on `storage.objects` for bucket `task-deliverables` where the object path corresponds to their completed task.

## Migrations

All schema changes go through versioned SQL migration files (Supabase CLI `supabase migration new <name>`). Never hand-edit the schema directly against production. Every migration touching `tasks`, `comments`, `clients`, or `profiles` must include/update its RLS policies in the same migration file — schema and policy changes are never split across separate, out-of-sync migrations.

## Data Retention

Archived tasks (`archived = true`) are retained indefinitely in MVP; there is no hard-delete path exposed in the UI. Archiving removes completed tasks from the Admin's default active-task view, but a Client continues to see their own completed tasks even after those tasks are archived, preserving delivered-work history.
