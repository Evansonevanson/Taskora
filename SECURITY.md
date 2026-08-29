# SECURITY.md — Security Requirements and Data Protection

Security is a first-class priority for Taskora, not an afterthought. The core trust promise of this product — **a client can never see another client's data** — depends entirely on the rules in this document being followed exactly, every time, by every agent touching this codebase.

## 0. Critical Security Failure Modes — Must Never Exist

The following five conditions are release-blocking security failures. If any one of them is present, the affected feature is **not complete and must not be deployed**.

### 0.1 Exposed Environment Variables or API Keys

Never expose server-only credentials to the browser, source control, logs, screenshots, error responses, or generated documentation.

Server-only secrets include, at minimum:

```text
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
UPSTASH_REDIS_REST_TOKEN
```

Rules:

- Only variables intentionally safe for browser use may use the `NEXT_PUBLIC_` prefix.
- `SUPABASE_SERVICE_ROLE_KEY` must never use the `NEXT_PUBLIC_` prefix.
- `RESEND_API_KEY` must never use the `NEXT_PUBLIC_` prefix.
- `UPSTASH_REDIS_REST_TOKEN` must never use the `NEXT_PUBLIC_` prefix.
- Never hard-code secrets in source files, SQL migrations, test fixtures, documentation, or committed configuration.
- `.env`, `.env.local`, `.env.production`, and other files containing real secrets must never be committed.
- Never log environment variable values.
- Never return secrets inside Server Action or API error objects.
- Never expose a service-role Supabase client through a Client Component or browser-importable module.
- If a secret is accidentally exposed, treat it as compromised and rotate it immediately.

Required verification before release:

- [ ] Search the repository for known secret variable names and confirm no literal secret values are committed.
- [ ] Confirm server-only environment variables are referenced only from server-only code paths.
- [ ] Confirm no server-only key appears in the browser bundle.
- [ ] Confirm `.env*` secret files are ignored by Git.

---

### 0.2 Missing, Broken, or Bypassed Row-Level Security (RLS)

RLS is mandatory and is the primary data-isolation boundary for Taskora.

The following tables must have RLS enabled from the migration that creates them:

```text
profiles
clients
tasks
comments
```

Rules:

- A Client must never be able to read another Client's task, comment, client row, or protected profile data.
- A Client must never be able to read Pending tasks in MVP.
- A Client must never directly insert, update, archive, or delete tasks.
- A Client may comment only on their own Completed tasks.
- Archived Completed tasks remain visible only to their assigned Client and Admin.
- Never disable RLS to make development or testing easier.
- Never replace an RLS failure with the service-role key as a shortcut.
- Never rely on route middleware, hidden buttons, or frontend filtering as the primary security boundary.
- Every new table containing user/client/task/comment data must ship with explicit RLS policies in the same migration.

Required verification before release:

- [ ] RLS is enabled on every protected table.
- [ ] Client A cannot read Client B's records.
- [ ] Client cannot read their own Pending task.
- [ ] Client cannot mutate tasks directly.
- [ ] Client cannot comment on another Client's task.
- [ ] Client can read their own archived Completed task.
- [ ] Client cannot read another Client's archived Completed task.
- [ ] Admin access still works.
- [ ] Tests perform direct database/API attempts, not only UI checks.

If an RLS test fails, the release is blocked.

---

### 0.3 Missing Server-Side Validation or Trusting the Frontend

Frontend validation exists for user experience only. It is never considered a security control.

Every mutation must validate input again on the server before touching the database or triggering side effects.

Required Server Action order:

```text
1. Parse and validate input with the shared Zod schema.
2. Read the authenticated session on the server.
3. Derive user id and role from the authenticated session.
4. Verify role and ownership server-side.
5. Apply required rate limiting.
6. Perform the database operation through the appropriate session-scoped Supabase client.
7. Trigger side effects such as email only after the database operation succeeds.
8. Return a safe structured result.
```

Rules:

- Never trust `userId`, `clientId`, `role`, `createdBy`, `authorId`, ownership flags, or permissions supplied by the browser when those values can be derived from the authenticated session.
- Never assume a disabled or hidden form field cannot be manipulated.
- Never rely only on React Hook Form, browser validation, or client-side Zod validation.
- Server Actions must import the same shared Zod schemas used by forms.
- Database constraints and RLS must still protect invariants even if application validation contains a bug.
- Never render user-generated HTML using `dangerouslySetInnerHTML`.

Required verification before release:

- [ ] Every mutation has server-side Zod validation.
- [ ] Authenticated identity is derived from the server session.
- [ ] Role/ownership checks occur server-side.
- [ ] Invalid requests sent outside the UI are rejected.
- [ ] Database constraints cover critical invariants such as Work tasks requiring a Client.

---

### 0.4 Outdated, Unverified, or Hallucinated Packages

AI agents must never invent package names, versions, APIs, configuration options, or import paths.

`TECH-STACK.md` is the approved dependency source of truth.

Rules:

- Use only the packages approved in `TECH-STACK.md` unless explicit approval is given to add another dependency.
- Before adding a package, verify that it exists in the package registry through the package manager or official package documentation.
- Never install a package because an AI agent merely remembers that it exists.
- Never use canary, alpha, beta, RC, experimental, deprecated, abandoned, or unmaintained packages unless explicitly approved.
- Do not silently upgrade Next.js, React, Tailwind, Supabase auth libraries, or other architecture-critical dependencies.
- Preserve `pnpm-lock.yaml`.
- Do not mix `npm`, `yarn`, and `pnpm` lockfiles.
- Treat auth, database, framework, validation, and security-package updates as high priority when they contain security fixes.
- Any dependency change must pass lint, tests, and production build before merge.
- If an agent is uncertain whether an API exists in the installed version, it must inspect the installed package/types or official documentation rather than guessing.

Required verification before release:

- [ ] `pnpm install --frozen-lockfile` succeeds in CI.
- [ ] No unknown or unapproved dependency was introduced.
- [ ] No deprecated package is being used where the approved stack provides a supported path.
- [ ] Framework/auth-adjacent dependencies do not have an ignored known critical security update.
- [ ] `pnpm-lock.yaml` matches `package.json`.

---

### 0.5 Missing or Broken Authentication Middleware

Protected routes must never depend on page components alone to decide whether a user is authenticated or authorized.

Middleware/session handling must enforce authentication and role routing before protected page logic executes.

Required behavior:

```text
Unauthenticated user → protected route → /login
Admin → Client-only route → /dashboard
Client → Admin-only route → /my-jobs
Deactivated Client → protected route → sign out + deny access
```

Rules:

- Use Supabase SSR session handling according to `AUTH.md`.
- Middleware must refresh and validate the Supabase session correctly.
- Role must be derived from trusted server/database state, never a browser-supplied value.
- Middleware is defense in depth; RLS remains the final data-security boundary.
- Direct URL entry must not bypass role restrictions.
- Unauthorized access to a specific protected resource must return not-found behavior where specified by `ROUTES.md`, rather than leaking that the resource exists.
- Authentication errors must not reveal whether an email address exists.
- Deactivated Clients must be blocked from already-open sessions, not merely prevented from logging in again.

Required verification before release:

- [ ] Unauthenticated users cannot access protected routes by direct URL.
- [ ] Client cannot access Admin routes.
- [ ] Admin does not use Client routes as an impersonation mechanism.
- [ ] Deactivated Client is denied on the next protected request.
- [ ] Manipulating browser state/cookies without a valid Supabase session does not grant access.
- [ ] RLS still denies unauthorized data even if middleware is bypassed in a test.

---

### Critical Five — Release Gate

Before any production release, explicitly confirm:

- [ ] No exposed environment variables or API keys.
- [ ] RLS is enabled, correctly scoped, and access-control tests pass.
- [ ] Every mutation performs server-side validation and server-side authorization.
- [ ] All dependencies are real, approved, supported, and locked.
- [ ] Authentication middleware/session protection works on every protected route.

Any unchecked item above blocks deployment.

## 1. Row-Level Security (RLS) — the primary boundary

- RLS must be **enabled** on `profiles`, `clients`, `tasks`, and `comments` from the very first migration that creates them. A table with data and no RLS policy is a bug, full stop.
- Policies must implement the exact rules in `RBAC.md` and `DATABASE.md` §RLS — no broader, no narrower.
- **Never** disable RLS "temporarily for testing" against any environment that contains real or realistic client data. If you need to bypass RLS for a seed script or admin tooling, do so explicitly with the service-role key in a clearly labeled server-only script — never by turning off RLS on the table.
- Every PR that adds or modifies a query against `tasks` or `comments` must be checked against `RBAC.md`'s permission matrix before merging.

## 2. Defense in Depth

Three layers, all required, none optional (see `ARCHITECTURE.md`):

1. Middleware role-based route redirection (UX-level, fast-fail).
2. Server Action role/ownership re-validation (never trust a client-supplied role or id).
3. RLS at the Postgres level (the real, unbypassable boundary).

A bug in layer 1 or 2 must never result in a data leak, because layer 3 exists. Do not treat layers 1–2 as sufficient on their own.

## 3. Secrets Management

- `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only. They must never appear in:
  - Any file under `/app` marked `"use client"`
  - Any code shipped to the browser bundle
  - Logs, error messages, or commit history
- Environment variables are managed via Vercel's environment variable settings (or `.env.local`, gitignored) — never committed.
- Rotate the service-role key immediately if it is ever accidentally exposed (e.g., committed, logged, or pasted into a shared doc).

## 4. Rate Limiting

Rate limiting is mandatory on every endpoint that is a plausible abuse or brute-force target, implemented via Upstash Redis + `@upstash/ratelimit` (see `TECH-STACK.md`), enforced inside the Server Action before any database call.

| Endpoint               | Limit               | Key          |
| ---------------------- | ------------------- | ------------ |
| `login`                | 5 attempts / 15 min | `email + IP` |
| `requestPasswordReset` | 3 / hour            | `email`      |
| `addComment`           | 10 / 10 min         | `user id`    |
| `createTask`           | 30 / 10 min         | `admin id`   |
| `createClient`         | 20 / hour           | `admin id`   |

- On limit exceeded, return a clear but non-revealing error ("Too many attempts, try again in X minutes") — don't leak internal limiter details.
- Consider IP-level rate limiting at the middleware/edge layer as an additional blanket safeguard against scripted abuse, independent of the per-action limits above.

## 5. Input Validation

- Every Server Action validates its input with a Zod schema before touching the database — never rely on client-side form validation alone (see `API.md`).
- Sanitize/escape any user-generated content (task notes, comments) before rendering — use React's default escaping; never use `dangerouslySetInnerHTML` on user content.

## 6. Authentication Hardening

- Passwords hashed by Supabase Auth (bcrypt under the hood) — never implement custom password hashing.
- Session cookies are httpOnly and secure (HTTPS only in production).
- Generic error messages on login/reset flows to prevent user enumeration (see `AUTH.md`).
- Deactivated clients (`clients.active = false`) are force-signed-out and denied access at both the middleware and RLS layer (belt and suspenders).

## 7. Data Exposure Minimization

- Client-facing queries should select only the columns the Client view needs — don't fetch/serialize full `tasks` rows (including internal fields like `created_by`) to the Client's browser if unnecessary.
- 404 (not 403) for unauthorized direct-URL access to a specific task/client id — don't confirm existence of a resource the user can't see (see `ROUTES.md`).

## 8. Email Security

- Deep links in emails point to authenticated routes (`/my-jobs/[id]`, `/tasks/[id]`) — the link itself grants no access; the recipient must be logged in as the correct user, enforced by the same RLS rules as any other page load.
- Never include sensitive task notes or full comment bodies in email subject lines (which may be logged/cached by email clients/servers) — body content is acceptable, subject lines should stay generic ("New comment on your task").

## 9. Dependency & Infrastructure Hygiene

- Keep Supabase client libraries, Next.js, and auth-adjacent packages up to date — security patches in these libraries are high priority to apply promptly.
- Use Vercel's and Supabase's built-in HTTPS — never serve the app over plain HTTP in any environment beyond local dev.

## 10. Incident Response (lightweight, for a solo-admin product)

- If a data leak or cross-client access bug is discovered: immediately patch the RLS policy/Server Action, redeploy, then audit logs (Supabase's built-in logs) for evidence of whether the bug was exploited before reporting to affected clients if applicable.

## Non-Negotiable Summary (repeat for emphasis)

1. RLS enabled and correctly scoped on every data table, always.
2. Service-role key never reaches the client.
3. Rate limiting on every mutation/auth endpoint.
4. Every access-control change is checked against `RBAC.md` and includes a test per `TESTING.md`.
