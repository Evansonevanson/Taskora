# API.md — Server Actions and Expected Behavior

Taskora uses Next.js **Server Actions** as its primary API surface (not a separate REST/GraphQL API). Each action below runs server-side, re-validates role/ownership, applies rate limiting where noted, and uses the session-scoped Supabase client (so RLS still applies) — never the service-role client, except where explicitly stated.

## Conventions

- All inputs validated with a shared Zod schema (defined once in `/lib/validation`, imported by both the form component and the Server Action — never trust client-side validation alone).
- All actions return a discriminated result: `{ success: true, data }` or `{ success: false, error: string }`. Never throw raw errors to the client.
- Every action logs (server-side only) the acting user's id and role for audit purposes — never log full task/comment content in plaintext logs if avoidable, to limit exposure in log aggregators.

---

## Auth Actions

### `login(email, password)`

- Rate limited: 5 attempts / 15 min per (email + IP) — see `SECURITY.md`.
- On success: establishes session, returns role for client-side redirect.
- On failure: generic error, no user-enumeration hints.

### `requestPasswordReset(email)`

- Rate limited: 3 requests / hour per email.
- Always returns a generic success message regardless of whether the email exists.

---

## Task Actions (Admin only — role checked first line of every action)

### `createTask(input)`

- Validates: `title` non-empty, `category` in enum, `client_id` required if `category === 'work'`, `priority` in enum.
- Rate limited: 30 creates / 10 min (guards against runaway scripts/misclicks, generous for legitimate use).
- Inserts row with `created_by = current admin id`.

### `updateTask(id, patch)`

- Validates ownership implicitly via RLS (Admin-scoped policy covers all rows) but still explicitly checks `current_role() === 'admin'` before calling.
- If `patch.status` transitions `pending → completed`: sets `completed_at = now()`.
- If the task has a `client_id` and the Admin confirmed the notify prompt, dispatch `notifyClientTaskCompleted(id)` after the database update succeeds.
- Completing a task must **not** set `client_notified_at`; that field is set only after the email provider successfully accepts the completion email.

### `archiveTask(id)` / `archiveCompletedTasks()`

- Sets `archived = true` on one task or on all `status = 'completed' AND archived = false` tasks respectively.
- `archiveCompletedTasks` is the "Clear completed" bulk action — requires confirmation on the client before calling (see `UI-UX.md`).

### `resolveRevision(id)`

- Sets `needs_revision = false`. Admin-only. Used after addressing a client's correction request.

---

## Client Management Actions (Admin only)

### `createClient(input)`

- Validates: `display_name` non-empty, `email` valid + unique.
- Uses the **service-role** Supabase client server-side (the one legitimate case) to call `supabase.auth.admin.createUser()` + insert `profiles`/`clients` rows in one flow.
- Sends an invite email via Supabase Auth's invite mechanism (or a custom Resend template — pick one and document it in code comments).
- Rate limited: 20 / hour (Admin-only action, generous limit mainly to catch accidental loops, not abuse).

### `deactivateClient(clientId)`

- Sets `clients.active = false`. Does not delete the account or their historical tasks/comments.

---

## Comment Actions

### `addComment(taskId, body)` — callable by Admin or Client

- Validates: `body` non-empty, reasonable max length (e.g., 2000 chars).
- **If caller is Client:** RLS + explicit server check enforce the task belongs to them and is `completed`. On success, also sets `tasks.needs_revision = true` and triggers Trigger B email (see below).
- **If caller is Admin:** no ownership restriction (Admin can reply to any task's thread); does not alter `needs_revision`.
- Rate limited: 10 comments / 10 min per user — prevents comment-spam either direction.

---

## Email Actions

Email sends are dispatched from within the relevant Server Action, after the database write succeeds (never before — avoid notifying about a state change that failed to persist).

### `notifyClientTaskCompleted(taskId)`

- Triggered only when: task has `client_id`, `status = 'completed'`, the Admin confirmed the notify prompt, and `client_notified_at IS NULL`.
- Payload: client email, task title, deep link to `${APP_URL}/my-jobs/${taskId}`.
- **Idempotency:** `tasks.client_notified_at` is the authoritative duplicate-send guard. Before sending, the action must confirm the field is `NULL`. After a successful email send, set `client_notified_at = now()`. If the email send fails, leave it `NULL` so the notification can be retried safely.
- Repeated or double-submitted notification requests must return success/no-op once `client_notified_at` is already set and must not send another email.

### `notifyAdminNewComment(commentId)`

- Triggered every time a **Client** (not Admin) successfully inserts a comment.
- Payload: Admin email, client display name, task title, first ~150 chars of comment body, deep link to `${APP_URL}/dashboard/tasks/${taskId}`.
- No idempotency concern here since each comment is a distinct row/event by nature — but ensure the action isn't called twice for the same comment id.

### Failure Handling

- If Resend's API call fails, the database mutation must **not** be rolled back — the task/comment state change is the source of truth; the email is a best-effort side effect.
- For task-completion emails, leave `client_notified_at = NULL` when the send fails so a retry remains possible.
- Log the failure server-side and consider (Phase 2) a retry queue.
- Never roll back the task/comment mutation because an email failed.

---

## Rate Limiting Summary Table

| Action                 | Limit                      |
| ---------------------- | -------------------------- |
| `login`                | 5 / 15 min per (email, IP) |
| `requestPasswordReset` | 3 / hour per email         |
| `createTask`           | 30 / 10 min per admin      |
| `createClient`         | 20 / hour per admin        |
| `addComment`           | 10 / 10 min per user       |

See `SECURITY.md` §Rate Limiting for implementation details (Upstash + `@upstash/ratelimit`).
