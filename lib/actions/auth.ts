'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signupSchema,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type SignupInput,
} from '@/lib/validation/auth';
import {
  checkLoginRateLimit,
  checkSignupRateLimit,
} from '@/lib/rate-limit/rate-limiter';
import type { Database } from '@/lib/supabase/database.types';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimited?: boolean;
}

export interface SignupResultData {
  redirectTo?: string;
  requiresVerification: boolean;
  email?: string;
}

/**
 * Public registration for new Taskora Workspace Owners.
 * Provisions Auth user, Profile, Workspace, and Owner Membership in an atomic transaction.
 */
export async function registerOwner(
  input: SignupInput,
): Promise<ActionResult<SignupResultData>> {
  // 1. Input Validation
  const validation = signupSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message || 'Invalid registration data.',
    };
  }

  const { fullName, email, workspaceName, password } = validation.data;

  // 2. Rate Limiting Check (5 attempts / 1 hour per IP + email)
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : '127.0.0.1';
  const rateLimitKey = `${clientIp}:${email.toLowerCase()}`;

  const rateLimitResult = await checkSignupRateLimit(rateLimitKey);
  if (!rateLimitResult.success) {
    return {
      success: false,
      error:
        'Too many registration attempts. Please wait 1 hour before trying again.',
      rateLimited: true,
    };
  }

  // 3. Generate base slug candidate
  const baseSlug =
    workspaceName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workspace';

  const origin =
    process.env.APP_URL || headerList.get('origin') || 'http://localhost:3000';

  const supabase = await createClient();

  // 4. Create Supabase Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        workspace_name: workspaceName,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/admin/dashboard`,
    },
  });

  const existingAccountMsg =
    "We couldn't create this workspace. If you already have a Taskora account, sign in or reset your password.";

  if (authError || !authData.user) {
    const errorMsg = authError?.message || 'Failed to create account.';
    // Generic anti-enumeration error for already registered accounts or existing identity conflicts
    if (
      errorMsg.toLowerCase().includes('already registered') ||
      errorMsg.toLowerCase().includes('already exists') ||
      errorMsg.toLowerCase().includes('identity')
    ) {
      return {
        success: false,
        error: existingAccountMsg,
      };
    }
    return {
      success: false,
      error: errorMsg,
    };
  }

  // Supabase GoTrue returns user with empty identities if user already exists
  if (authData.user.identities && authData.user.identities.length === 0) {
    return {
      success: false,
      error: existingAccountMsg,
    };
  }

  const userId = authData.user.id;
  const adminClient = createAdminClient();

  // 5. Atomic Workspace Initialization via Postgres RPC
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcData, error: rpcError } = await (adminClient.rpc as any)(
      'create_workspace_for_owner',
      {
        p_user_id: userId,
        p_full_name: fullName,
        p_email: email,
        p_workspace_name: workspaceName,
        p_workspace_slug: baseSlug,
      },
    );

    if (rpcError || !rpcData) {
      console.error('[Signup Workspace RPC Error]', rpcError);
      // Cleanup created auth user to avoid partial state
      await adminClient.auth.admin.deleteUser(userId);

      // If the RPC error indicates the profile already existed or was an existing client profile, return safe anti-enumeration message
      const rpcErrorMsg = (rpcError?.message || '').toLowerCase();
      if (
        rpcErrorMsg.includes('existing client profile') ||
        rpcErrorMsg.includes('unique constraint') ||
        rpcErrorMsg.includes('already exists') ||
        rpcErrorMsg.includes('duplicate key')
      ) {
        return {
          success: false,
          error: existingAccountMsg,
        };
      }

      return {
        success: false,
        error: 'Failed to initialize workspace. Please try registering again.',
      };
    }
  } catch (err) {
    console.error('[Signup Exception]', err);
    // Cleanup created auth user on exception
    try {
      await adminClient.auth.admin.deleteUser(userId);
    } catch {
      // Ignore cleanup error
    }
    return {
      success: false,
      error: 'An unexpected error occurred during workspace setup.',
    };
  }

  // 6. Check if email verification is required
  if (!authData.session) {
    return {
      success: true,
      data: {
        requiresVerification: true,
        email,
      },
    };
  }

  return {
    success: true,
    data: {
      requiresVerification: false,
      redirectTo: '/admin/dashboard',
    },
  };
}

export async function loginUser(
  input: LoginInput,
): Promise<ActionResult<{ redirectTo: string }>> {
  // 1. Input Validation
  const validation = loginSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input provided.',
    };
  }

  const { email, password } = validation.data;

  // 2. Rate Limiting Check (5 attempts / 15 min per IP + email)
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : '127.0.0.1';
  const rateLimitKey = `${clientIp}:${email.toLowerCase()}`;

  const rateLimitResult = await checkLoginRateLimit(rateLimitKey);
  if (!rateLimitResult.success) {
    return {
      success: false,
      error:
        'Too many login attempts. Please wait 15 minutes before trying again.',
      rateLimited: true,
    };
  }

  // 3. Supabase Auth Sign In
  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error: 'Invalid email or password. Please verify and try again.',
    };
  }

  const userId = authData.user.id;

  // 4. Query Profile Role
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  const profile = profileData as {
    role: Database['public']['Tables']['profiles']['Row']['role'];
  } | null;

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'User profile not found. Please contact your administrator.',
    };
  }

  // 5. Role-Based Destination & Client Status Check
  if (profile.role === 'admin') {
    return {
      success: true,
      data: { redirectTo: '/admin/dashboard' },
    };
  }

  if (profile.role === 'client') {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('active')
      .eq('profile_id', userId)
      .maybeSingle();

    const clientRecord = clientData as {
      active: Database['public']['Tables']['clients']['Row']['active'];
    } | null;

    if (clientError || !clientRecord) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Client profile record not found.',
      };
    }

    if (!clientRecord.active) {
      // Deactivated Client: immediately sign out and reject
      await supabase.auth.signOut();
      return {
        success: false,
        error:
          'Your client account has been deactivated. Please contact your administrator.',
      };
    }

    return {
      success: true,
      data: { redirectTo: '/portal/jobs' },
    };
  }

  // Fallback if unexpected role
  await supabase.auth.signOut();
  return {
    success: false,
    error: 'Unrecognized user role.',
  };
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<ActionResult<{ message: string }>> {
  // 1. Input validation
  const validation = forgotPasswordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid email provided.',
    };
  }

  const { email } = validation.data;

  // 2. Rate Limiting Check (5 attempts / 15 min per IP + email)
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : '127.0.0.1';
  const rateLimitKey = `reset:${clientIp}:${email.toLowerCase()}`;

  const rateLimitResult = await checkLoginRateLimit(rateLimitKey);
  if (!rateLimitResult.success) {
    return {
      success: false,
      error:
        'Too many password reset attempts. Please wait 15 minutes before trying again.',
      rateLimited: true,
    };
  }

  // 3. Supabase Auth reset password request
  const origin =
    process.env.APP_URL || headerList.get('origin') || 'http://localhost:3000';
  const supabase = await createClient();

  // Always proceed silently on error or success to prevent email enumeration
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return {
    success: true,
    data: {
      message:
        'If an account exists with that email, a password reset link has been sent.',
    },
  };
}

export async function updateUserPassword(
  input: ResetPasswordInput,
): Promise<ActionResult<{ redirectTo: string }>> {
  // 1. Input validation
  const validation = resetPasswordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message || 'Invalid password provided.',
    };
  }

  const { password } = validation.data;

  // 2. Supabase Auth update user password
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message || 'Failed to update password. Please try again.',
    };
  }

  // Sign out after reset to ensure clean subsequent authentication
  await supabase.auth.signOut();

  return {
    success: true,
    data: {
      redirectTo: '/login?reset=success',
    },
  };
}

export async function logoutUser(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
