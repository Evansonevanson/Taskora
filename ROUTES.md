# ROUTES.md — Every Page and Route

Framework: Next.js App Router. Two protected route groups (`app/admin`, `app/portal`) plus public auth routes. Proxy/Middleware enforces role-based access on every request (see `RBAC.md`).

## Public Routes

| Route              | Purpose                                                                                                   | Auth required    |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ---------------- |
| `/`                | Root entry: redirects authenticated users to `/admin/dashboard` or `/portal`; unauthenticated to `/login` | No               |
| `/login`           | Single login page, role-based redirect after success                                                      | No               |
| `/forgot-password` | Request password reset email                                                                              | No               |
| `/reset-password`  | Set new password from reset link (token/session exchange)                                                 | No (token-gated) |
| `/auth/callback`   | Auth callback handler for password recovery and invitation exchanges                                      | No               |

## Admin Routes — `app/admin` group

All require `role = 'admin'`. A Client hitting any of these is redirected to `/portal`.

| Route                 | Purpose                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/admin/dashboard`    | Main Admin view: stat cards, progress bar, task list with search/sort/filter, task create/edit modal dialogs   |
| `/admin/clients`      | Client management: active/deactivated client table, account provisioning dialog, temporary credentials display |
| `/admin/clients/[id]` | Client detail view: all tasks/deliverables for that client, mini stats, client edit/deactivate controls        |
| `/admin/settings`     | Category management, notification preference toggles                                                           |

## Client Portal Routes — `app/portal` group

All require `role = 'client'` and `clients.active = true`. An Admin hitting any of these is redirected to `/admin/dashboard` (Admin uses `/admin/clients/[id]` or `/admin/dashboard` instead).

| Route               | Purpose                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/portal`           | My Jobs view: list of the Client's own Completed deliverables, deliverable cards, and revision indicators           |
| `/portal/jobs/[id]` | Job detail view: deliverable info, Project Link button, file attachments (signed URLs), and feedback comment thread |

## Route Guard Behavior (Proxy / Middleware)

- **Unauthenticated request** to any Admin/Client route → redirect to `/login?next=<path>`.
- **Authenticated Admin** hitting any Client route (`/portal`, `/portal/*`) → redirect to `/admin/dashboard`.
- **Authenticated Client** hitting any Admin route (`/admin`, `/admin/*`) → redirect to `/portal`.
- **Authenticated Client with `active = false`** → force sign-out, redirect to `/login?error=deactivated` with clear notification.
- **Direct URL entry to `/portal/jobs/[id]` or `/admin/clients/[id]`** for a row the user is not authorized to see: RLS returns no row → render 404-style "not found" page without leaking record existence.

## Deep Links (for email notifications)

- `notifyClientTaskCompleted` → `${APP_URL}/portal/jobs/[taskId]`
- `notifyAdminNewComment` → `${APP_URL}/admin/dashboard` (with task edit modal context)

Both require recipient authentication; if unauthenticated, the user lands on `/login?next=...` and is redirected back post-login.

## Not Building (MVP Constraints)

- **No `/signup`**: Taskora intentionally has no public self-service signup. Client accounts are provisioned exclusively by the Admin via `/admin/clients`.
