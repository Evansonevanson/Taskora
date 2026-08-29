# TECH-STACK.md — Exact Technologies and Versions

Agents must use these exact tools. Do not substitute a different framework, ORM, or provider without explicit sign-off — swapping stacks mid-build causes silent architecture drift.

## Core

| Layer                | Choice                                                            | Version (minimum)                                                      | Notes                                                                                                                   |
| -------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Language             | TypeScript                                                        | 5.x                                                                    | Strict mode on (`"strict": true` in tsconfig)                                                                           |
| Framework            | Next.js                                                           | 16.3.x (Active LTS)                                                    | Use App Router, Server Components, Server Actions, and Route Handlers where needed; never use Pages Router for new code |
| UI Library           | React                                                             | 19.2.x                                                                 | Use the stable React release compatible with the locked Next.js 16.3.x installation                                     |
| Styling              | Tailwind CSS                                                      | 4.3.x                                                                  | See `DESIGN-SYSTEM.md` for tokens; use Tailwind v4 conventions                                                          |
| Component primitives | shadcn/ui                                                         | latest compatible stable                                               | For accessible base components (dialog, dropdown, etc.)                                                                 |
| Icons                | lucide-react                                                      | latest compatible stable                                               |                                                                                                                         |
| Database             | Postgres                                                          | via Supabase                                                           |                                                                                                                         |
| Backend-as-a-service | Supabase                                                          | `@supabase/supabase-js` v2 + `@supabase/ssr`, latest compatible stable | Auth + Postgres + RLS                                                                                                   |
| Email                | Resend                                                            | latest compatible stable (`resend` npm package)                        | Transactional email only                                                                                                |
| Form validation      | Zod                                                               | latest compatible stable                                               | Shared schemas between client forms and Server Actions                                                                  |
| Rate limiting        | Upstash Redis + `@upstash/ratelimit`                              | latest compatible stable                                               | See `SECURITY.md` §Rate Limiting                                                                                        |
| Hosting (app)        | Vercel                                                            | —                                                                      |                                                                                                                         |
| Hosting (DB/auth)    | Supabase Cloud                                                    | —                                                                      |                                                                                                                         |
| Testing              | Vitest + React Testing Library (unit/component), Playwright (E2E) | latest compatible stable                                               | See `TESTING.md`                                                                                                        |

## Package Manager

Use `pnpm`. Do not mix in `npm` or `yarn` lockfiles.

## Version Locking

The versions above are the approved baseline for project initialization.

After the first successful install:

1. Commit `pnpm-lock.yaml`.
2. Treat the lockfile as the reproducible dependency source of truth.
3. Do not silently upgrade Next.js, React, Tailwind, Supabase auth libraries, or other architecture-critical dependencies.
4. Patch/security updates may be proposed and applied after tests pass.
5. Minor or major upgrades that can change framework behavior require explicit approval and a matching update to this document.
6. Never use canary, beta, RC, experimental, or prerelease framework packages in production unless explicitly approved.

When `latest compatible stable` is specified, install the stable release that is compatible with the locked core stack at project initialization, then preserve the resolved version in `pnpm-lock.yaml`.

## Environment Variables (names, not values)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never exposed to client bundle
RESEND_API_KEY=                    # server-only
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
APP_URL=                           # for building email deep links
```

`SUPABASE_SERVICE_ROLE_KEY` must never be referenced in any file under `/app` that renders on the client, and must never be logged. See `SECURITY.md`.

## Stability and Security Rule

Next.js 14.x is not an approved baseline for this new build. Taskora starts on the supported Next.js 16 Active LTS line. Security releases for framework/auth-adjacent dependencies should be treated as high priority, but must still pass the project's test suite before production deployment.

## Why This Stack

- **Supabase** gives Postgres + Auth + Row-Level Security out of the box, which is the load-bearing security mechanism for this app's core requirement (clients can't see each other's data).
- **Next.js Server Actions** avoid needing a separate Express/Fastify backend while still keeping sensitive logic server-side.
- **Resend** has a clean API and good deliverability for the two transactional email triggers this app needs.
- **Upstash** gives serverless-friendly rate limiting without needing to run a standalone Redis instance.

## Explicitly Not Used (MVP)

- No separate backend framework (Express, NestJS, etc.) — Server Actions/Route Handlers are sufficient.
- No ORM beyond the Supabase client + typed queries (Prisma is optional/Phase 2 if the schema grows complex enough to warrant it — do not introduce it without discussion, since Supabase RLS + generated types cover MVP needs).
- No client-side global state library (Redux, Zustand) — Server Components + React state/context are sufficient at this scale.
