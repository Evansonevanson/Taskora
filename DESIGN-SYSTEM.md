# DESIGN-SYSTEM.md — Colors, Typography, Spacing, Components

This defines the visual language for Taskora. Implemented as Tailwind CSS v4 custom tokens, variants, and CSS custom variables so both Admin and Client views stay visually consistent across Light, Dark, and System appearance modes.

## Brand Assets & Logo

Official brand assets live in `public/brand/` derived from the project's source `Logo/` directory:

- **Logo Icon (`public/brand/logo-icon.png`):** Official "T / checkmark" monogram in vibrant blue/indigo gradient (`#3B82F6` / `#4F46E5`). Used in `<TaskoraLogo />` across navigation headers, authentication screens, 404 page, and app favicons.
- **Favicons / App Icons (`app/icon.png`, `app/apple-icon.png`, `public/favicon.ico`):** Multi-resolution icons derived from the official monogram.
- **Brand Lockups (`public/brand/logo-dark.png`, `public/brand/logo-black.png`):** Full horizontal logo lockups for dark and light presentations.

## Brand Feel

Clean, modern, professional-but-approachable productivity tool — think "Linear meets a client portal," not a generic admin template. Avoid default shadcn gray-on-white monotony; commit to one confident accent color (Indigo `#6366F1`) and use it consistently for primary actions, badges, and progress indicators.

## Color Tokens

| Token                    | Usage                                      | Light Mode           | Dark Mode           |
| :----------------------- | :----------------------------------------- | :------------------- | :------------------ |
| `--color-primary`        | Primary buttons, active nav, progress fill | Indigo `#6366F1`     | Indigo `#6366F1`    |
| `--color-primary-hover`  | Hover state                                | `#4F46E5`            | `#4F46E5`           |
| `--color-primary-active` | Active state                               | `#4338CA`            | `#4338CA`           |
| `--color-bg`             | App background                             | Stone 50 `#FAFAF9`   | Stone 950 `#0C0A09` |
| `--color-surface`        | Cards, modals                              | Pure White `#FFFFFF` | Stone 900 `#1C1917` |
| `--color-elevated`       | Sub-cards, nested elements                 | Stone 100 `#F5F5F4`  | Stone 800 `#292524` |
| `--color-border`         | Dividers, card borders                     | Stone 200 `#E7E5E4`  | Stone 800 `#292524` |
| `--color-border-subtle`  | Subtle outlines                            | Stone 100 `#F5F5F4`  | Stone 900 `#1F1D1B` |
| `--color-text-primary`   | Headings, body text                        | Stone 900 `#1C1917`  | Stone 50 `#F5F5F4`  |
| `--color-text-secondary` | Muted labels, metadata                     | Stone 600 `#57534E`  | Stone 400 `#A8A29E` |
| `--color-text-muted`     | Secondary icons, subtle hints              | Stone 500 `#78716C`  | Stone 500 `#78716C` |
| `--color-success`        | Completed status, positive states          | Emerald `#10B981`    | Emerald `#10B981`   |
| `--color-warning`        | `needs_revision` banner, medium priority   | Amber `#F59E0B`      | Amber `#F59E0B`     |
| `--color-danger`         | High priority, destructive actions         | Red `#EF4444`        | Red `#EF4444`       |
| `--color-info`           | General/neutral badges                     | Indigo `#6366F1`     | Indigo `#6366F1`    |

### Priority Color Mapping

- High → `--color-danger` (`#EF4444`)
- Medium → `--color-warning` (`#F59E0B`)
- Low → `--color-text-secondary` (`#94A3B8` / `#57534E` — deliberately muted)

### Category Badge Colors

- General → neutral stone
- Work → `--color-primary` tint
- Personal → teal
- Urgent → `--color-danger`
- Shopping → amber/yellow

## Typography

| Role              | Font                          | Weight/Size                            |
| :---------------- | :---------------------------- | :------------------------------------- |
| Font family       | Inter (or system-ui fallback) | —                                      |
| Page titles       | 24–28px                       | Semibold (600)                         |
| Section headings  | 18–20px                       | Semibold (600)                         |
| Body text         | 14–16px                       | Regular (400)                          |
| Metadata/labels   | 12–13px                       | Medium (500), `--color-text-secondary` |
| Stat card numbers | 28–32px                       | Bold (700)                             |

## Spacing Scale

Use Tailwind's default spacing scale (4px base unit). Standard component padding: `p-4` to `p-6` for cards, `gap-4` between grid items, `gap-2` for tightly related inline elements (icon + label).

## Components

- **Button:** primary (filled, `--color-primary`), secondary (outline/solid tint), destructive (red, for delete/deactivate/archive actions), ghost (for low-emphasis actions like "Cancel").
- **Badge:** used for category, priority, and status — pill-shaped, colored per mapping above, always paired with a text label.
- **Card:** used for stat cards, task cards, client cards, job cards — consistent border-radius (`rounded-xl`), subtle shadow (`shadow-sm` / `shadow-xl`), `--color-surface` background.
- **Modal/Dialog:** used for New Task, confirmations, client creation — centered, backdrop dim, focus-trapped.
- **Progress bar:** rounded-full track, `--color-primary` fill, animated transition on value change.

## Layout

- **Public Landing Page:** wide responsive container (`max-w-7xl`), modular section blocks with generous vertical rhythm (`py-16` / `py-24`), balanced ambient glows, and interactive HTML/CSS UI previews.
- **Admin dashboard:** max-width container (`max-w-7xl`), stat cards in a responsive grid, task list full-width below.
- **Client portal:** focused container (`max-w-4xl`) — reinforces the simpler, focused feel described in `UI-UX.md`.
- **Top navigation:** LandingNav (Features, How It Works, Portal, Security, Appearance, ThemeToggle, Sign in), AdminNav (Dashboard, Clients, Settings), ClientNav (My Jobs, Company badge, ThemeToggle, UserMenu).

## Light & Dark Appearance Modes

Taskora supports three real appearance options accessible to all authenticated users:

1. **Light:** Clean, crisp stone & white palette with dark typography and soft borders.
2. **Dark:** Deep stone-950 slate canvas with stone-900 cards and subtle ambient glows.
3. **System:** Automatically tracks the user's OS / browser color scheme (`prefers-color-scheme: dark`).

**Controls:**

- **Admin:** Configurable via `/admin/settings` Appearance section.
- **Client:** Configurable via compact `<ThemeToggle />` popover directly in the top navigation bar.

**Persistence & Anti-FOUC:**

- Selection is persisted to `localStorage` under `taskora-theme`.
- Synchronized before React hydration via an inline `<head>` script in `app/layout.tsx` to prevent theme flash (FOUC).
- Tailwind v4 `@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *, .dark, .dark *));` activates all dark styling seamlessly.
