# BUILD-PLAN.md — Taskora Implementation Tracker

This file defines the implementation order for Taskora.

Agents must follow this plan in sequence unless the human explicitly instructs otherwise.

A phase is not complete until its checkpoint passes.

Security, RBAC, database, and testing rules in the core documentation always override convenience or implementation speed.

---

## Phase 0 — Project Foundation

### 0.1 Initialize the Application

- [ ] Create the Next.js App Router project.
- [ ] Use `pnpm`.
- [ ] Enable TypeScript strict mode.
- [ ] Install Tailwind CSS.
- [ ] Install shadcn/ui.
- [ ] Install `lucide-react`.
- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [ ] Confirm the exact installed dependency versions match `TECH-STACK.md`.
- [ ] Commit `pnpm-lock.yaml`.

### 0.2 Base Folder Structure

Create the initial structure:

```text
/app
/components
/lib
/docs
/supabase
/tests
```

Inside `/lib`, prepare the intended domains:

```text
/lib/actions
/lib/email
/lib/rate-limit
/lib/supabase
/lib/validation
```

### 0.3 Environment Configuration

Prepare environment variable names from `TECH-STACK.md`:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
APP_URL
```

Rules:

- [ ] No real secrets committed.
- [ ] `.env.local` is gitignored.
- [ ] Server-only variables never appear in client-rendered code.

### Phase 0 Checkpoint

- [ ] `pnpm dev` starts successfully.
- [ ] `pnpm lint` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm-lock.yaml` is committed.
- [ ] No secret values exist in committed files.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 1 — Supabase and Database

### 1.1 Supabase Client Setup

- [ ] Configure the browser Supabase client.
- [ ] Configure the server Supabase client.
- [ ] Configure `@supabase/ssr`.
- [ ] Configure middleware session refresh.
- [ ] Ensure the service-role client exists only in an explicitly server-only path.

### 1.2 Create Core Tables

Create versioned migrations for:

- [ ] `profiles`
- [ ] `clients`
- [ ] `tasks`
- [ ] `comments`

The `tasks` table must include:

- [ ] `title`
- [ ] `category`
- [ ] `client_id`
- [ ] `priority`
- [ ] `due_date`
- [ ] `status`
- [ ] `needs_revision`
- [ ] `notes`
- [ ] `archived`
- [ ] `created_by`
- [ ] `created_at`
- [ ] `updated_at`
- [ ] `completed_at`
- [ ] `client_notified_at`

### 1.3 Constraints and Indexes

- [ ] Add the Work-task client constraint.
- [ ] Add documented indexes.
- [ ] Add timestamp behavior.
- [ ] Confirm foreign-key relationships match `DATABASE.md`.

### 1.4 Row-Level Security

- [ ] Enable RLS on every application table from creation.
- [ ] Add `current_role()`.
- [ ] Add `current_client_id()`.
- [ ] Add Admin policies.
- [ ] Add Client policies.
- [ ] Confirm archived Completed tasks remain visible to the assigned Client.
- [ ] Confirm archived tasks remain hidden from other Clients.

### 1.5 Access-Control Integration Tests

Add tests proving:

- [ ] Client A cannot read Client B's tasks.
- [ ] Client cannot read Pending tasks, including their own.
- [ ] Client cannot insert/update/delete tasks.
- [ ] Client cannot comment on another Client's task.
- [ ] Client cannot comment on their own Pending task.
- [ ] Client can read their own archived Completed task.
- [ ] Client cannot read another Client's archived Completed task.
- [ ] Admin can read/write across all Clients.

### Phase 1 Checkpoint

- [ ] All migrations apply cleanly to local/test Supabase.
- [ ] RLS is enabled on all required tables.
- [ ] Mandatory access-control tests pass.
- [ ] No production schema was hand-edited outside migrations.
- [ ] `DATABASE.md`, `RBAC.md`, and `CURRENT-STATE.md` match the implemented behavior.

---

## Phase 2 — Authentication and Route Protection

### 2.1 Login

Build:

- [ ] `/login`
- [ ] email/password form
- [ ] shared Zod validation
- [ ] server-side login action
- [ ] login rate limiting
- [ ] generic invalid-credentials response

### 2.2 Role Redirects

On successful login:

- [ ] Admin → `/dashboard`
- [ ] Client → `/my-jobs`

### 2.3 Protected Routes

Middleware must enforce:

- [ ] unauthenticated Admin/Client request → `/login`
- [ ] Client hitting Admin route → `/my-jobs`
- [ ] Admin hitting Client route → `/dashboard`
- [ ] deactivated Client → forced sign-out and denial

### 2.4 Password Reset

Build:

- [ ] `/forgot-password`
- [ ] `/reset-password`
- [ ] reset rate limiting
- [ ] generic reset request messaging

### 2.5 Unauthorized Resource Behavior

- [ ] Unauthorized task/client id renders not-found behavior.
- [ ] Never reveal existence with a 403 for resources the Client cannot access.

### Phase 2 Checkpoint

- [ ] Admin login works.
- [ ] Client login works.
- [ ] Role redirects work.
- [ ] Deactivated Client is denied immediately.
- [ ] Password reset flow works in test/staging.
- [ ] Auth tests pass.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 3 — Design System and Application Shell

### 3.1 Design Tokens

Implement `DESIGN-SYSTEM.md` as CSS variables / Tailwind tokens:

- [ ] primary
- [ ] primary hover
- [ ] background
- [ ] surface
- [ ] border
- [ ] text primary
- [ ] text secondary
- [ ] success
- [ ] warning
- [ ] danger
- [ ] info

### 3.2 Typography and Spacing

- [ ] Inter or approved system fallback.
- [ ] Page title scale.
- [ ] Section heading scale.
- [ ] Body scale.
- [ ] Metadata scale.
- [ ] Stat number scale.
- [ ] Consistent spacing.

### 3.3 Shared Components

Implement themed primitives for:

- [ ] Button
- [ ] Badge
- [ ] Card
- [ ] Dialog
- [ ] Select
- [ ] Progress
- [ ] Toast / inline alert
- [ ] Loading skeleton
- [ ] Empty state

### 3.4 Admin Shell

- [ ] Dashboard navigation.
- [ ] Clients navigation.
- [ ] Settings navigation.
- [ ] Logout/account control.

### 3.5 Client Shell

- [ ] My Jobs navigation.
- [ ] Logout/account control.
- [ ] Simpler, quieter layout than Admin.

### Phase 3 Checkpoint

- [ ] Responsive behavior verified.
- [ ] Keyboard navigation works.
- [ ] Modal focus trapping works.
- [ ] Color is never the only status signal.
- [ ] WCAG AA contrast minimum is met.
- [ ] UI follows `DESIGN-SYSTEM.md` and `UI-UX.md`.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 4 — Admin Dashboard

### 4.1 Stat Cards

Implement:

- [ ] Total tasks
- [ ] Pending
- [ ] Completed
- [ ] High Priority

Rules:

- [ ] Counts use non-archived Admin active tasks.
- [ ] Counts update after task mutations.

### 4.2 Progress Bar

- [ ] Calculate `completed / total * 100`.
- [ ] Use non-archived Admin active tasks.
- [ ] Handle zero-task state safely.

### 4.3 Task List

Display:

- [ ] title
- [ ] category
- [ ] client name when Work
- [ ] priority
- [ ] due date
- [ ] status

### 4.4 Search

- [ ] case-insensitive
- [ ] title matching
- [ ] optional notes matching
- [ ] approximately 250 ms debounce

### 4.5 Filters

- [ ] All
- [ ] Pending
- [ ] Completed
- [ ] High Priority

### 4.6 Sorting

- [ ] Newest
- [ ] Oldest
- [ ] Due Date
- [ ] Priority

### 4.7 Clear Completed Control

- [ ] visible near filters
- [ ] confirmation dialog
- [ ] show number of tasks to archive

### Phase 4 Checkpoint

- [ ] Search, filter, and sort combine correctly.
- [ ] Dashboard stats update correctly.
- [ ] Archived tasks do not appear in the default Admin list.
- [ ] Loading, empty, and error states exist.
- [ ] Unit/component tests pass.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 5 — Task Management

### 5.1 Create Task

Build New Task modal with:

- [ ] title
- [ ] category
- [ ] client dropdown when category = Work
- [ ] priority segmented control
- [ ] due-date picker
- [ ] expandable notes

Validation:

- [ ] title required
- [ ] valid category
- [ ] valid priority
- [ ] Work requires Client

### 5.2 Edit Task

- [ ] edit all allowed fields
- [ ] do not expose system-owned fields for editing
- [ ] use the same shared validation schema

### 5.3 Mark Complete

- [ ] transition Pending → Completed
- [ ] set `completed_at`
- [ ] show notify-client control for Client-assigned Work tasks
- [ ] do not set `client_notified_at` merely because completion occurred

### 5.4 Archive Individual Task

- [ ] confirmation required
- [ ] set `archived = true`
- [ ] never hard-delete

### 5.5 Clear Completed

- [ ] archive eligible Completed tasks
- [ ] do not hard-delete
- [ ] exclude archived tasks from Admin default list/counts
- [ ] preserve Client access to assigned Completed history

### Phase 5 Checkpoint

- [ ] Work task without Client is rejected client-side.
- [ ] Work task without Client is rejected server-side/database-side.
- [ ] Completed task appears in Completed filter.
- [ ] Archived completed Work task remains visible to assigned Client.
- [ ] No Client can see another Client's archived task.
- [ ] Task tests pass.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 6 — Client Management

### 6.1 Client List

Display:

- [ ] display name
- [ ] company name
- [ ] active status
- [ ] task count

### 6.2 Create Client

Admin-only flow:

- [ ] validate input
- [ ] create Supabase Auth account
- [ ] create `profiles` row
- [ ] create `clients` row
- [ ] send invite/setup email
- [ ] never expose service-role key to client code

### 6.3 Client Detail

Display:

- [ ] client metadata
- [ ] all tasks for that Client
- [ ] Client-specific total
- [ ] Client-specific completed count

### 6.4 Deactivate Client

- [ ] confirmation required
- [ ] set `active = false`
- [ ] preserve historical data
- [ ] deny already-open Client session on subsequent protected request

### Phase 6 Checkpoint

- [ ] No public signup exists.
- [ ] Client provisioning works.
- [ ] Duplicate Client email is rejected cleanly.
- [ ] Deactivation blocks Client access.
- [ ] Client management tests pass.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 7 — Client Portal

### 7.1 My Jobs

Display only:

- [ ] tasks assigned to the authenticated Client
- [ ] Completed tasks
- [ ] archived Completed delivery history

Never display:

- [ ] Pending tasks
- [ ] other Clients' tasks
- [ ] Admin-only internal data

### 7.2 Job Cards

Show:

- [ ] title
- [ ] completed date
- [ ] revision/input indicator if appropriate

### 7.3 Job Detail

Show:

- [ ] title
- [ ] notes/deliverable information
- [ ] due date
- [ ] completed date
- [ ] comment thread
- [ ] always-visible comment/correction box

### Phase 7 Checkpoint

- [ ] Client can access own Completed task.
- [ ] Client can access own archived Completed task.
- [ ] Client cannot access own Pending task.
- [ ] Client cannot access another Client's task by edited URL.
- [ ] Unauthorized resource behaves as not found.
- [ ] Client portal E2E tests pass.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 8 — Comments and Revision Flow

### 8.1 Client Comment

On Client submission:

- [ ] validate body
- [ ] verify task ownership
- [ ] verify task is Completed
- [ ] insert immutable comment
- [ ] set `needs_revision = true`
- [ ] enforce comment rate limit

### 8.2 Admin Reply

- [ ] Admin can reply to any task thread.
- [ ] Admin reply does not clear `needs_revision`.

### 8.3 Resolve Revision

- [ ] Admin-only action.
- [ ] set `needs_revision = false`.

### Phase 8 Checkpoint

- [ ] Client cannot comment on another Client's task.
- [ ] Client cannot comment on Pending task.
- [ ] Comment cannot be edited/deleted.
- [ ] `needs_revision` behavior matches docs.
- [ ] Comment tests pass.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 9 — Email Notifications

### 9.1 Completion Email

When Admin completes a Client-assigned Work task and confirms notification:

- [ ] verify `client_notified_at IS NULL`
- [ ] send Client email
- [ ] include task title
- [ ] include authenticated deep link
- [ ] on success set `client_notified_at = now()`
- [ ] on failure leave `client_notified_at = NULL`
- [ ] repeated/double-submit request must not send a duplicate email

### 9.2 Comment Email

When Client successfully comments:

- [ ] email Admin
- [ ] include Client display name
- [ ] include task title
- [ ] include approximately first 150 characters of comment
- [ ] include Admin deep link
- [ ] send once per distinct comment

### 9.3 Failure Handling

- [ ] Email failure never rolls back the task/comment database mutation.
- [ ] Email failure is logged server-side.
- [ ] Automated tests use mocked Resend.
- [ ] Real Resend is only used in manual staging smoke tests.

### Phase 9 Checkpoint

- [ ] Completion email sends exactly once.
- [ ] `client_notified_at` behaves correctly.
- [ ] Client-comment email sends exactly once per comment.
- [ ] Failure behavior matches `API.md`.
- [ ] Email tests pass.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 10 — Settings

### 10.1 Category Management

- [ ] Admin can manage allowed categories beyond defaults.
- [ ] Client cannot access settings.

### 10.2 Notification Preference

- [ ] Admin can set whether notify-client defaults checked or unchecked.

### Phase 10 Checkpoint

- [ ] Settings persist.
- [ ] Settings are Admin-only.
- [ ] Validation is enforced.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 11 — Full Test and QA Pass

### 11.1 Unit Tests

Verify:

- [ ] validation
- [ ] sorting
- [ ] filtering
- [ ] progress percentage
- [ ] email payload builders
- [ ] relevant utilities

### 11.2 Component Tests

Verify:

- [ ] stat cards
- [ ] task cards
- [ ] filter controls
- [ ] forms
- [ ] comment box
- [ ] confirmation dialogs

### 11.3 Integration Tests

Verify:

- [ ] Server Actions
- [ ] Supabase queries
- [ ] all RLS access boundaries
- [ ] deactivated Client denial
- [ ] archive visibility behavior

### 11.4 E2E Tests

Critical journey:

1. [ ] Admin logs in.
2. [ ] Admin creates Client.
3. [ ] Admin creates Work task.
4. [ ] Admin marks task Complete.
5. [ ] Client logs in.
6. [ ] Client sees delivered task.
7. [ ] Client comments.
8. [ ] Admin sees `needs_revision`.
9. [ ] Admin replies.
10. [ ] Admin resolves revision.
11. [ ] Admin archives completed task.
12. [ ] Client still sees archived delivered task.

### Phase 11 Checkpoint

- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] Mandatory access-control suite passes.
- [ ] Critical Playwright journeys pass.
- [ ] Manual QA checklist is complete.
- [ ] `CURRENT-STATE.md` is updated.

---

## Phase 12 — Production Deployment

### 12.1 Infrastructure

- [ ] Production Supabase project configured.
- [ ] Production Vercel project configured.
- [ ] Production environment variables configured.
- [ ] Production Upstash configured.
- [ ] Production Resend configuration/domain verified.

### 12.2 Database

- [ ] Production migrations applied.
- [ ] RLS verified after migration.
- [ ] No direct schema drift exists.

### 12.3 Smoke Tests

Verify in production/staging:

- [ ] Admin login
- [ ] Client login
- [ ] Client isolation
- [ ] task creation
- [ ] completion
- [ ] email delivery
- [ ] Client comment
- [ ] archive behavior
- [ ] deactivation
- [ ] mobile responsiveness

### Final Launch Checkpoint

- [ ] Zero cross-client data leakage.
- [ ] No exposed service-role or Resend secrets.
- [ ] Email triggers verified.
- [ ] Access-control tests pass.
- [ ] Production build healthy.
- [ ] `CURRENT-STATE.md` updated to launch status.

---

# Phase 2 / Future Features

Do not implement these during MVP unless explicitly requested:

- Client Approve button
- File/image attachments
- In-app notification bell
- Distinct Needs Changes status
- Recurring tasks
- Multi-admin/team seats
- Client mini dashboard
- Dark mode
- Full audit log
- Magic-link login
- Payments/invoicing
- Real-time chat
- Native mobile app
- Client self-registration

See `FEATURES.md` and `PRODUCT.md` for the authoritative scope.
