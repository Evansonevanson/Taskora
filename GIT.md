# GIT.md — Branches, Commits, and Git Workflow

## Branching Model

Simple trunk-based workflow appropriate for a solo-developer/small-team project:

- `main` — always deployable. Vercel deploys `main` to production automatically.
- Feature branches off `main`, named: `feature/<short-description>` (e.g., `feature/client-comment-thread`)
- Fix branches: `fix/<short-description>` (e.g., `fix/rls-client-visibility`)
- Chore/docs branches: `chore/<short-description>` or `docs/<short-description>`

No long-lived `develop` branch — keep it simple; merge feature branches into `main` via PR once reviewed (or self-reviewed, for a solo dev, but still via PR to get CI to run — see `TESTING.md`).

## Commit Message Convention

Follow Conventional Commits:

```
<type>(<scope>): <short summary>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `security`

**Scopes (examples):** `tasks`, `comments`, `clients`, `auth`, `rls`, `email`, `ui`, `db`

Examples:
```
feat(tasks): add priority-based sorting to dashboard task list

fix(rls): correct client policy to exclude archived tasks

security(auth): add rate limiting to login server action

docs(database): document needs_revision flag and its RLS implications
```

Use `security(...)` as its own type (not folded into `fix`) for anything touching RLS policies, auth, or rate limiting — makes security-relevant history easy to audit later with `git log --grep="^security"`.

## PR Guidelines

- One logical change per PR — don't bundle a schema migration with an unrelated UI tweak.
- PR description must state:
  1. What changed and why.
  2. Which doc(s) in this set were consulted/updated (per `AI-RULES.md` §4).
  3. For any change touching `tasks`, `comments`, `clients`, or auth: confirmation that the mandatory access-control tests (`TESTING.md`) were run/added.
- Squash-merge into `main` to keep history readable, with the squashed commit message following the convention above.

## Migrations

- Every schema/RLS change ships as a versioned Supabase migration file, committed alongside the code that depends on it, in the same PR — never as a separate, later PR that could get merged out of order.
- Migration commit messages: `feat(db): add needs_revision column and updated task RLS policy`.

## What Never Gets Committed

- `.env`, `.env.local`, or any file containing real Supabase/Resend/Upstash keys.
- Generated build artifacts (`.next/`, `node_modules/`).
- Any file containing real client data (test fixtures should use obviously fake data — `test-client@example.com`, not a real client's email).

## Tagging & Releases

Not required for MVP (continuous deployment off `main` is sufficient for a solo-admin tool), but if the project matures, tag production releases as `v0.1.0`, `v0.2.0`, etc., following semver loosely (breaking schema/RBAC changes bump the minor version at minimum).

## Rollback Policy

If a merge to `main` causes an RLS/access-control regression in production, revert immediately (`git revert`, not a forward-fix under pressure) and only reintroduce the change once the access-control test suite (`TESTING.md`) proves it's safe.
