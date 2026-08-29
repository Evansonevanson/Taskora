# PRODUCT.md — Product Vision, Users, Goals, Scope

## Vision

A single, secure workspace where a freelancer manages every task — personal and client-facing — and where each client gets a professional, self-serve window into their own delivered work, with a built-in feedback loop.

## Problem Statement

Tracking multiple clients' work in one flat to-do list doesn't scale: there's no way to show a client their status without exposing everyone else's data, and feedback happens over scattered channels (email, DMs, calls) instead of being attached to the task it concerns.

## Users

### Admin (single user in MVP)

- Owns and manages all tasks: General, Work, Personal, Urgent, Shopping.
- For "Work" tasks, assigns a Client from a dropdown.
- Sets priority and due dates, tracks completion.
- Provisions and manages Client accounts.
- Receives email when a client comments on a task.

### Client (multiple users)

- Logs into a scoped portal.
- Sees only tasks assigned to them, and only once marked **Completed** by the Admin (see decision below).
- Can leave a comment/correction request on a completed task.
- Receives email when a task assigned to them is marked complete.
- Cannot create, edit, or delete tasks; cannot see other clients or Admin's non-work tasks.

## Goals

| Goal                                               | Why it matters                                       |
| -------------------------------------------------- | ---------------------------------------------------- |
| Centralize all task tracking in one dashboard      | Reduces context-switching, missed deadlines          |
| Give clients self-serve visibility into their work | Reduces "what's the status?" messages                |
| Attach feedback directly to the task it concerns   | Feedback doesn't get lost in chat/email threads      |
| Enforce strict data isolation between clients      | Trust — a client must never see another client's job |
| Close the loop via email                           | Neither party has to remember to check the app       |

## Decisions Locked for MVP

These were open questions in earlier discovery and are now decided as defaults. Revisit only with explicit sign-off, since they affect `RBAC.md` and `DATABASE.md` directly.

1. **Clients see Completed tasks only** (not Pending/In Progress). Reduces exposure of unfinished/messy work.
2. **A client comment does not auto-reopen the task to Pending.** Instead it sets a `needs_revision` flag on the Completed task, visible to the Admin. Admin manually resolves it.
3. **Single Admin only** for MVP — no team/multi-admin support. Schema should not preclude adding this later, but no UI/permissions work should be done for it now.
4. **"Clear completed" archives, not hard-deletes.** Archived tasks are hidden from the Admin's default view but retained in the database (clients retain access to their own archived-but-completed job history).

## Non-Goals (MVP)

- No payments/invoicing.
- No real-time chat.
- No native mobile app (responsive web only).
- No client self-registration.
- No file/attachment uploads (Phase 2).

## Success Signals

- Admin can fully manage a work week (add, prioritize, complete tasks) without leaving the dashboard.
- A client can go from "received email" to "left a correction comment" in under 60 seconds, without help.
- Zero cross-client data leakage under any UI path or crafted API request (this is a hard security bar, not a UX nicety — see `SECURITY.md`).
