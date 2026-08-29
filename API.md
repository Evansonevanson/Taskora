# API.md — Server Actions and Expected Behavior

Taskora uses Next.js **Server Actions** as its primary API surface. Each action runs server-side, derives and validates the authenticated user's workspace context, enforces rate limiting, and executes through the session-scoped Supabase client (so RLS is strictly enforced) — never the service-role client, except for administrative user provisioning.

## Conventions

- **Server-Side Workspace Context:** Every mutation and query resolves the user's active workspace membership (`public.workspace_members`) server-side. Never trust an unverified `workspace_id` passed from the client bundle.
- **Input Validation:** All inputs are validated with shared Zod schemas (in `/lib/validation`).
- **Discriminated Results:** All actions return `{ success: true, data }` or `{ success: false, error: string }`.

---

## Auth Actions

### `registerOwner(input)`

- Input: `fullName`, `email`, `workspaceName`, `password`, `confirmPassword`.
- Validates: `signupSchema` (email, names >= 2 chars, password >= 10 chars, password match).
- Rate limited: 5 attempts / 1 hour per (email + IP).
- Flow: Creates Auth user, calls transactional RPC `create_workspace_for_owner` to provision profile, workspace, and owner membership atomically.
- Returns `{ success: true, data: { requiresVerification, redirectTo } }` or `{ success: false, error: string }`.

### `loginUser(input)`

- Rate limited: 5 attempts / 15 min per (email + IP).
- On success: establishes session, returns role and redirect target.
- On failure: generic error, no user-enumeration hints.

### `requestPasswordReset(input)`

- Rate limited: 3 requests / hour per email.
- Returns generic success message regardless of whether the email exists.

---

## Task Actions (Workspace Admin / Owner)

### `createTask(input)`

- Resolves active `workspace_id` from user's `workspace_members` record.
- Validates: `title`, `category`, `client_id` (required if `category === 'work'` and must belong to same workspace), `priority`, `project_url` (optional safe http/https link).
- Rate limited: 30 creates / 10 min.
- Inserts row with `workspace_id` and `created_by = current user.id`.

### `updateTask(id, patch)`

- Validates task belongs to the user's active workspace.
- If `status` transitions to `completed`: sets `completed_at = now()`.
- Dispatches `notifyClientTaskCompleted(id)` if confirmed.

### `archiveTask(id)` / `clearCompletedTasks()`

- Scoped strictly to `workspace_id`. Sets `archived = true`.

---

## Client Actions (Workspace Admin / Owner)

### `createClient(input)`

- Resolves active `workspace_id` from user's `workspace_members` record.
- Rate limited: 20 creations / hour per admin.
- Creates auth user via service-role client.
- Atomically creates `profiles`, `clients`, and `workspace_members` (`role = 'client'`) records bound to the inviting workspace.
- Sends welcome/invitation email.

### `updateClient(id, patch)` / `toggleClientStatus(id, active)`

- Validates client record belongs to the caller's active workspace before mutating.

---

## Deliverable & Attachment Actions

### `uploadTaskAttachment(taskId, formData)` (Workspace Admin)

- Validates `taskId` belongs to caller's active workspace.
- Validates MIME type and max size (<= 20MB).
- Uploads to `workspaces/{workspace_id}/tasks/{task_id}/{attachment_id}-{sanitized_file_name}` in private bucket `task-deliverables`.
- Inserts metadata row with `workspace_id` and `uploaded_by`.

### `deleteTaskAttachment(attachmentId)` (Workspace Admin)

- Validates attachment belongs to caller's active workspace.
- Removes storage object and deletes database metadata row.

### `getAttachmentSignedUrl(attachmentId)` (Admin & Client)

- **Admin:** Verifies attachment belongs to a workspace the admin manages.
- **Client:** Verifies attachment belongs to their own completed task.
- Generates 300s TTL signed URL.

---

## Comment Actions

### `createComment(input)`

- **Client:** Validates task belongs to their workspace, is assigned to them, and is completed. Automatically sets `tasks.needs_revision = true`.
- **Admin:** Validates task belongs to their active workspace.
- Inserts comment record.
