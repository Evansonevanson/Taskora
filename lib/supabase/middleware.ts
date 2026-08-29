import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[],
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 1. Refreshes the auth token if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Helper to preserve cookies across Next.js redirects
  const createRedirect = (targetUrl: URL | string): NextResponse => {
    const url =
      typeof targetUrl === 'string'
        ? new URL(targetUrl, request.url)
        : targetUrl;
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isAdminRoute = pathname.startsWith('/admin');
  const isPortalRoute = pathname.startsWith('/portal');

  // 2. Unauthenticated User Handling
  if (!user) {
    if (isAdminRoute || isPortalRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return createRedirect(loginUrl);
    }
    return supabaseResponse;
  }

  // 3. Authenticated User Handling: Check Role & Status
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as {
    role: Database['public']['Tables']['profiles']['Row']['role'];
  } | null;

  if (!profile) {
    // Missing profile -> force sign out and redirect to login
    await supabase.auth.signOut();
    const loginUrl = new URL('/login', request.url);
    return createRedirect(loginUrl);
  }

  // Handle Client Role
  if (profile.role === 'client') {
    const { data: clientData } = await supabase
      .from('clients')
      .select('active')
      .eq('profile_id', user.id)
      .maybeSingle();

    const clientRecord = clientData as {
      active: Database['public']['Tables']['clients']['Row']['active'];
    } | null;

    if (!clientRecord || !clientRecord.active) {
      // Deactivated client -> clear session and redirect with error
      await supabase.auth.signOut();
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'deactivated');
      return createRedirect(loginUrl);
    }

    // Client attempting to access Admin route -> redirect to portal
    if (isAdminRoute) {
      return createRedirect('/portal');
    }

    // Authenticated client visiting auth page or root -> redirect to portal
    if (isAuthRoute || pathname === '/') {
      return createRedirect('/portal');
    }

    return supabaseResponse;
  }

  // Handle Admin Role
  if (profile.role === 'admin') {
    // Admin attempting to access Client portal -> redirect to admin dashboard
    if (isPortalRoute) {
      return createRedirect('/admin/dashboard');
    }

    // Authenticated admin visiting auth page or root -> redirect to admin dashboard
    if (isAuthRoute || pathname === '/') {
      return createRedirect('/admin/dashboard');
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}
