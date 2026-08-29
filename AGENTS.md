# AGENTS.md — Master Instructions for AI Coding Agents

This file is the entry point for every AI coding agent (Claude Code, Cursor, Copilot Workspace, etc.) working on **Taskora**. Read this file first, in full, before writing or modifying any code.

## 0. What to Read, In Order

Before touching code, read documents in this order:

1. `PROJECT.md` — what Taskora is
2. `PRODUCT.md` — who it's for, what it must do
3. `ARCHITECTURE.md` — how the app is structured
4. `TECH-STACK.md` — exact tools/versions to use (never substitute)
5. `DATABASE.md` — schema, relationships, RLS policies
6. `AUTH.md` — how login/sessions work
7. `RBAC.md` — who can see/do what (**critical — re-read before any data-access code**)
8. `FEATURES.md` — full feature spec
9. `API.md` — server actions/endpoints and their contracts
10. `ROUTES.md` — page map
11. `UI-UX.md` + `DESIGN-SYSTEM.md` — how it should look/behave
12. `SECURITY.md` — non-negotiable security rules
13. `TESTING.md` — what "done" means
14. `CODING-STANDARDS.md` — style and structure rules
15. `GIT.md` — branch/commit conventions
16. `BUILD-PLAN.md` — implementation order and phase checkpoints
17. `CURRENT-STATE.md` — current build phase, completed work, next task, and validation status

Only `AI-RULES.md` is more important than this file for agent behavior — if the two ever conflict, `AI-RULES.md` wins on agent conduct; this file wins on project facts.

## 1. Non-Negotiables (apply to every task, no exceptions)

- **Never weaken Row-Level Security (RLS).** Every table holding task, comment, or client data must be filtered at the database layer by the authenticated user's role and identity — not just hidden in the UI. See `DATABASE.md` §RLS and `SECURITY.md`.
- **Never let a client query another client's data.** This is the single most important invariant in this codebase. If you're unsure whether a query is scoped correctly, stop and add an explicit `client_id = auth.uid()`-equivalent filter rather than guessing.
- **Rate limit every public-facing mutation endpoint** (login, comment submission, task creation) per `SECURITY.md` §Rate Limiting. Do not ship an endpoint without it.
- **Never commit secrets.** API keys, service-role keys, and email provider keys live in environment variables only, never in code or committed `.env` files.
- **Don't invent scope.** If a feature isn't in `FEATURES.md`'s MVP list, don't build it unless explicitly asked. Flag it instead as a suggestion.
- **Don't change the data model silently.** If a task requires a schema change, propose it and update `DATABASE.md` in the same change — schema drift between docs and code is treated as a bug.

## 2. How Agents Should Work

- Work in small, reviewable increments per `GIT.md` — one feature or fix per branch/commit, not sweeping rewrites.
- Before implementing a feature, locate its spec in `FEATURES.md` and its endpoint contract in `API.md`. If either is missing or ambiguous, state your assumption in the PR description rather than silently deciding.
- When a change touches access control (who can see/do what), cross-check against `RBAC.md` explicitly and mention this check in your commit message or PR notes.
- Prefer editing existing patterns already in the codebase over introducing new ones. Consistency beats cleverness.
- If a request conflicts with `SECURITY.md` (e.g., "just disable RLS for now to test"), do not comply — explain the conflict and propose a safe alternative (e.g., a seed script with a test user instead).

## 3. Definition of Done

A feature/task is not done until:

- [ ] It matches its spec in `FEATURES.md` / `API.md`
- [ ] RBAC rules from `RBAC.md` are enforced at the DB layer, not just UI
- [ ] Relevant tests from `TESTING.md` pass (or are added if missing)
- [ ] No secrets or service-role keys are exposed to the client bundle
- [ ] Code follows `CODING-STANDARDS.md`
- [ ] Commit follows `GIT.md` conventions

## 4. Build Progress Rules

Before beginning implementation work:

1. Read `BUILD-PLAN.md`.
2. Read `CURRENT-STATE.md`.
3. Work only on the current phase/task unless the human explicitly instructs otherwise.
4. Do not skip a phase checkpoint because a later feature appears easier or more interesting.
5. Update `CURRENT-STATE.md` after every meaningful implementation session or completed task.
6. Do not mark a phase complete until its checkpoint requirements pass.
7. If implementation changes a documented product, architecture, schema, RBAC, API, security, or testing decision, update the relevant documentation in the same change.
8. If the current codebase state conflicts with `CURRENT-STATE.md`, treat that as documentation drift: verify the code, then correct `CURRENT-STATE.md` before continuing.
9. A new agent must never infer project progress from filenames or partial code alone when `CURRENT-STATE.md` exists.

### What `CURRENT-STATE.md` Must Track

At minimum:

- Current phase
- Current task
- Completed work
- In-progress work
- Next tasks
- Known issues/blockers
- Architecture decisions made during implementation
- Database/auth/dashboard/client-portal/email/testing status
- Last validation results (`pnpm lint`, `pnpm test`, `pnpm build`, Playwright where applicable)

### Phase Discipline

`BUILD-PLAN.md` controls implementation order, but it does not override security or access-control documentation.

If a build step conflicts with `SECURITY.md`, `RBAC.md`, or `DATABASE.md`, stop and surface the conflict rather than following the build plan blindly.

## 5. Source of Truth Hierarchy

If documents conflict, resolve in this order: `SECURITY.md` > `RBAC.md` > `DATABASE.md` > `API.md` > `FEATURES.md` > everything else. Security and access control always win over feature convenience.

## 6. When in Doubt

Stop and surface the ambiguity rather than guessing on anything touching: authentication, data access scoping, client data visibility, or email notification triggers (duplicate/spam emails are a real risk — see `API.md` §Email).
