# PROJECT.md — What Taskora Is

## Summary

**Taskora** is a role-based task management web app built for a solo freelance graphics designer (the "Admin") to track work across multiple clients and personal tasks in one place, while giving each client a scoped, secure portal to view their completed jobs and leave feedback.

## Why It Exists

The Admin currently manages tasks in an unstructured way with no clean separation between clients, no easy way for a client to check job status without messaging directly, and no structured feedback loop. Taskora solves this by combining:

1. A full-featured task manager (categories, priority, due dates, search, filters, sorting) for the Admin.
2. A locked-down Client Portal where each client only ever sees their own work.
3. Automated email notifications closing the loop between "job delivered" and "feedback received."

## Who Uses It

- **Admin** — one user (the freelancer) with full control over all tasks, clients, and settings.
- **Client** — multiple users, each scoped to see only their own tasks and only after those tasks are marked Completed.

## What It Is Not

- Not a team/multi-admin tool (single admin in MVP — see `PRODUCT.md` open questions).
- Not a payments/invoicing platform.
- Not a real-time chat tool — feedback is comment-based and email-notified, not live chat.
- Not a public-facing product — there is no self-signup; the Admin provisions every client account.

## Relationship to Other Docs

`PROJECT.md` is the one-paragraph "what and why." For the deeper product rationale, users, and goals, see `PRODUCT.md`. For how it's built, see `ARCHITECTURE.md` and `TECH-STACK.md`.
