# AUTH.md — Authentication Implementation

## Provider

Supabase Auth, email + password strategy. Cookie-based sessions via `@supabase/ssr`.

## Multi-Tenant Authorization Architecture

Taskora authorization is strictly workspace-scoped:

- Authenticated user identity maps to `public.profiles`.
- Permissions are determined by the user's membership and role in `public.workspace_members` for their active workspace (`owner`, `admin`, or `client`).
- Workspace context is resolved server-side on every request.

## Account Provisioning & Workspace Lifecycle

### 1. Workspace Owner (Public Self-Registration)

- **Public Route:** `/signup` is available exclusively for new Workspace Owners.
- **Fields:** Full Name, Work Email, Workspace / Business Name, Password (min. 10 chars), Confirm Password.
- **Provisioning Flow:**
  1. User submits signup form.
  2. Input validated via `signupSchema` (email format, trimmed names, password length >= 10, password confirmation match).
  3. Rate limiting enforced: max 5 signup attempts per hour per IP/email.
  4. User created in Supabase Auth via `supabase.auth.signUp()`.
  5. Transactional Postgres RPC `public.create_workspace_for_owner` creates Profile, generates collision-safe unique slug, creates Workspace, and binds user as `role = 'owner'` in `public.workspace_members`.
  6. On successful session creation, user is routed to `/admin/dashboard`. If email confirmation is required, user is directed to check their inbox.
  7. If database initialization fails, auth user is rolled back immediately to prevent partial state.

### 2. Client Accounts (Strictly Invited by Workspace Admin)

- **Clients NEVER self-register.** Client accounts are created exclusively by the Workspace Admin via `/admin/clients`.
- Provisioning Flow:
  1. Workspace Admin enters client name, company (optional), and email.
  2. Server Action validates workspace admin permissions for the active workspace.
  3. Server Action calls `supabase.auth.admin.createUser()` with temporary credentials.
  4. Corresponding `profiles`, `clients`, and `workspace_members` (role = `'client'`) records are created atomically, permanently tied to the inviting workspace.
  5. Client receives an email with login credentials and a link to `/portal/jobs`.

## Session Handling

- Use `@supabase/ssr` for cookie-based session management across Server Components, Server Actions, and middleware.
- Sessions are httpOnly cookies; no tokens stored in `localStorage`.
- Session refresh handled automatically by Supabase SSR middleware.

## Login Flow

1. Single `/login` page — no separate Admin/Client login screens.
2. User submits email + password.
3. On success, server/middleware resolves the user's role and workspace membership:
   - Workspace Admin / Owner → `/admin/dashboard`
   - Workspace Client → `/portal/jobs`
4. On failure, generic "Invalid email or password" error is returned to prevent email enumeration.

## Rate Limiting on Auth

Login attempts are rate-limited per `SECURITY.md`: max 5 attempts per email+IP combination per 15 minutes.

## Deactivating a Client

- Workspace Admin can set `clients.active = false`.
- Deactivated clients are rejected in middleware and server actions, forced to sign out with a clear account deactivated notice.
