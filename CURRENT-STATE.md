# CURRENT-STATE.md — Taskora Build Status

This file records the current implementation state of Taskora.

Every AI coding agent must read this file before making changes.

Update it after every meaningful implementation session, completed task, phase transition, or architecture decision.

Do not guess project progress from filenames or partial code when this file exists.

---

## Project Status

**Stage:** Pre-development documentation complete  
**Current Phase:** Phase 0 — Project Foundation  
**Current Task:** Initialize the application according to `BUILD-PLAN.md`  
**MVP Status:** Not started

---

## Completed Documentation

The following planning/specification documents exist and are considered the current project source set:

- [x] `PROJECT.md`
- [x] `PRODUCT.md`
- [x] `FEATURES.md`
- [x] `ARCHITECTURE.md`
- [x] `TECH-STACK.md`
- [x] `DATABASE.md`
- [x] `AUTH.md`
- [x] `RBAC.md`
- [x] `API.md`
- [x] `ROUTES.md`
- [x] `UI-UX.md`
- [x] `DESIGN-SYSTEM.md`
- [x] `SECURITY.md`
- [x] `TESTING.md`
- [x] `CODING-STANDARDS.md`
- [x] `GIT.md`
- [x] `AI-RULES.md`
- [x] `AGENTS.md`
- [x] `BUILD-PLAN.md`
- [x] `CURRENT-STATE.md`

---

## Locked Product Decisions

These decisions are already documented and should not be changed without explicit approval.

### Roles

- One Admin in MVP.
- Multiple Clients.
- No public Client self-registration.
- Clients are provisioned by the Admin.

### Client Visibility

A Client may see a task only when:

```text
task.client_id == current Client's client id
AND task.status == 'completed'
```

Important:

- Archived Completed tasks remain visible to the assigned Client.
- `archived` hides tasks from the Admin's default active-task view.
- A Client never sees another Client's tasks.
- A Client never sees Pending tasks in MVP.

### Archive Behavior

- No hard-delete path in MVP.
- "Clear completed" archives eligible tasks.
- Individual task deletion also archives.
- Archived tasks are retained in the database.
- Archived Completed Work tasks remain part of Client delivery history.

### Revision Flow

- Client comment does not move a task back to Pending.
- Client comment sets `needs_revision = true`.
- Admin manually clears the flag using the resolve action.
- Comments are immutable in MVP.

### Email Idempotency

Task completion notification uses:

```text
tasks.client_notified_at
```

Rules:

- Completion alone does not populate the field.
- Before sending, verify `client_notified_at IS NULL`.
- Successful email send → set `client_notified_at = now()`.
- Failed email send → leave `client_notified_at = NULL`.
- Repeated/double-submitted notification requests must not send duplicate emails.

---

## Current Technology Baseline

Use the locked stack documented in `TECH-STACK.md`.

Core direction:

- TypeScript strict mode
- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui
- lucide-react
- Supabase Postgres
- Supabase Auth
- Supabase RLS
- Resend
- Zod
- Upstash Redis / rate limiting
- Vitest
- React Testing Library
- Playwright
- Vercel
- pnpm

Exact installed versions must be recorded after Phase 0 initialization and preserved through `pnpm-lock.yaml`.

---

## Implementation Status

### Phase 0 — Project Foundation

- [ ] Next.js project initialized
- [ ] TypeScript strict mode confirmed
- [ ] `pnpm` configured
- [ ] Tailwind configured
- [ ] shadcn/ui configured
- [ ] lucide-react installed
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Folder structure created
- [ ] Environment variable placeholders added
- [ ] Exact dependency versions recorded
- [ ] `pnpm-lock.yaml` committed
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes

**Status:** Not started

---

### Phase 1 — Supabase and Database

- [ ] Supabase browser client
- [ ] Supabase server client
- [ ] SSR session helpers
- [ ] Middleware session refresh
- [ ] `profiles` migration
- [ ] `clients` migration
- [ ] `tasks` migration
- [ ] `comments` migration
- [ ] constraints
- [ ] indexes
- [ ] RLS helper functions
- [ ] Admin policies
- [ ] Client policies
- [ ] mandatory access-control integration tests

**Status:** Not started

---

### Phase 2 — Authentication

- [ ] login
- [ ] role redirects
- [ ] protected routes
- [ ] deactivated Client handling
- [ ] forgot password
- [ ] reset password
- [ ] auth rate limiting
- [ ] unauthorized resource not-found behavior

**Status:** Not started

---

### Phase 3 — Design System and Shell

- [ ] design tokens
- [ ] typography
- [ ] shared UI primitives
- [ ] Admin shell
- [ ] Client shell
- [ ] loading states
- [ ] empty states
- [ ] error states
- [ ] accessibility baseline

**Status:** Not started

---

### Phase 4 — Admin Dashboard

- [ ] stat cards
- [ ] progress bar
- [ ] task list
- [ ] search
- [ ] filters
- [ ] sorting
- [ ] clear completed control

**Status:** Not started

---

### Phase 5 — Task Management

- [ ] create task
- [ ] edit task
- [ ] mark complete
- [ ] notify Client option
- [ ] individual archive
- [ ] clear completed
- [ ] task validation
- [ ] task tests

**Status:** Not started

---

### Phase 6 — Client Management

- [ ] Client list
- [ ] create/provision Client
- [ ] Client detail
- [ ] Client mini stats
- [ ] deactivate Client

**Status:** Not started

---

### Phase 7 — Client Portal

- [ ] My Jobs
- [ ] Client job cards
- [ ] job detail
- [ ] archived Completed history
- [ ] Client-only data minimization

**Status:** Not started

---

### Phase 8 — Comments and Revision Flow

- [ ] Client comments
- [ ] `needs_revision`
- [ ] Admin replies
- [ ] resolve revision
- [ ] immutable comment rules
- [ ] comment rate limiting

**Status:** Not started

---

### Phase 9 — Email Notifications

- [ ] Resend integration
- [ ] completion email
- [ ] `client_notified_at`
- [ ] duplicate-send protection
- [ ] Client comment → Admin email
- [ ] failure logging
- [ ] mocked email tests

**Status:** Not started

---

### Phase 10 — Settings

- [ ] category management
- [ ] notification prompt preference

**Status:** Not started

---

### Phase 11 — Full Testing and QA

- [ ] unit tests
- [ ] component tests
- [ ] integration tests
- [ ] mandatory RLS suite
- [ ] Playwright E2E
- [ ] manual QA
- [ ] accessibility verification

**Status:** Not started

---

### Phase 12 — Deployment

- [ ] production Supabase
- [ ] production Vercel
- [ ] production environment variables
- [ ] Upstash production config
- [ ] Resend production config
- [ ] migrations
- [ ] production smoke tests

**Status:** Not started

---

## Current Next Tasks

The next implementation tasks are:

1. Initialize the Next.js project using `pnpm`.
2. Confirm exact installed core dependency versions against `TECH-STACK.md`.
3. Enable/check TypeScript strict mode.
4. Configure Tailwind CSS.
5. Configure shadcn/ui.
6. Install/configure lucide-react.
7. Configure ESLint and Prettier.
8. Create the base folder structure.
9. Add environment variable placeholders.
10. Run `pnpm lint` and `pnpm build`.
11. Update this file with the actual results.

Do not begin Phase 1 until the Phase 0 checkpoint in `BUILD-PLAN.md` passes.

---

## Known Issues / Blockers

None currently.

---

## Documentation Drift

Current known documentation conflicts:

**None after the latest correction pass.**

If an agent finds a disagreement between code and documentation:

1. Determine which behavior is authoritative using `AGENTS.md` source-of-truth hierarchy.
2. Do not silently choose.
3. Correct code and/or documentation in the same change.
4. Record the decision below.

---

## Architecture Decisions Made During Implementation

None yet.

Use this format when adding one:

```text
### YYYY-MM-DD — Decision title

Decision:
What was chosen.

Reason:
Why it was chosen.

Docs affected:
- FILE.md
- FILE.md

Code affected:
- path/to/file
```

---

## Known Technical Debt

None yet.

Do not add speculative technical debt. Record only real compromises or deferred cleanup that exists in the codebase.

---

## Validation Status

### Latest Commands

```text
pnpm lint: NOT RUN
pnpm test: NOT RUN
pnpm build: NOT RUN
Playwright: NOT RUN
```

### Access-Control Tests

```text
Client A cannot read Client B: NOT RUN
Client cannot read Pending task: NOT RUN
Client cannot mutate task: NOT RUN
Client cannot comment cross-client: NOT RUN
Client can read own archived Completed task: NOT RUN
Client cannot read another Client's archived Completed task: NOT RUN
Admin broad access: NOT RUN
```

---

## Last Completed Task

Documentation preparation and correction pass.

---

## Handoff Note for the Next Agent

Start with `AGENTS.md`.

Then read:

1. `BUILD-PLAN.md`
2. this file
3. the documents required by `AGENTS.md`

The project has not been initialized yet.

Begin at **Phase 0.1 — Initialize the Application**.

Do not skip directly to database, authentication, dashboard, or UI feature work.

---

## Last Updated

2026-08-27
