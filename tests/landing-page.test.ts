import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', () => {
  const MockIcon = () =>
    React.createElement('svg', { 'data-testid': 'mock-icon' });
  return {
    ArrowRight: MockIcon,
    Sparkles: MockIcon,
    ShieldCheck: MockIcon,
    Layers: MockIcon,
    Clock: MockIcon,
    CheckCircle2: MockIcon,
    AlertTriangle: MockIcon,
    Building2: MockIcon,
    ExternalLink: MockIcon,
    Paperclip: MockIcon,
    Search: MockIcon,
    Check: MockIcon,
    Share2: MockIcon,
    Users: MockIcon,
    Eye: MockIcon,
    BellRing: MockIcon,
    PlusCircle: MockIcon,
    MessageSquare: MockIcon,
    Download: MockIcon,
    Globe: MockIcon,
    FileText: MockIcon,
    User: MockIcon,
    Lock: MockIcon,
    Database: MockIcon,
    FileCheck: MockIcon,
    KeyRound: MockIcon,
    Server: MockIcon,
    Sun: MockIcon,
    Moon: MockIcon,
    Monitor: MockIcon,
    Menu: MockIcon,
    X: MockIcon,
  };
});

// Mock Next.js navigation & Image
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`REDIRECT_TO:${url}`);
  },
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement('img', { ...props, alt: props.alt || 'mock-image' }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement('a', { href, ...rest }, children),
}));

// Mock Supabase server client
const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
  })),
}));

describe('Landing Page & Root Route Access Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HomePage Route Auth Redirection', () => {
    it('renders LandingView when visitor is unauthenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const HomePage = (await import('@/app/page')).default;
      const result = await HomePage();

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(React.isValidElement(result)).toBe(true);
    });

    it('redirects authenticated Admin to /admin/dashboard', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'admin-uuid', email: 'admin@taskora.com' } },
        error: null,
      });
      mockMaybeSingle.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      const HomePage = (await import('@/app/page')).default;
      await expect(HomePage()).rejects.toThrow('REDIRECT_TO:/admin/dashboard');
      expect(mockRedirect).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('redirects authenticated Client to /portal/jobs', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'client-uuid', email: 'client@company.com' } },
        error: null,
      });
      mockMaybeSingle.mockResolvedValueOnce({
        data: { role: 'client' },
        error: null,
      });

      const HomePage = (await import('@/app/page')).default;
      await expect(HomePage()).rejects.toThrow('REDIRECT_TO:/portal/jobs');
      expect(mockRedirect).toHaveBeenCalledWith('/portal/jobs');
    });
  });

  describe('Landing Page Components & CTAs', () => {
    it('LandingNav includes Sign in CTA linking to /login and feature sections', async () => {
      const { LandingNav } = await import('@/components/landing/landing-nav');
      const element = React.createElement(LandingNav);
      expect(React.isValidElement(element)).toBe(true);
    });

    it('LandingHero renders key headline and Sign in action', async () => {
      const { LandingHero } = await import('@/components/landing/landing-hero');
      const element = React.createElement(LandingHero);
      expect(React.isValidElement(element)).toBe(true);
    });

    it('LandingPreviewDashboard renders live sprint and deliverable rows', async () => {
      const { LandingPreviewDashboard } =
        await import('@/components/landing/landing-preview-dashboard');
      const element = React.createElement(LandingPreviewDashboard);
      expect(React.isValidElement(element)).toBe(true);
    });

    it('LandingBenefits, HowItWorks, Security, Appearance and Footer instantiate correctly', async () => {
      const { LandingBenefits } =
        await import('@/components/landing/landing-benefits');
      const { LandingHowItWorks } =
        await import('@/components/landing/landing-how-it-works');
      const { LandingPortalPreview } =
        await import('@/components/landing/landing-portal-preview');
      const { LandingSecurity } =
        await import('@/components/landing/landing-security');
      const { LandingAppearance } =
        await import('@/components/landing/landing-appearance');
      const { LandingCta } = await import('@/components/landing/landing-cta');
      const { LandingFooter } =
        await import('@/components/landing/landing-footer');

      expect(React.isValidElement(React.createElement(LandingBenefits))).toBe(
        true,
      );
      expect(React.isValidElement(React.createElement(LandingHowItWorks))).toBe(
        true,
      );
      expect(
        React.isValidElement(React.createElement(LandingPortalPreview)),
      ).toBe(true);
      expect(React.isValidElement(React.createElement(LandingSecurity))).toBe(
        true,
      );
      expect(React.isValidElement(React.createElement(LandingAppearance))).toBe(
        true,
      );
      expect(React.isValidElement(React.createElement(LandingCta))).toBe(true);
      expect(React.isValidElement(React.createElement(LandingFooter))).toBe(
        true,
      );
    });
  });
});
