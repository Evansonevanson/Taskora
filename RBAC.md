# RBAC.md — Workspace-Scoped Permissions and Access Rules

This is the single source of truth for "who can do what." When in doubt, this document + `DATABASE.md` §RLS govern behavior — the UI must never be the only thing enforcing a rule stated here.

## Workspace Roles

Permissions in Taskora are evaluated within the context of a **Workspace** via `workspace_members`:

- `owner` — creator/owner of the workspace. Full administration of workspace settings, members, clients, tasks, attachments, and data.
- `admin` — administrator within the workspace. Full CRUD on workspace clients, tasks, deliverables, and comments.
- `client` — external client invited to the workspace. Access is restricted strictly to their own completed deliverables and discussions.

A user may belong to a workspace as an `owner`/`admin` or as a `client`. **An Admin/Owner of Workspace A has zero permissions, visibility, or access in Workspace B.**

## Permission Matrix

| Action                                                       | Workspace Admin / Owner  | Workspace Client                 | Non-Member / Cross-Tenant |
| :----------------------------------------------------------- | :----------------------- | :------------------------------- | :------------------------ |
| View tasks in own workspace                                  | ✅                       | ❌ (Only own completed tasks)    | ❌ never                  |
| View own completed tasks (including archived delivered work) | ✅ (all workspace tasks) | ✅ (own client tasks only)       | ❌ never                  |
| View pending/in-progress tasks                               | ✅                       | ❌                               | ❌ never                  |
| View another client's tasks within same workspace            | ✅                       | ❌ never                         | ❌ never                  |
| View tasks in another workspace                              | ❌ never                 | ❌ never                         | ❌ never                  |
| Create/Edit tasks in workspace                               | ✅                       | ❌                               | ❌ never                  |
| Mark task complete / Archive task                            | ✅                       | ❌                               | ❌ never                  |
| Upload task attachments to workspace                         | ✅                       | ❌                               | ❌ never                  |
| Download attachments on own completed tasks (signed URLs)    | ✅                       | ✅                               | ❌ never                  |
| Download attachments on another workspace's tasks            | ❌ never                 | ❌ never                         | ❌ never                  |
| Delete task attachments                                      | ✅                       | ❌                               | ❌ never                  |
| Comment on a task                                            | ✅ (in own workspace)    | ✅ (only on own completed tasks) | ❌ never                  |
| View comments on a task                                      | ✅ (in own workspace)    | ✅ (only own task's comments)    | ❌ never                  |
| Provision/Manage clients in workspace                        | ✅                       | ❌                               | ❌ never                  |
| Deactivate a client in workspace                             | ✅                       | ❌                               | ❌ never                  |
| Access Settings (categories, notification prefs)             | ✅                       | ❌                               | ❌ never                  |
| View profiles in other workspaces                            | ❌ never                 | ❌ never                         | ❌ never                  |

## Enforcement Layers (defense in depth)

1. **Middleware** — Enforces authentication and base role routing.
2. **Server Actions** — Every mutation and query resolves the authenticated user's workspace context and verifies workspace membership/role before executing.
3. **RLS (Postgres)** — The unbypassable database boundary. Enforces `is_workspace_admin(workspace_id)` and `workspace_members` relationships on every table and storage object.

## Client Visibility Rule

A Client may see a task **if and only if**:

```
task.client_id == current_user's client.id
AND task.workspace_id in current_user's workspace_members
AND task.status == 'completed'
```

The task's `archived` value does **not** remove Client access. `archived` is an Admin-side organizational flag to unclutter active sprint views.

## Cross-Tenant Isolation Guarantee

- **Workspace A Owner** cannot read, update, or delete Workspace B's clients, tasks, comments, attachments, or storage objects.
- **Client A** cannot read, update, or access Workspace B's tasks or deliverables.
- Knowing a UUID from another workspace (task ID, client ID, storage path) **fails unconditionally at the PostgreSQL RLS layer**.
