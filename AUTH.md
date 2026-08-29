# AUTH.md — Authentication Implementation

## Provider

Supabase Auth, email + password strategy. No social login, no magic links in MVP (magic links are a reasonable Phase 2 addition since clients don't self-register).

## Account Provisioning

- **No public signup.** There is no `/signup` route.
- Admin account: created once, directly in Supabase (or via a one-time seed script), before the app goes live.
- Client accounts: created **by the Admin**, via `Clients → New Client` in the Admin UI. This flow:
  1. Admin enters client name, company (optional), and email.
  2. Server Action calls `supabase.auth.admin.createUser()` using the **service-role key** (server-side only) to create the `auth.users` row with a temporary password or invite link.
  3. A corresponding `profiles` row (`role = 'client'`) and `clients` row are created in the same transaction/flow.
  4. Client receives an email (via Supabase's invite flow or a custom Resend email) with a link to set their password and log in.

## Session Handling

- Use `@supabase/ssr` for cookie-based session management across Server Components, Server Actions, and middleware.
- Sessions are httpOnly cookies; no tokens stored in `localStorage`.
- Session refresh handled automatically by the Supabase SSR helpers in middleware.

## Login Flow

1. Single `/login` page — no separate Admin/Client login screens.
2. User submits email + password.
3. On success, middleware/server reads the user's `profiles.role` and redirects:
   - `role = 'admin'` → `/admin/dashboard`
   - `role = 'client'` → `/portal/jobs`
4. On failure, show a generic "Invalid email or password" message — never reveal whether the email exists (prevents user enumeration).

## Rate Limiting on Auth

Login attempts are rate-limited per `SECURITY.md` §Rate Limiting: max 5 attempts per email+IP combination per 15 minutes, with exponential backoff messaging. This is enforced in the Server Action handling login, before calling Supabase, using the Upstash limiter.

## Password Requirements

- Minimum 10 characters.
- Enforce via Supabase Auth password policy settings + Zod validation on any password-set/reset form.

## Password Reset

- Standard Supabase "forgot password" flow: user requests reset → email with time-limited link → sets new password.
- Reset link expiry: 1 hour (Supabase default is acceptable; do not extend it).

## Deactivating a Client

- Admin can set `clients.active = false`.
- Middleware/Server Actions check `clients.active` on every Client-role request; if `false`, the session is treated as unauthorized and the user is signed out and shown a "This account has been deactivated" message. This is in addition to (not instead of) RLS checks.

## What Agents Must Not Do

- Never store or log plaintext passwords.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to any client-rendered code path — it is only used inside Server Actions for the client-provisioning flow above.
- Never build a client self-registration path without explicit product sign-off — it's a deliberate MVP constraint (see `PRODUCT.md`).
- Never skip the role-based redirect check — a Client must never be able to land on `/admin/dashboard` even by direct URL entry (middleware must enforce this; see `RBAC.md`).
