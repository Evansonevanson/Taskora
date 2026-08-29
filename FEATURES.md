# FEATURES.md — Complete Feature Specification

Scope markers: **[MVP]** must ship. **[P2]** Phase 2 — do not build unless explicitly requested.

## 1. Authentication — [MVP]

- Single `/login` page, email + password.
- Role-based redirect after login (`admin` → `/dashboard`, `client` → `/my-jobs`).
- Forgot-password flow.
- Rate-limited login attempts (see `SECURITY.md`).

## 2. Admin Dashboard — [MVP]

- **Stat cards:** Total tasks, Pending, Completed, High Priority — counts scoped to non-archived tasks, live-updating on any change.
- **Progress bar:** `completed / total * 100` (non-archived tasks), visually prominent at top of dashboard.
- **Task list:** paginated or virtualized if it grows past ~100 rows (not needed at MVP scale but don't hardcode assumptions that break past 20 rows).

## 3. Task Management — [MVP]

- **Create task:** title (required), category (required, one of General/Work/Personal/Urgent/Shopping), client dropdown (required + shown only if category = Work, populated from active clients), priority (Low/Medium/High, default Medium), due date (optional), notes (optional).
- **Edit task:** all fields editable except `created_by`/`created_at`.
- **Mark complete:** sets `status = completed`, `completed_at = now()`. Triggers the "prompt to notify client" flow (see §7) if the task has a `client_id`.
- **Delete/Archive:** "Clear completed" bulk action archives (not hard-deletes) all completed, non-flagged tasks by setting `archived = true`. Archived tasks disappear from the Admin's default task list and active dashboard counts, remain stored in the database, and remain visible to the assigned Client if they are Completed. Individual task delete also archives rather than hard-deletes, for consistency.

## 4. Sorting — [MVP]

Applies to the Admin task list (and optionally the Client's job list):

- Newest first (default) — `created_at desc`
- Oldest first — `created_at asc`
- Due date — `due_date asc nulls last`
- Priority — High → Medium → Low

## 5. Filtering & Search — [MVP]

- Filter tabs/chips: All, Pending, Completed, High Priority (these combine with sort/search, not replace them).
- Search: matches against `title` (and optionally `notes`), case-insensitive, live-filtering as the Admin types (debounced ~250ms).
- Filters and search apply client-side on the currently loaded page for MVP scale; move to server-side filtering only if task volume grows beyond a few hundred rows.

## 6. Client Management — [MVP]

- Admin-only screen: list of clients (`display_name`, `company_name`, `active` status, task count).
- Create client → provisions account per `AUTH.md`.
- Deactivate client → sets `active = false`; deactivated clients can't log in (see `AUTH.md`).
- Client detail view: all tasks for that client + mini stats (total/completed for that client only).

## 7. Email Notifications — [MVP]

- **Trigger A — Task completed:** When Admin marks a Work-category task Completed, show a confirmation prompt: "Notify [Client Name] by email?" If confirmed, send email to the client with task title and a deep link to `/my-jobs/[task_id]`.
- **Trigger B — Comment submitted:** When a Client submits a comment on a task, immediately email the Admin with the client's name, task title, a preview of the comment (first ~150 chars), and a deep link to the Admin's task detail view.
- No email digesting/batching in MVP — each event sends immediately.
- See `API.md` §Email for exact payload/idempotency handling (avoid duplicate sends on double-submit).

## 8. Client Portal — [MVP]

- **My Jobs:** list of the Client's own Completed tasks, including archived delivered-work history. Cards show title, category tag, completed date, and a `needs_revision` indicator if applicable.
- **Job Detail:** full task info (title, notes, due date, completed date) + comment thread (their own comments + any Admin replies) + a comment/correction textbox with a Send button.
- No access to any Admin-only screens, other clients, or Pending/In-Progress tasks.

**Archive visibility rule:** `archived` affects the Admin's default task-management view only. It does not remove a Client's access to their own Completed task history.

## 9. Comments — [MVP]

- Client can post a comment on their own completed task → sets `tasks.needs_revision = true` and triggers Trigger B email.
- Admin can reply on any task's comment thread (reply does not change `needs_revision`; Admin manually clears the flag once resolved, e.g., via a "Mark resolved" toggle on the task).
- Comments are immutable once posted (no edit/delete) in MVP.

## 10. Settings — [MVP, minimal]

- Manage the category list (add a new category beyond the default five) — Admin only.
- Notification preference: toggle whether the "notify client" prompt defaults to checked or unchecked on task completion.

---

## Phase 2 (not to be built without explicit request)

- Client "Approve" button that resolves `needs_revision` without requiring a comment.
- File/image attachments on tasks (deliverable previews).
- In-app notification bell (in addition to email).
- Distinct "Needs Changes" status separate from Completed (rather than a flag on Completed).
- Recurring tasks.
- Multi-admin / team seats with per-admin scoping.
- Client-side mini dashboard (their own progress bar across their tasks).
- Dark mode.
- Full audit log per task (who changed what, when).
- Magic-link login for clients.

## Explicitly Out of Scope

- Payments/invoicing.
- Real-time chat.
- Native mobile app.
- Multi-language/i18n support.
- Client self-registration.
