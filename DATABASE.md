# DATABASE.md — Schema, Relationships, and Row-Level Security

Database: Postgres via Supabase. RLS is **mandatory** on every table below — this document defines both the schema and the exact policies. Any agent adding or modifying a table must update corresponding RLS policies in the same change.

## Multi-Tenant Entity-Relationship Overview

Taskora is architected with a multi-tenant workspace isolation model:

- Every piece of organizational data (`clients`, `tasks`, `task_attachments`) belongs to a `workspace`.
- Membership and permissions are defined by `workspace_members`, which establishes whether a user is an `owner`, `admin`, or `client` within that specific workspace.
- `comments` inherit workspace isolation through their parent `tasks.id`.
- Private storage objects in `task-deliverables` are authorized via workspace membership and task assignment.

```
auth.users (Supabase-managed)
      │ 1:1
      ▼
public.profiles ───────────────────────────────────────────┐
      │ 1:N                                                │
      ▼                                                    │
public.workspace_members ◄─── public.workspaces            │
  (role: owner | admin | client)   ▲                       │
                                   │ 1:N                   │
      ┌────────────────────────────┼───────────────────────┤
      │ 1:N                        │ 1:N                   │ 1:N
      ▼                            ▼                       ▼
public.clients               public.tasks ◄────────── (created_by: profiles.id)
      │ 1:N                        │ 1:N
      └──────────────────────────► ├─────────────────────► public.comments ───────────► public.profiles (author_id)
                                   │ 1:N
                                   └─────────────────────► public.task_attachments ──► public.profiles (uploaded_by)
```

## Tables

### `workspaces`

Represents an isolated tenant workspace (e.g. agency, freelance business).

| Column       | Type        | Constraints                     |
| ------------ | ----------- | ------------------------------- |
| `id`         | uuid        | PK, default `gen_random_uuid()` |
| `name`       | text        | not null                        |
| `slug`       | text        | not null, unique                |
| `created_at` | timestamptz | default `now()`                 |
| `updated_at` | timestamptz | default `now()`                 |

### `workspace_members`

Associates user profiles with workspaces and defines their authoritative role within that workspace.

| Column         | Type        | Constraints                                       |
| -------------- | ----------- | ------------------------------------------------- |
| `id`           | uuid        | PK, default `gen_random_uuid()`                   |
| `workspace_id` | uuid        | FK → `workspaces.id`, not null, on delete cascade |
| `profile_id`   | uuid        | FK → `profiles.id`, not null, on delete cascade   |
| `role`         | text        | `'owner' \| 'admin' \| 'client'`, not null        |
| `created_at`   | timestamptz | default `now()`                                   |

**Unique constraint:** `UNIQUE (workspace_id, profile_id)`

### `profiles`

Mirrors `auth.users`, stores user display info. One row per authenticated user. Note that workspace authorization is determined by `workspace_members.role` rather than `profiles.role`.

| Column       | Type        | Constraints                                             |
| ------------ | ----------- | ------------------------------------------------------- |
| `id`         | uuid        | PK, references `auth.users.id`                          |
| `role`       | text        | `'admin' \| 'client'`, not null (informational default) |
| `full_name`  | text        | not null                                                |
| `email`      | text        | not null, unique                                        |
| `created_at` | timestamptz | default `now()`                                         |

### `clients`

One row per client business/person within a workspace. Links a client's user `profile_id` to their metadata.

| Column         | Type        | Constraints                                       |
| -------------- | ----------- | ------------------------------------------------- |
| `id`           | uuid        | PK, default `gen_random_uuid()`                   |
| `workspace_id` | uuid        | FK → `workspaces.id`, not null, on delete cascade |
| `profile_id`   | uuid        | FK → `profiles.id`, unique, not null              |
| `display_name` | text        | not null — shown in Admin's client dropdown       |
| `company_name` | text        | nullable                                          |
| `active`       | boolean     | default `true` — deactivated clients can't log in |
| `created_at`   | timestamptz | default `now()`                                   |

### `tasks`

Core unit of work and deliverables. Scoped to a specific workspace.

| Column               | Type        | Constraints                                                                                                               |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | uuid        | PK, default `gen_random_uuid()`                                                                                           |
| `workspace_id`       | uuid        | FK → `workspaces.id`, not null, on delete cascade                                                                         |
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

**Check constraint:** `category != 'work' OR client_id IS NOT NULL` — enforces at DB level that Work tasks must have a client.

**Email idempotency:** `client_notified_at` remains `NULL` until the Client's task-completion email is successfully sent.

### `comments`

Task discussion and revision thread. Inherits workspace scoping from parent task.

| Column       | Type        | Constraints                                  |
| ------------ | ----------- | -------------------------------------------- |
| `id`         | uuid        | PK, default `gen_random_uuid()`              |
| `task_id`    | uuid        | FK → `tasks.id`, not null, on delete cascade |
| `author_id`  | uuid        | FK → `profiles.id`, not null                 |
| `body`       | text        | not null, length > 0                         |
| `created_at` | timestamptz | default `now()`                              |

### `task_attachments`

Stores metadata for files uploaded by Workspace Admins to private Supabase Storage (`task-deliverables`).

| Column         | Type        | Constraints                                                           |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `id`           | uuid        | PK, default `gen_random_uuid()`                                       |
| `workspace_id` | uuid        | FK → `workspaces.id`, not null, on delete cascade                     |
| `task_id`      | uuid        | FK → `tasks.id`, not null, on delete cascade                          |
| `file_name`    | text        | not null                                                              |
| `storage_path` | text        | not null, unique                                                      |
| `mime_type`    | text        | not null (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) |
| `file_size`    | bigint      | not null, max 20,971,520 bytes (20MB)                                 |
| `uploaded_by`  | uuid        | FK → `profiles.id`, not null                                          |
| `created_at`   | timestamptz | default `now()`                                                       |

## Indexes

- `workspaces(slug)`
- `workspace_members(workspace_id)`
- `workspace_members(profile_id)`
- `clients(workspace_id)`
- `clients(profile_id)`
- `tasks(workspace_id)`
- `tasks(client_id)`
- `tasks(status)`
- `tasks(category)`
- `tasks(due_date)`
- `tasks(archived)`
- `comments(task_id)`
- `task_attachments(workspace_id)`
- `task_attachments(task_id)`
- `task_attachments(uploaded_by)`

## Row-Level Security Helper Functions

Helper functions evaluate workspace-scoped access using `security definer` with a fixed `search_path = public`:

```sql
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and profile_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and profile_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and profile_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.get_user_workspace_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select workspace_id from public.workspace_members where profile_id = auth.uid();
$$;

create or replace function public.current_client_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.clients where profile_id = auth.uid();
$$;
```

## Row-Level Security Policies

### `workspaces`

- **Select:** Members of the workspace can select it (`public.is_workspace_member(id)`).
- **Insert:** Authenticated users creating a new workspace.
- **Update:** Workspace Owners/Admins only (`public.is_workspace_admin(id)`).
- **Delete:** Workspace Owner only (`public.is_workspace_owner(id)`).

### `workspace_members`

- **Select:** Users can select members of workspaces they belong to.
- **Insert/Update/Delete:** Workspace Owners/Admins only.

### `profiles`

- **Select:** A user can select their own profile, OR profiles of users belonging to a shared workspace (`exists (select 1 from public.workspace_members m1 join public.workspace_members m2 on m1.workspace_id = m2.workspace_id where m1.profile_id = auth.uid() and m2.profile_id = profiles.id)`).
- **Update:** Own profile only.

### `clients`

- **Select:** Workspace Admins can select clients belonging to their administered workspace (`public.is_workspace_admin(workspace_id)`); a Client can select only their own client record (`profile_id = auth.uid()`).
- **Insert/Update/Delete:** Workspace Admins only (`public.is_workspace_admin(workspace_id)`).

### `tasks`

- **Select (Admin):** `public.is_workspace_admin(workspace_id)` (scoped strictly to tasks in their workspace).
- **Select (Client):** `client_id = public.current_client_id() AND status = 'completed'` (archived completed tasks remain visible).
- **Insert/Update/Delete:** Workspace Admins only (`public.is_workspace_admin(workspace_id)`).

### `comments`

- **Select (Admin):** Comments on tasks belonging to an administered workspace (`exists (select 1 from public.tasks t where t.id = comments.task_id and public.is_workspace_admin(t.workspace_id))`).
- **Select (Client):** Comments on own completed tasks (`exists (select 1 from public.tasks t where t.id = comments.task_id and t.client_id = public.current_client_id() and t.status = 'completed')`).
- **Insert (Admin):** On tasks belonging to their workspace with `author_id = auth.uid()`.
- **Insert (Client):** On own completed tasks with `author_id = auth.uid()`.

### `task_attachments`

- **Select (Admin):** Attachments belonging to an administered workspace (`public.is_workspace_admin(workspace_id)`).
- **Select (Client):** Attachments on own completed tasks (`exists (select 1 from public.tasks t where t.id = task_attachments.task_id and t.client_id = public.current_client_id() and t.status = 'completed')`).
- **Insert/Update/Delete:** Workspace Admins only (`public.is_workspace_admin(workspace_id)`).

## Supabase Storage

### Bucket: `task-deliverables`

- **Access:** Private (`public = false`).
- **File Types Allowed:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- **Max File Size:** 20MB (`20,971,520 bytes`).
- **Storage Path Structure (New):** `workspaces/{workspace_id}/tasks/{task_id}/{attachment_id}-{sanitized_file_name}`.
- **Storage Policies:**
  - **Admin Access:** `ALL` on `storage.objects` where object path corresponds to an attachment in a workspace the admin manages:
    ```sql
    exists (
      select 1 from public.task_attachments a
      where a.storage_path = storage.objects.name
        and public.is_workspace_admin(a.workspace_id)
    )
    ```
  - **Client Access:** `SELECT` on `storage.objects` where object corresponds to an attachment on their own completed task:
    ```sql
    exists (
      select 1 from public.task_attachments a
      join public.tasks t on t.id = a.task_id
      where a.storage_path = storage.objects.name
        and t.client_id = public.current_client_id()
        and t.status = 'completed'
    )
    ```

## Data Retention & Backfill Strategy

During migration to the multi-tenant model:

1. An initial default workspace (`Taskora Workspace`) is created for the existing primary Admin profile.
2. The primary Admin profile is granted `owner` membership in `workspace_members`.
3. All existing `clients`, `tasks`, and `task_attachments` are backfilled with the initial `workspace_id`.
4. `workspace_members` records are created for all existing `clients` with `role = 'client'`.
5. Constraints are altered to `NOT NULL` after successful backfill, ensuring zero data loss and seamless continuity for existing production rows.
