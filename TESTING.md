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

## Mandatory Access-Control Test Suite

These tests must exist and pass before any release, and must be re-run (or extended) whenever `RBAC.md` or `DATABASE.md` policies change:

1. **Client cannot read another client's tasks** — seed two clients with tasks each; authenticate as Client A; assert querying Client B's task id returns no row.
2. **Client cannot read Pending tasks, even their own** — seed a Pending task for Client A; authenticate as Client A; assert it does not appear in their query results.
3. **Client cannot insert/update/delete a task** — authenticate as Client; attempt a direct task mutation; assert rejection (RLS denial), not just a UI-hidden button.
4. **Client cannot comment on a task that isn't theirs** — authenticate as Client A; attempt to insert a comment on Client B's task; assert rejection.
5. **Client cannot comment on their own Pending task** — assert rejection (comments only allowed on Completed tasks).
6. **Deactivated client is denied access** — set `active = false`; assert both middleware redirect and RLS denial on any query.
7. **Admin can read/write across all clients** — sanity check that Admin's broad access still works (regression guard against an overly-restrictive policy change).
8. **Direct URL access to unauthorized task/client id returns a 404-style not-found**, not a 403 revealing existence (see `SECURITY.md` §7).
9. **Client can read their own archived Completed task** — seed a Completed task for Client A with `archived = true`; authenticate as Client A; assert it remains queryable/visible.
10. **Client cannot read another Client's archived Completed task** — seed an archived Completed task for Client B; authenticate as Client A; assert querying it returns no row.

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
