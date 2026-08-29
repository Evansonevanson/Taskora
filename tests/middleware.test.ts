import { describe, it, expect } from 'vitest';
import type { UserRole } from '@/lib/supabase/database.types';

interface MiddlewareUser {
  id: string;
  role: UserRole;
  isActiveClient?: boolean;
}

interface MiddlewareRouteDecision {
  action: 'next' | 'redirect';
  redirectUrl?: string;
  forceSignOut?: boolean;
}

/**
 * Pure simulation of the middleware routing logic in lib/supabase/middleware.ts
 */
function evaluateMiddlewareRoute(
  pathname: string,
  user: MiddlewareUser | null,
): MiddlewareRouteDecision {
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const isAdminRoute = pathname.startsWith('/admin');
  const isPortalRoute = pathname.startsWith('/portal');

  // 1. Unauthenticated User
  if (!user) {
    if (isAdminRoute || isPortalRoute) {
      return {
        action: 'redirect',
        redirectUrl: `/login?next=${encodeURIComponent(pathname)}`,
      };
    }
    return { action: 'next' };
  }

  // 2. Client Role
  if (user.role === 'client') {
    if (user.isActiveClient === false) {
      return {
        action: 'redirect',
        redirectUrl: '/login?error=deactivated',
        forceSignOut: true,
      };
    }
    if (isAdminRoute) {
      return {
        action: 'redirect',
        redirectUrl: '/portal',
      };
    }
    if (isAuthRoute || pathname === '/') {
      return {
        action: 'redirect',
        redirectUrl: '/portal',
      };
    }
    return { action: 'next' };
  }

  // 3. Admin Role
  if (user.role === 'admin') {
    if (isPortalRoute) {
      return {
        action: 'redirect',
        redirectUrl: '/admin/dashboard',
      };
    }
    if (isAuthRoute || pathname === '/') {
      return {
        action: 'redirect',
        redirectUrl: '/admin/dashboard',
      };
    }
    return { action: 'next' };
  }

  return { action: 'next' };
}

describe('Protected Route Middleware Invariant Tests', () => {
  const adminUser: MiddlewareUser = {
    id: 'admin-1',
    role: 'admin',
  };

  const activeClientUser: MiddlewareUser = {
    id: 'client-1',
    role: 'client',
    isActiveClient: true,
  };

  const deactivatedClientUser: MiddlewareUser = {
    id: 'client-deactivated',
    role: 'client',
    isActiveClient: false,
  };

  describe('Unauthenticated Visitor Routing', () => {
    it('redirects unauthenticated user from /admin/dashboard to /login with next param', () => {
      const decision = evaluateMiddlewareRoute('/admin/dashboard', null);
      expect(decision.action).toBe('redirect');
      expect(decision.redirectUrl).toBe('/login?next=%2Fadmin%2Fdashboard');
    });

    it('redirects unauthenticated user from /portal to /login with next param', () => {
      const decision = evaluateMiddlewareRoute('/portal', null);
      expect(decision.action).toBe('redirect');
      expect(decision.redirectUrl).toBe('/login?next=%2Fportal');
    });

    it('allows unauthenticated user to access /login', () => {
      const decision = evaluateMiddlewareRoute('/login', null);
      expect(decision.action).toBe('next');
    });

    it('allows unauthenticated user to access /forgot-password', () => {
      const decision = evaluateMiddlewareRoute('/forgot-password', null);
      expect(decision.action).toBe('next');
    });
  });

  describe('Client Role Routing', () => {
    it('allows active client to access /portal', () => {
      const decision = evaluateMiddlewareRoute('/portal', activeClientUser);
      expect(decision.action).toBe('next');
    });

    it('allows active client to access /portal/jobs/job-123', () => {
      const decision = evaluateMiddlewareRoute(
        '/portal/jobs/job-123',
        activeClientUser,
      );
      expect(decision.action).toBe('next');
    });

    it('redirects client attempting to access /admin/dashboard to /portal', () => {
      const decision = evaluateMiddlewareRoute(
        '/admin/dashboard',
        activeClientUser,
      );
      expect(decision.action).toBe('redirect');
      expect(decision.redirectUrl).toBe('/portal');
    });

    it('redirects authenticated client visiting /login to /portal', () => {
      const decision = evaluateMiddlewareRoute('/login', activeClientUser);
      expect(decision.action).toBe('redirect');
      expect(decision.redirectUrl).toBe('/portal');
    });

    it('clears session and redirects deactivated client to /login?error=deactivated', () => {
      const decision = evaluateMiddlewareRoute(
        '/portal',
        deactivatedClientUser,
      );
      expect(decision.action).toBe('redirect');
      expect(decision.redirectUrl).toBe('/login?error=deactivated');
      expect(decision.forceSignOut).toBe(true);
    });
  });

  describe('Admin Role Routing', () => {
    it('allows admin to access /admin/dashboard', () => {
      const decision = evaluateMiddlewareRoute('/admin/dashboard', adminUser);
      expect(decision.action).toBe('next');
    });

    it('allows admin to access /admin/clients', () => {
      const decision = evaluateMiddlewareRoute('/admin/clients', adminUser);
      expect(decision.action).toBe('next');
    });

    it('redirects admin attempting to access /portal to /admin/dashboard', () => {
      const decision = evaluateMiddlewareRoute('/portal', adminUser);
      expect(decision.action).toBe('redirect');
      expect(decision.redirectUrl).toBe('/admin/dashboard');
    });

    it('redirects authenticated admin visiting /login to /admin/dashboard', () => {
      const decision = evaluateMiddlewareRoute('/login', adminUser);
      expect(decision.action).toBe('redirect');
      expect(decision.redirectUrl).toBe('/admin/dashboard');
    });
  });
});
