# DESIGN-SYSTEM.md — Colors, Typography, Spacing, Components

This defines the visual language for Taskora. Implement as Tailwind config tokens + CSS variables so both Admin and Client views stay visually consistent, with the Client view using a slightly quieter/lighter treatment per `UI-UX.md`.

## Brand Feel

Clean, modern, professional-but-approachable productivity tool — think "Linear meets a client portal," not a generic admin template. Avoid default shadcn gray-on-white monotony; commit to one confident accent color and use it consistently for primary actions and progress indicators.

## Color Tokens

| Token | Usage | Example value (adjust to taste) |
|---|---|---|
| `--color-primary` | Primary buttons, active nav, progress bar fill | Indigo `#4F46E5` |
| `--color-primary-hover` | Hover state | `#4338CA` |
| `--color-bg` | App background | `#FAFAFA` (light) |
| `--color-surface` | Cards, modals | `#FFFFFF` |
| `--color-border` | Dividers, card borders | `#E5E7EB` |
| `--color-text-primary` | Headings, body text | `#111827` |
| `--color-text-secondary` | Muted labels, metadata | `#6B7280` |
| `--color-success` | Completed status, positive states | `#16A34A` |
| `--color-warning` | `needs_revision` banner, medium priority | `#D97706` |
| `--color-danger` | High priority, destructive actions | `#DC2626` |
| `--color-info` | General/neutral badges | `#2563EB` |

### Priority Color Mapping
- High → `--color-danger`
- Medium → `--color-warning`
- Low → `--color-text-secondary` (deliberately muted — don't over-color low-priority items)

### Category Badge Colors (suggested, keep distinct and consistent)
- General → neutral gray
- Work → `--color-primary` tint
- Personal → teal
- Urgent → `--color-danger`
- Shopping → amber/yellow

## Typography

| Role | Font | Weight/Size |
|---|---|---|
| Font family | Inter (or system-ui fallback) | — |
| Page titles | 24–28px | Semibold (600) |
| Section headings | 18–20px | Semibold (600) |
| Body text | 14–16px | Regular (400) |
| Metadata/labels | 12–13px | Medium (500), `--color-text-secondary` |
| Stat card numbers | 28–32px | Bold (700) |

## Spacing Scale

Use Tailwind's default spacing scale (4px base unit). Standard component padding: `p-4` to `p-6` for cards, `gap-4` between grid items, `gap-2` for tightly related inline elements (icon + label).

## Components (via shadcn/ui, themed to tokens above)

- **Button:** primary (filled, `--color-primary`), secondary (outline), destructive (red, for delete/deactivate/archive actions), ghost (for low-emphasis actions like "Cancel").
- **Badge:** used for category, priority, and status — pill-shaped, colored per mapping above, always paired with a text label (never color alone).
- **Card:** used for stat cards, task cards, client cards, job cards — consistent border-radius (`rounded-lg`), subtle shadow (`shadow-sm`), `--color-surface` background.
- **Modal/Dialog:** used for New Task, confirmations, client creation — centered, backdrop dim, focus-trapped.
- **Progress bar:** rounded-full track, `--color-primary` fill, animated transition on value change, percentage label to the right or overlaid.
- **Dropdown/Select:** used for Category, Client, Priority, Sort — consistent height/padding across all instances.
- **Toast/inline alert:** used for Server Action success/error feedback (e.g., "Task created," "That email is already in use").

## Layout

- **Admin dashboard:** max-width container (`~1200px`), stat cards in a responsive grid (4 columns desktop → 2 → 1 on mobile), task list full-width below.
- **Client portal:** narrower max-width (`~800px`) — reinforces the simpler, focused feel described in `UI-UX.md`.
- **Sidebar/nav:** simple top nav for MVP (Dashboard / Clients / Settings for Admin; My Jobs only, effectively, for Client) — a full sidebar is unnecessary complexity at this scope.

## Iconography

`lucide-react` throughout, consistent stroke width (default 2px). Suggested icon mapping:
- Total tasks → `ListTodo`
- Pending → `Clock`
- Completed → `CheckCircle2`
- High Priority → `AlertTriangle`
- Comments → `MessageSquare`
- Clients → `Users`
- Settings → `Settings`

## Dark Mode

Not required for MVP (see `FEATURES.md` Phase 2), but define color tokens as CSS variables now so adding a dark theme later doesn't require re-touching every component.
