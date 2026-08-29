import { describe, it, expect } from 'vitest';
import { createClientSchema } from '@/lib/validation/client';
import { generateClientInviteEmailHtml } from '@/lib/email/templates/client-invite';

describe('Client Provisioning Flow & Validation', () => {
  it('validates valid client creation input', () => {
    const validData = {
      displayName: 'Clark Kent',
      companyName: 'Daily Planet',
      email: 'clark@dailyplanet.com',
      fullName: 'Clark Joseph Kent',
      temporaryPassword: 'SuperSecret123!',
      sendInviteEmail: true,
    };

    const result = createClientSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('clark@dailyplanet.com');
      expect(result.data.displayName).toBe('Clark Kent');
      expect(result.data.companyName).toBe('Daily Planet');
    }
  });

  it('normalizes uppercase email addresses to lowercase', () => {
    const data = {
      displayName: 'Arthur Curry',
      email: 'ARTHUR@ATLANTIS.GOV',
    };

    const result = createClientSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('arthur@atlantis.gov');
    }
  });

  it('rejects invalid email addresses and empty display names', () => {
    const invalidEmail = {
      displayName: 'Barry Allen',
      email: 'not-an-email',
    };
    expect(createClientSchema.safeParse(invalidEmail).success).toBe(false);

    const emptyName = {
      displayName: '   ',
      email: 'barry@centralcity.gov',
    };
    expect(createClientSchema.safeParse(emptyName).success).toBe(false);
  });

  it('enforces minimum 8 character password when temporary password is provided', () => {
    const shortPassword = {
      displayName: 'Hal Jordan',
      email: 'hal@ferris.com',
      temporaryPassword: 'short',
    };
    expect(createClientSchema.safeParse(shortPassword).success).toBe(false);

    const validPassword = {
      displayName: 'Hal Jordan',
      email: 'hal@ferris.com',
      temporaryPassword: 'validPassword123!',
    };
    expect(createClientSchema.safeParse(validPassword).success).toBe(true);

    const emptyPassword = {
      displayName: 'Hal Jordan',
      email: 'hal@ferris.com',
      temporaryPassword: '',
    };
    expect(createClientSchema.safeParse(emptyPassword).success).toBe(true);
  });

  it('generates a valid client invite email with credentials and portal link', () => {
    const emailData = {
      clientName: 'Victor Stone',
      email: 'victor@star-labs.com',
      temporaryPassword: 'CyberneticPassword123!',
      appUrl: 'https://taskora.app',
    };

    const html = generateClientInviteEmailHtml(emailData);

    expect(html).toContain('Victor Stone');
    expect(html).toContain('victor@star-labs.com');
    expect(html).toContain('CyberneticPassword123!');
    expect(html).toContain('https://taskora.app/login');
    expect(html).toContain('Welcome to your Client Portal');
    expect(html).toContain('Taskora');
  });
});
