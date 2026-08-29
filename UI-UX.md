# UI-UX.md — Interface and Interaction Rules

## General Principles

- **Admin view optimizes for speed** — this is a tool the Admin uses many times a day. Minimize clicks for the most common actions: add task, mark complete, filter/search.
- **Client view optimizes for clarity and trust** — a client should immediately understand the status of their work and feel confident leaving feedback. Fewer options, more whitespace, no clutter from Admin-only concepts (categories other than their own work, priority jargon, etc. — keep the Client view simple, e.g., you may choose to hide "priority" entirely from the Client's card view since it's an internal planning concept).
- **Never let the UI be the only safeguard.** Any "you can't see this" or "you can't do this" state in the UI must correspond to an actual RLS/Server Action check (see `RBAC.md`). The UI hides buttons for UX polish, not as a security measure.

## Admin Dashboard

- Stat cards (Total / Pending / Completed / High Priority) pinned at the top, always visible without scrolling on desktop.
- Progress bar directly below stat cards — a single, clear horizontal bar with percentage label.
- Filter chips (All / Pending / Completed / High Priority) + search bar + sort dropdown in a single control row above the task list.
- Task list as cards on mobile, could switch to a compact table on desktop — but keep one shared component with responsive styling rather than two divergent implementations.
- Each task row/card shows: title, category badge, client name (if Work), priority indicator (color-coded, see `DESIGN-SYSTEM.md`), due date, status.
- "New Task" is a persistent, prominent button (top-right of dashboard) — opens a modal, not a full page navigation, to keep the flow fast.
- "Clear completed" lives near the filter controls, not buried in a settings menu — but always behind a confirmation modal stating how many tasks will be archived.

## Task Creation / Edit Modal

- Category selector first; Client dropdown only appears (animated in, not just conditionally rendered with a jarring layout jump) when Category = Work.
- Priority as a segmented control (Low/Medium/High) rather than a plain dropdown — faster to scan and select.
- Due date via a proper date picker component, not a raw text input.
- Notes as an expandable textarea, not forced open by default (keeps the form compact for quick task entry).

## Task Detail (Admin)

- Clear visual separation between "task info" (editable) and "comment thread" (append-only, chronological, oldest-to-newest).
- If `needs_revision = true`, show a prominent, unmissable badge/banner (e.g., amber) at the top of the task — this is the Admin's cue that action is needed.
- "Mark Resolved" action only appears when `needs_revision = true`.
- The "notify client by email" confirmation appears as a lightweight inline toggle/checkbox at the moment of marking a task complete, not a separate modal step, to keep the completion flow to one click when the default preference is already set (see `FEATURES.md` §Settings).

## Client Portal — My Jobs

- Card-based list only, no dense tables — this view should feel light and approachable, not like an internal ops tool.
- Each card: task title, category (if useful to show — likely just "Work" is implicit, so this may be omitted for Clients), completed date, and a "Needs your input" vs. "Reviewed" style indicator if you want to show whether they've already commented.
- Empty state (no completed jobs yet) should be warm and clear: "Nothing delivered yet — check back soon," not a bare blank screen.

## Client Portal — Job Detail

- Task notes/deliverable info at the top, clearly separated from the comment thread below.
- **Deliverables Section:** prominently displayed below task info when a `project_url` or attachments exist:
  - **Project Link:** displayed with an "External Link / View Deliverable" button with an `ExternalLink` icon, opening in a new tab with `rel="noopener noreferrer"`.
  - **Attachments List:** clean list of deliverable files with icon (PDF, Image, etc.), file name, humanized file size, and actionable "Preview" and "Download" buttons.
  - Generates secure, short-lived signed URLs on click.
- Comment box always visible at the bottom, not hidden behind a "leave feedback" toggle — lower the friction to respond.
- After sending a comment, show immediate optimistic feedback ("Sent — [Admin name] has been notified") so the Client isn't left wondering if it worked.

## Deliverables Management (Admin UX)

- **Project Link Input:** Optional text field in Task Creation and Edit modal with URL helper and protocol validation.
- **Deliverable Upload Dropzone:** Drag-and-drop or file selector supporting allowed types (JPG, PNG, WEBP, PDF) up to 20MB.
- **Attachment List:** shows uploaded deliverables with file size, uploaded date, and a safe "Remove" action (which cleans up both database metadata and storage object).

## Appearance & Theme Settings (UX)

- **Admin Appearance Control:** Located in `/admin/settings` under a dedicated "Appearance" section with segmented card controls for `[ Light ]`, `[ Dark ]`, and `[ System ]` with dedicated Lucide iconography (`Sun`, `Moon`, `Monitor`).
- **Client Portal Theme Switcher:** Located directly in the top navigation bar of the Client Portal next to the avatar/profile menu (`components/layout/client-nav.tsx`), rendering an accessible icon popover allowing instant selection between Light, Dark, and System modes without requiring a dedicated settings page.
- **Real-Time Responsiveness:** Theme changes apply immediately across all portal and dashboard views without full page reload.
- **Device Persistence:** Setting is persisted locally to `taskora-theme` without requiring server mutations.

## Public Landing Page (UX)

- **Unauthenticated Showcase:** Root `/` presents a modern, distraction-free SaaS landing page detailing Taskora's purpose, live product preview, benefits, delivery steps, client portal capabilities, security architecture, and theme options.
- **Realistic Product Preview:** Recreates a simplified live-sprint dashboard visual using HTML/CSS design tokens instead of generic stock images.
- **Frictionless Onboarding Entry:** Navigation and hero CTAs guide visitors directly to `/login`. No public signup buttons are exposed.
- **Theme-Aware Public Presentation:** Landing page seamlessly respects the active Light, Dark, or System mode choice via the header appearance control.

## Loading & Empty States

- Every list view (dashboard task list, client list, my-jobs list) needs a defined empty state and a loading skeleton — never a blank white screen during data fetch.

## Error States

- Server Action failures surface as inline, human-readable messages near the relevant form/button — never a raw stack trace or generic "Something went wrong" with no next step. Where possible, suggest the fix (e.g., "That email is already in use").

## Confirmation Modals Required For

- Clear completed (bulk archive)
- Deactivating a client
- Deleting/archiving an individual task
- Any action that is hard or impossible to reverse in the UI

## Accessibility

- All interactive elements keyboard-navigable (modals trap focus, dropdowns operable via arrow keys — shadcn/ui primitives handle most of this by default, don't fight them with custom re-implementations).
- Color is never the only signal for priority/status — pair color with a text label or icon (see `DESIGN-SYSTEM.md`).
- Sufficient contrast ratios per WCAG AA at minimum in both Light and Dark modes.
