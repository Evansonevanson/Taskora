# SECURITY.md — Security Requirements and Data Protection

Security is a first-class priority for Taskora, not an afterthought. The core trust promise of this product — **a client can never see another client's data** — depends entirely on the rules in this document being followed exactly, every time, by every agent touching this codebase.

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

| Endpoint | Limit | Key |
|---|---|---|
| `login` | 5 attempts / 15 min | `email + IP` |
| `requestPasswordReset` | 3 / hour | `email` |
| `addComment` | 10 / 10 min | `user id` |
| `createTask` | 30 / 10 min | `admin id` |
| `createClient` | 20 / hour | `admin id` |

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
