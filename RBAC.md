# RBAC.md — Admin/Client Permissions and Access Rules

This is the single source of truth for "who can do what." When in doubt, this document + `DATABASE.md` §RLS govern behavior — the UI must never be the only thing enforcing a rule stated here.

## Roles

- `admin` — exactly one active user in MVP.
- `client` — many users, each tied to exactly one `clients` row.

## Permission Matrix

| Action                                                              | Admin                         | Client                               |
| ------------------------------------------------------------------- | ----------------------------- | ------------------------------------ |
| View all tasks (any category/client)                                | ✅                            | ❌                                   |
| View own completed tasks, including archived delivered-work history | ✅ (as subset)                | ✅                                   |
| View own pending/in-progress tasks                                  | ✅                            | ❌ (MVP decision — see `PRODUCT.md`) |
| View another client's tasks                                         | ✅ (as Admin, sees all)       | ❌ never                             |
| Create task                                                         | ✅                            | ❌                                   |
| Edit task (any field, including Project Link)                       | ✅                            | ❌                                   |
| Mark task complete                                                  | ✅                            | ❌                                   |
| Delete/archive task                                                 | ✅                            | ❌                                   |
| Bulk "clear completed"                                              | ✅                            | ❌                                   |
| Upload task deliverable attachments                                 | ✅                            | ❌                                   |
| View/Download attachments on own completed tasks (signed URLs)      | ✅                            | ✅                                   |
| View/Download attachments on pending tasks                          | ✅                            | ❌                                   |
| View/Download another client's attachments                          | ✅ (as Admin, sees all)       | ❌ never                             |
| Delete task deliverable attachments                                 | ✅                            | ❌                                   |
| Comment on a task                                                   | ✅ (reply)                    | ✅ (only on own completed tasks)     |
| View comments on a task                                             | ✅ (all)                      | ✅ (only own task's comments)        |
| Edit/delete a comment                                               | ❌                            | ❌ (comments immutable in MVP)       |
| Create/manage client accounts                                       | ✅                            | ❌                                   |
| Deactivate a client account                                         | ✅                            | ❌                                   |
| Access Settings (categories, notification prefs)                    | ✅                            | ❌                                   |
| Receive "task completed" email                                      | n/a                           | ✅ (for own tasks)                   |
| Receive "comment submitted" email                                   | ✅ (for any client's comment) | ❌                                   |

## Enforcement Layers (defense in depth)

1. **Middleware** — redirects based on `profiles.role` before a mismatched-role request even reaches page code. E.g., a Client hitting `/dashboard` is redirected to `/my-jobs`.
2. **Server Actions** — every action re-checks role server-side (`current_role()` equivalent) before performing a mutation. Never trust a role claim passed from the client.
3. **RLS (Postgres)** — the actual, unbypassable boundary. Even if middleware or a Server Action had a bug, RLS policies in `DATABASE.md` prevent a Client's session from reading/writing rows outside their scope. **This is the layer that must never be weakened, disabled "temporarily," or bypassed for convenience.**

## Client Visibility Rule (restated precisely)

A Client may see a task **if and only if**:

```
task.client_id == current_user's client.id
AND task.status == 'completed'
```

The task's `archived` value does **not** remove Client access. `archived` is an Admin-side organizational flag used to hide old completed tasks from the Admin's default active-task view while preserving the Client's delivered-work history.

No other condition grants visibility. If a new feature seems to require broader Client visibility (e.g., showing Pending tasks), that is a product decision — flag it, don't implement it unilaterally, and update this file plus the RLS policy in the same change.

## Comment Authorship Rule

A Client may insert a comment **if and only if**:

```
comment.author_id == current_user.id
AND comment.task_id references a task where task.client_id == current_user's client.id
AND that task.status == 'completed'
```

## Admin Scope

Admin has unrestricted read/write on `tasks`, `comments`, `clients`. There is no partial-admin or sub-role in MVP. If multi-admin is added later (see `PRODUCT.md` non-goals), this file must be revised before implementation — do not assume all admins should have identical access without re-confirming.

## Testing Requirement

Every PR touching `tasks`, `comments`, `clients`, or `profiles` queries must include or update a test (see `TESTING.md`) that attempts a cross-client read/write and asserts it is rejected. This is not optional — it is the core trust guarantee of the product.

For task visibility changes, tests must also confirm that:

- a Client can still read their own completed task after it is archived; and
- a Client still cannot read another Client's archived completed task.
