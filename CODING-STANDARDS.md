# CODING-STANDARDS.md — How Agents Should Write Code

## General Style

- TypeScript strict mode; no `any` unless absolutely unavoidable (and if used, comment why).
- Prefer explicit types on function signatures (params + return), especially for Server Actions and anything touching the database.
- Functional React components only; no class components.
- Prefer named exports over default exports for components and utilities (easier to grep, refactor, and for agents to trace usage).
- Keep files focused: one component or one closely related group of utilities per file. Split a file once it exceeds ~200–250 lines unless it's a cohesive, hard-to-split unit (e.g., a single complex form).

## Server vs. Client Components

- Default to **Server Components**. Add `"use client"` only when a component needs interactivity (state, event handlers, effects) or browser-only APIs.
- Keep client components as small/leafy as possible — push data fetching up into Server Components and pass data down as props, rather than fetching inside client components.

## Server Actions

- One Server Action per file-level export, colocated in `/lib/actions/[domain].ts` (e.g., `/lib/actions/tasks.ts`, `/lib/actions/comments.ts`, `/lib/actions/clients.ts`).
- Every Server Action follows this shape:
  1. Validate input (Zod).
  2. Check auth/role (never trust client-supplied role/id — derive from the session).
  3. Apply rate limiting if the action is in the table in `SECURITY.md` §Rate Limiting.
  4. Perform the database operation using the session-scoped Supabase client (not service-role, except the one documented exception in `API.md`).
  5. Trigger side effects (email) only after a successful write.
  6. Return `{ success: true, data }` or `{ success: false, error }` — never throw uncaught.

## Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`.
- Components: `PascalCase`.
- Functions/variables: `camelCase`.
- Database columns: `snake_case` (Postgres convention) — map to `camelCase` at the application boundary if using generated types that don't already do this.
- Boolean variables/props: prefix with `is`/`has`/`can` (e.g., `isCompleted`, `hasClient`, `canEdit`).

## Validation Schemas

- Define once per entity in `/lib/validation/[entity].ts` (e.g., `task.ts`, `comment.ts`, `client.ts`).
- Import the same schema in both the client-side form (for immediate UX feedback) and the Server Action (for real enforcement) — never duplicate the schema by hand in two places.

## Database Access

- All Supabase queries go through typed helpers in `/lib/supabase/queries/[entity].ts` where practical, rather than inlining raw `.from(...)` calls scattered across components — makes RLS-dependent query shapes easier to audit in one place.
- Never construct raw SQL strings from user input. Use the Supabase client's query builder or parameterized RPC calls only.

## Error Handling

- Catch and translate Supabase/Postgres errors into the `{ success: false, error }` shape with a human-readable message — never surface raw Postgres error text to the end user (may leak schema details).
- Log the raw error server-side (with enough context to debug: action name, user id, timestamp) separately from the user-facing message.

## Comments in Code

- Comment *why*, not *what* — the code should be readable enough to explain what it does; comments should explain non-obvious reasoning (e.g., "// archived instead of deleted so clients retain history — see DATABASE.md").
- Flag any deliberate deviation from a doc in this set with a comment referencing which doc/section and why.

## Formatting & Linting

- Prettier for formatting (default config, 2-space indent, single quotes, trailing commas where valid) — don't hand-format, let the tool do it.
- ESLint with the Next.js recommended config + `eslint-plugin-react-hooks`. No disabling lint rules inline without a comment explaining why.

## Commit-Level Discipline

- Don't mix unrelated changes (e.g., a UI tweak and a schema migration) in one commit — see `GIT.md`.
- Don't leave commented-out code or `console.log` debugging statements in committed code.

## Performance Notes

- Avoid N+1 query patterns — e.g., fetching a task list then looping to fetch each task's comments individually; use a joined query or batch fetch instead.
- Debounce search input (see `UI-UX.md`) rather than firing a query/filter on every keystroke.
