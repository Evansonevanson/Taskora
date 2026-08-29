# AI-RULES.md — Rules Specifically for AI Agents

This file governs _agent conduct_ — how an AI coding agent should behave while working on Taskora, as distinct from `AGENTS.md` (which is the entry-point index) and the technical docs (which describe the system itself). If this file and `AGENTS.md` conflict on conduct, this file wins.

## 1. Ask, Don't Assume — On These Topics Specifically

Stop and surface the question (don't silently pick an answer) whenever a task touches:

- Who can see/do what (cross-check `RBAC.md`; if a request seems to widen access, flag it explicitly rather than implementing it).
- Whether to hard-delete vs. archive any data (`DATABASE.md`/`PRODUCT.md` default to archive — don't introduce a hard-delete path without confirmation).
- Email trigger conditions — a wrong assumption here causes real emails to real clients, which is hard to "undo."
- Schema changes to `tasks`, `comments`, `clients`, or `profiles`.

For everything else (styling details, component structure, minor UX polish), use best judgment per the docs and proceed — don't stall on low-stakes ambiguity.

## 2. Never Weaken Security to Make Progress Easier

If you're blocked because RLS is rejecting a query during development, the fix is **never** "disable RLS" or "use the service-role key here instead." The fix is: figure out why the policy doesn't match the intended access pattern, and correct the policy (with a matching update to `DATABASE.md`), or correct the query. If you're unsure which is wrong, say so rather than reaching for the service-role key as a shortcut.

## 3. Don't Expand Scope Unprompted

- If a user asks for a small fix and you notice a "nice to have" nearby, mention it as a suggestion rather than silently building it into the same change.
- Do not implement anything listed under a doc's "Phase 2" or "Explicitly Out of Scope" section without the user explicitly asking for it by name.

## 4. Keep Documentation and Code in Sync

- If an implementation detail diverges from what's written in these docs (e.g., you discover a better approach mid-build), update the relevant doc in the same change/PR — don't let docs silently go stale. Treat doc drift as a real bug, not busywork.
- If you're asked to build something not yet covered by any doc, propose which doc it belongs in and draft an addition rather than just writing code with no corresponding spec.

## 5. Be Explicit About What You Changed and Why

- Summarize, in plain language, what changed and which doc(s) informed the decision — especially for anything touching auth, RLS, or email.
- If you made an assumption (per §1, for a low-stakes case), state it plainly in your response so the human can correct it quickly if wrong.

## 6. Testing Expectations for Agents

- Any change to `tasks`, `comments`, `clients`, `profiles` schema/queries/policies must come with a test per `TESTING.md`'s mandatory access-control suite — do not consider such a change complete without one.
- Don't delete or weaken an existing test to make a change pass. If a test seems wrong given a new requirement, flag it and propose the corrected test explicitly rather than quietly removing coverage.

## 7. Working With Existing Code

- Read the surrounding code/pattern before adding new code — match existing conventions (see `CODING-STANDARDS.md`) rather than introducing a parallel style.
- Prefer minimal, targeted diffs over large rewrites, especially in files touching auth or RLS-adjacent queries — large diffs in sensitive areas are harder to review carefully, which itself is a security risk.

## 8. Handling Conflicting Instructions

- If a human's in-the-moment instruction conflicts with `SECURITY.md` or `RBAC.md` (e.g., "just let clients see all tasks for now, we'll fix it later"), don't silently comply. Explain the specific risk (in one or two sentences, not a lecture) and ask for explicit confirmation before proceeding, or propose a safer alternative that achieves the likely underlying goal.
- If a human explicitly overrides a doc after being told the risk, proceed — but note in the PR/commit that this was a deliberate, flagged exception, and suggest updating the doc if the change is meant to be permanent.

## 9. Tone With the Human

- Be direct about trade-offs and risks, especially security ones — don't bury a real concern in hedging language.
- Don't pad responses with unnecessary process narration ("I'm now going to think about..."). State findings and actions plainly.
