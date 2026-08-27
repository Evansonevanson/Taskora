# ROUTES.md — Every Page and Route

Framework: Next.js App Router. Two protected route groups (`(admin)`, `(client)`) plus public auth routes. Middleware enforces role-based access on every request (see `RBAC.md`).

## Public Routes

| Route | Purpose | Auth required |
|---|---|---|
| `/login` | Single login page, role-based redirect after success | No |
| `/forgot-password` | Request password reset email | No |
| `/reset-password` | Set new password from reset link | No (token-gated) |

## Admin Routes — `(admin)` group

All require `role = 'admin'`. A Client hitting any of these is redirected to `/my-jobs`.

| Route | Purpose |
|---|---|
| `/dashboard` | Main Admin view: stat cards, progress bar, task list with search/sort/filter |
| `/tasks/new` | Create task (may be a modal over `/dashboard` rather than a dedicated route — implementation detail, but URL should still be deep-linkable for consistency) |
| `/tasks/[id]` | Task detail: edit fields, mark complete, comment thread, resolve-revision toggle |
| `/clients` | Client list: name, company, active status, task count |
| `/clients/new` | Create client (provisions account) |
| `/clients/[id]` | Client detail: all tasks for that client, mini stats |
| `/settings` | Category management, notification preference toggle |

## Client Routes — `(client)` group

All require `role = 'client'`. An Admin hitting any of these is redirected to `/dashboard` (Admin should use `/clients/[id]` to view a client's tasks instead of impersonating the client route).

| Route | Purpose |
|---|---|
| `/my-jobs` | List of the Client's own Completed, non-archived tasks |
| `/my-jobs/[id]` | Job detail: task info, comment thread, comment/correction box |

## Route Guard Behavior (middleware)

- Unauthenticated request to any Admin/Client route → redirect to `/login`.
- Authenticated Admin hitting a Client route → redirect to `/dashboard`.
- Authenticated Client hitting an Admin route → redirect to `/my-jobs`.
- Authenticated but `clients.active = false` → force sign-out, redirect to `/login` with a "deactivated" message (see `AUTH.md`).
- Direct URL entry to `/tasks/[id]` or `/clients/[id]` for a row the user isn't authorized to see: RLS returns no row → render a 404-style "not found" page, **not** a 403 — avoid confirming to a Client that a given task id exists at all.

## Deep Links (for email notifications)

- `notifyClientTaskCompleted` → `${APP_URL}/my-jobs/[taskId]`
- `notifyAdminNewComment` → `${APP_URL}/tasks/[taskId]`

Both require the recipient to be logged in; if not, they hit `/login` first and should be redirected back to the intended deep link post-login (standard `?redirect=` param pattern).

## Not Building (MVP)

- No `/signup` (see `AUTH.md`).
- No public marketing/landing page — `/` can simply redirect to `/login` or `/dashboard`/`/my-jobs` based on session state.
