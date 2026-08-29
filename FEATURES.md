# FEATURES.md — Complete Feature Specification

Scope markers: **[MVP]** must ship. **[P2]** Phase 2 — do not build unless explicitly requested.

## 1. Authentication — [MVP]

- Single `/login` page, email + password.
- Role-based redirect after login (`admin` → `/admin/dashboard`, `client` → `/portal/jobs`).
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

- **Trigger A — Task completed:** When Admin marks a Work-category task Completed, show a confirmation prompt: "Notify [Client Name] by email?" If confirmed, send email to the client with task title and a deep link to `/portal/jobs/[task_id]`.
- **Trigger B — Comment submitted:** When a Client submits a comment on a task, immediately email the Admin with the client's name, task title, a preview of the comment (first ~150 chars), and a deep link to the Admin's task detail view.
- No email digesting/batching in MVP — each event sends immediately.
- See `API.md` §Email for exact payload/idempotency handling (avoid duplicate sends on double-submit).

## 8. Client Portal — [MVP]

- **My Jobs:** list of the Client's own Completed tasks (`/portal/jobs`), including archived delivered-work history. Cards show title, category tag, completed date, and a `needs_revision` indicator if applicable.
- **Job Detail:** full task info (title, notes, due date, completed date) + comment thread (their own comments + any Admin replies) + a comment/correction textbox with a Send button.
- No access to any Admin-only screens, other clients, or Pending/In-Progress tasks.

**Archive visibility rule:** `archived` affects the Admin's default task-management view only. It does not remove a Client's access to their own Completed task history.

## 9. Comments — [MVP]

- Client can post a comment on their own completed task → sets `tasks.needs_revision = true` and triggers Trigger B email.
- Admin can reply on any task's comment thread (reply does not change `needs_revision`; Admin manually clears the flag once resolved, e.g., via a "Mark resolved" toggle on the task).
- Comments are immutable once posted (no edit/delete) in MVP.

## 10. Settings — [MVP]

- Manage the category list (add a new category beyond the default five) — Admin only.
- Configure notification preferences (default notify client, confirm before completion).

## 11. Deliverables & Project Links — [MVP]

- **Project Link:** Admin can attach an optional external project URL (e.g., Figma, Google Drive, Dropbox, live sites, Behance) to a task. Server strictly validates safe `http` / `https` URLs and blocks dangerous protocols (`javascript:`, `data:`, `file:`, etc.). Rendered with secure `target="_blank" rel="noopener noreferrer"` attributes.
- **Deliverable Attachments:** Admin can upload deliverable files directly to a task using private Supabase Storage (`task-deliverables` bucket).
  - Allowed MIME types: JPG/JPEG, PNG, WEBP, PDF (max 20MB per file). Executable files are strictly rejected.
  - Dedicated `task_attachments` table stores metadata.
  - Clients can view/download deliverable attachments belonging strictly to their own **Completed** tasks.
  - Access is mediated via short-lived (300s) signed URLs generated server-side after verifying client identity, task ownership, and completed status.
  - Admin can upload, list, preview, and remove attachments (which safely cleans up both metadata and storage objects).
  - Client detail view on Completed tasks displays a dedicated "Deliverables" section with "View Project", "Preview", and "Download" actions.

## 12. Appearance & Theming — [MVP]

- **Light / Dark / System Mode:** Admin can configure device appearance in `/admin/settings` (`[ Light ]`, `[ Dark ]`, `[ System ]`).
- **Persistence:** Locally persisted under `taskora-theme` with anti-FOUC initialization script.
- **Official Branding:** Integrated official Taskora logo assets and multi-resolution favicons across all auth screens, admin views, client portals, and 404 pages.

## 13. Public Landing Page — [MVP]

- **Root Route `/` Behavior:** Public landing page for unauthenticated visitors presenting Taskora's core value proposition, live UI preview, benefits, 3-step delivery workflow, client portal demo, security isolation architecture, and appearance system.
- **Role Redirection Entrypoint:** Authenticated users hitting `/` are immediately routed to `/admin/dashboard` (Admin) or `/portal/jobs` (Client).
- **Public CTAs:** Links to `/login` for sign-in without exposing public signup or registration routes.

## 14. Multi-Tenant Workspace Foundation — [MVP]

- **Isolated Workspaces:** Every organization/business operates in its own `workspaces` boundary with membership governed by `workspace_members`.
- **Tenant Scoping:** All clients, tasks, and task attachments are strictly bound to a `workspace_id`.
- **Zero Cross-Tenant Leakage:** PostgreSQL RLS and Supabase Storage policies prevent any workspace owner or client from viewing, editing, or downloading another workspace's records or files.

## 15. Public Workspace Owner Registration — [MVP]

- **Self-Service Owner Signup:** Public `/signup` route for new freelancers and agency owners to register an account and initialize their independent workspace in an atomic transaction.
- **Form Fields:** Full name, work email, workspace/business name, password (min. 10 chars), confirm password.
- **Automatic Role Assignment:** User becomes `role = 'owner'` in `workspace_members` for their newly created workspace.
- **Unique Workspace Slug:** Collision-safe slug generated from the workspace name.
- **Strict Invariant on Clients:** Client accounts are never self-registered and remain invitation-only through `/admin/clients`.
- **Rate Limiting:** 5 signup attempts per hour per IP/email.

---

## Phase 2 (not to be built without explicit request)

- Client "Approve" button that resolves `needs_revision` without requiring a comment.
- In-app notification bell (in addition to email).
- Distinct "Needs Changes" status separate from Completed (rather than a flag on Completed).
- Recurring tasks.
- Multi-admin / team seats with per-admin scoping.
- Client-side mini dashboard (their own progress bar across their tasks).
- Full audit log per task (who changed what, when).
- Magic-link login for clients.

## Explicitly Out of Scope

- Payments/invoicing.
- Real-time chat.
- Native mobile app.
- Multi-language/i18n support.
- Client self-registration.
