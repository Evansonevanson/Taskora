'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validation/auth';
import { checkLoginRateLimit } from '@/lib/rate-limit/rate-limiter';
import type { Database } from '@/lib/supabase/database.types';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimited?: boolean;
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
      data: { redirectTo: '/portal' },
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
