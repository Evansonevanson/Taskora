'use client';

import * as React from 'react';
import { LandingNav } from './landing-nav';
import { LandingHero } from './landing-hero';
import { LandingBenefits } from './landing-benefits';
import { LandingHowItWorks } from './landing-how-it-works';
import { LandingPortalPreview } from './landing-portal-preview';
import { LandingSecurity } from './landing-security';
import { LandingAppearance } from './landing-appearance';
import { LandingCta } from './landing-cta';
import { LandingFooter } from './landing-footer';

export function LandingView() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-colors duration-150 selection:bg-indigo-500/30 selection:text-indigo-200">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingBenefits />
        <LandingHowItWorks />
        <LandingPortalPreview />
        <LandingSecurity />
        <LandingAppearance />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
