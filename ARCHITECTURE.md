# ARCHITECTURE.md — Application Structure

## High-Level Shape

Taskora is a server-rendered React app (Next.js App Router) backed by Postgres (Supabase), with authentication and authorization enforced at both the middleware layer and the database layer (RLS). There is no separate custom backend server — Supabase provides Postgres, Auth, and RLS; Next.js Server Actions/Route Handlers provide the application's API surface.

```
┌─────────────────────────────────────────────────────┐
│                     Client Browser                    │
│      (React Server/Client Components, Tailwind)       │
└───────────────────────┬───────────────────────────────┘
                         │ HTTPS
┌───────────────────────▼───────────────────────────────┐
│                  Next.js Application                   │
│  ┌────────────────┐  ┌───────────────────────────────┐│
│  │ Middleware      │  │ Server Actions / Route Handlers││
│  │ - session check │  │ - task CRUD                    ││
│  │ - role routing  │  │ - comment create               ││
│  │ - rate limiting │  │ - email trigger dispatch       ││
│  └────────┬────────┘  └───────────────┬────────────────┘│
└───────────┼──────────────────────────┼───────────────────┘
            │                          │
┌───────────▼──────────────────────────▼───────────────────┐
│                        Supabase                            │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Auth           │  │ Postgres + RLS  │  │ (optional)     │ │
│  │ (email/pass)   │  │ tasks/comments/ │  │ Edge Functions │ │
│  │                │  │ users/clients   │  │ for email hooks│ │
│  └───────────────┘  └────────────────┘  └───────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                                │
                     ┌──────────▼──────────┐
                     │  Resend (email API)  │
                     └───────────────────────┘
```

## Layers

### 1. Presentation Layer (Next.js App Router)

- **Server Components** for data-heavy read views (dashboard, task lists) — fetch directly via Supabase server client, respecting RLS.
- **Client Components** for interactive pieces: filters, search box, modals, forms, comment box.
- Two route groups: `(admin)` and `(client)`, each with their own layout, enforcing role-appropriate navigation. See `ROUTES.md`.

### 2. Authorization Layer (Middleware + RLS)

- Next.js middleware checks session validity and role on every request to a protected route group, redirecting mismatched roles (e.g., a Client hitting `/admin/*`) before any page code runs.
- **RLS is the real security boundary**, not the middleware. Middleware improves UX (fast redirects) and defends in depth; RLS policies in Postgres are what actually prevent a client from reading another client's rows, even via a direct API call. See `DATABASE.md` §RLS and `SECURITY.md`.

### 3. Application/API Layer (Server Actions)

- All mutations (create task, update task, mark complete, add comment, clear completed) go through Server Actions, never direct client-side Supabase writes for sensitive tables.
- Server Actions validate input, check role, apply rate limiting, then perform the Supabase call using a session-scoped client (not the service-role key) so RLS still applies.
- The one exception: transactional email dispatch, which uses a server-only Resend API key, never exposed to the client. See `API.md` §Email.

### 4. Data Layer (Postgres via Supabase)

- Tables: `users`, `clients`, `tasks`, `comments`. See `DATABASE.md` for full schema.
- RLS policies enforce: Admin sees all rows; Client sees only rows where `tasks.client_id` maps to their own `client` record, and only where `status = 'completed'`.

### 5. Notification Layer

- Triggered from Server Actions after a successful mutation (not from database triggers, to keep logic in one place and easier to reason about/test).
- Uses Resend's API via a thin server-side email module (`lib/email.ts` or equivalent). See `API.md` §Email for exact trigger conditions.

## Key Architectural Rules

1. **RLS is mandatory on every table containing task or comment data.** No table should be readable by `anon` or a mismatched `authenticated` role without a policy explicitly scoping it.
2. **The Supabase service-role key never reaches the client bundle** and is only used server-side for the narrow set of admin-provisioning operations that legitimately need to bypass RLS (e.g., creating a new client's auth account). See `SECURITY.md`.
3. **No business logic in the client.** Filtering "is this task mine to see" must never rely solely on a client-side `if` statement — always enforced by the query/RLS layer.
4. **Rate limiting sits at the edge** (middleware or a lightweight in-memory/Upstash-backed limiter) in front of any mutation endpoint reachable by an authenticated-but-untrusted role (i.e., Clients), and especially in front of login. See `SECURITY.md` §Rate Limiting.

## Folder Structure (reference)

```
/app
  /(admin)
    /dashboard
    /tasks/[id]
    /clients
    /clients/[id]
    /settings
  /(client)
    /my-jobs
    /my-jobs/[id]
  /login
  /api            (route handlers, if any needed outside Server Actions)
/lib
  /supabase       (server + browser client setup)
  /email          (Resend wrapper, templated triggers)
  /rate-limit     (limiter config)
  /validation     (shared zod schemas for task/comment input)
/components
  /admin
  /client
  /shared
/docs             (this documentation set)
```
