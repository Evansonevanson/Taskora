# TESTING.md — Testing Strategy and Acceptance Criteria

## Testing Philosophy

Given the core trust promise of Taskora (clients can never see each other's data), **access-control tests are treated as more important than feature-completeness tests.** No PR touching `tasks`, `comments`, `clients`, or auth flows merges without a corresponding test proving the access boundary holds.

## Test Levels

| Level       | Tool                                                         | What it covers                                                                                                                 |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Unit        | Vitest                                                       | Validation schemas, utility functions (e.g., progress % calculation, sort/filter logic), email payload builders                |
| Component   | Vitest + React Testing Library                               | Individual UI components (task card, stat card, filter chips, comment box) in isolation                                        |
| Integration | Vitest + a test Supabase project (or local Supabase via CLI) | Server Actions against a real Postgres instance with RLS enabled — this is where access-control correctness is actually proven |
| End-to-End  | Playwright                                                   | Full user journeys: Admin creates + completes a task, Client receives notification and comments, Admin resolves revision       |

## Mandatory Access-Control & Multi-Tenant Test Suite

These tests must exist and pass before any release, and must be re-run (or extended) whenever `RBAC.md` or `DATABASE.md` policies change:

### A. Multi-Tenant Workspace Isolation Tests

1. **Workspace A Owner cannot read Workspace B data** — seed Workspace A (Owner A, Client A, Task A, Comment A, Attachment A) and Workspace B (Owner B, Client B, Task B, Comment B, Attachment B). Assert Owner A querying Workspace B's tasks, clients, comments, attachments, or storage objects returns **0 rows** and mutations are denied at DB layer.
2. **Workspace A Owner cannot update or delete Workspace B tasks/clients** — assert direct mutation on Workspace B rows fails with RLS denial.
3. **Workspace A Owner cannot generate signed URLs for Workspace B attachments** — assert signed URL request for Workspace B attachment fails with 403 / access denied.
4. **Workspace A Owner cannot see Owner B's profile** — assert cross-workspace profiles are invisible.
5. **Client in Workspace A cannot access Workspace B data** — assert cross-workspace access is completely blocked.

### B. Client Scoping & Deliverable Tests

### C. Public Owner Registration & Workspace Initialization Tests

28. **Successful Owner signup provisions profile, workspace, and owner membership** — assert atomic creation.
29. **Unique workspace slug generated with collision resolution** — assert `my-workspace-2` on duplicate name.
30. **Invalid registration payload rejected** — assert password < 10 chars, password mismatch, invalid email fail validation.
31. **Signup rate limiting enforced** — assert 5 attempts / hour limit triggers.
32. **Atomic rollback on initialization failure** — assert failure during workspace creation cleans up auth state.
33. **Newly registered Owner has 0 visibility into existing workspaces** — assert complete cross-tenant isolation.
34. **Authenticated users visiting `/signup` are redirected** — Admin → `/admin/dashboard`, Client → `/portal/jobs`.

35. **Client cannot read another client's tasks** — seed two clients in same workspace with tasks each; authenticate as Client A; assert querying Client B's task id returns no row.
36. **Client cannot read Pending tasks, even their own** — seed a Pending task for Client A; authenticate as Client A; assert it does not appear in their query results.
37. **Client cannot insert/update/delete a task** — authenticate as Client; attempt a direct task mutation; assert rejection (RLS denial).
38. **Client cannot comment on a task that isn't theirs** — authenticate as Client A; attempt to insert a comment on Client B's task; assert rejection.
39. **Client cannot comment on their own Pending task** — assert rejection (comments only allowed on Completed tasks).
40. **Deactivated client is denied access** — set `active = false`; assert both middleware redirect and RLS denial on any query.
41. **Workspace Admin can read/write across own workspace clients** — sanity check that Admin access within their own workspace still works.
42. **Direct URL access to unauthorized task/client id returns a 404-style not-found**, not a 403 revealing existence.
43. **Client can read their own archived Completed task** — seed a Completed task for Client A with `archived = true`; authenticate as Client A; assert it remains queryable/visible.
44. **Client cannot read another Client's archived Completed task** — seed an archived Completed task for Client B; authenticate as Client A; assert querying it returns no row.
45. **Client A can access attachments on own Completed task** — assert signed URL can be generated for Client A's completed task attachment.
46. **Client A cannot access Client B's attachments** — assert signed URL request / query for Client B's attachment is rejected.
47. **Client cannot access attachments on own Pending task** — assert attachment query / signed URL generation is denied while task status is pending.
48. **Client cannot upload or delete attachments** — assert direct insert/delete attempts on `task_attachments` or Storage are rejected.
49. **Unsafe Project URL schemes are rejected** — assert `javascript:`, `data:`, `file:`, etc. fail server validation.
50. **Invalid file types and oversized files (>20MB) are rejected** — assert non-whitelisted MIME types and files > 20MB are rejected.
51. **Removing attachment cleans up DB and Storage** — assert deleting attachment removes `task_attachments` row and deletes object from `task-deliverables` bucket.

## Feature Acceptance Criteria (examples — extend per feature as built)

### Task Creation

- [ ] Creating a task with `category = 'work'` and no `client_id` is rejected both client-side (Zod) and server-side (DB check constraint).
- [ ] Newly created task appears in the Admin dashboard's stat counts and task list without a manual refresh.

### Marking Complete

- [ ] Marking a Work task complete with "notify client" checked sends exactly one email (test with a mocked/stubbed Resend client — never hit the real email API in automated tests).
- [ ] After a successful completion email, `client_notified_at` is set.
- [ ] Repeating/double-submitting the completion-notification action does not send a second email while `client_notified_at` is already set.
- [ ] If the email send fails, `client_notified_at` remains `NULL` so the failure can be retried safely.
- [ ] `completed_at` is set; task disappears from "Pending" filter, appears in "Completed" filter.
- [ ] The task becomes visible to the assigned Client (integration test against RLS).

### Comments

- [ ] Client comment on a completed task sets `needs_revision = true` and triggers exactly one email to Admin (mocked in tests).
- [ ] Admin "Mark Resolved" clears `needs_revision`.

### Clear Completed

- [ ] Bulk archive sets `archived = true` on all eligible completed tasks.
- [ ] Archived tasks disappear from the Admin's default active task view.
- [ ] Archived tasks are excluded from Admin active dashboard counts.
- [ ] Archived Completed Work tasks remain queryable/visible to the relevant Client.
- [ ] Client A still cannot view Client B's archived Completed tasks.
- [ ] No hard deletion occurs.

### Rate Limiting

- [ ] 6th login attempt within 15 minutes for the same email+IP is rejected with a rate-limit message, not a normal auth error.
- [ ] 11th comment within 10 minutes from the same user is rejected.

## Mocking External Services

- **Resend:** always mocked/stubbed in unit, component, and integration tests. Only a dedicated, manually-run smoke test (not part of CI) should hit the real Resend API, using a test inbox.
- **Upstash rate limiter:** use an in-memory or local Redis substitute in tests rather than hitting production Upstash.

## CI Requirements

- All unit, component, and integration tests run on every PR.
- E2E (Playwright) tests run at minimum before merging to the main branch, ideally on every PR against a preview deployment.
- A PR that reduces coverage on any file under `/lib/supabase`, `/app/(admin)`, `/app/(client)`, or any Server Action touching `tasks`/`comments`/`clients` should be flagged for review, not auto-merged.

## Manual QA Checklist (pre-launch, one-time)

- [ ] Create two test client accounts; manually verify neither can see the other's data through any UI path, including guessed/edited URLs.
- [ ] Verify emails actually arrive (not spam-folder) for both trigger types, using the real Resend integration in a staging environment.
- [ ] Verify deactivating a client immediately locks them out of an already-open session (not just future logins).
