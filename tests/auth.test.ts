import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validation/auth';
import { checkLoginRateLimit } from '@/lib/rate-limit/rate-limiter';

describe('Authentication Validation & Rate Limiting Tests', () => {
  describe('loginSchema Validation', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'admin@taskora.com',
        password: 'ValidPassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('valid email');
      }
    });

    it('rejects passwords shorter than 6 characters', () => {
      const result = loginSchema.safeParse({
        email: 'admin@taskora.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'at least 6 characters',
        );
      }
    });

    it('rejects missing fields', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema Validation', () => {
    it('accepts valid email for password reset', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'client@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email for password reset', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema Validation', () => {
    it('accepts valid matching passwords of at least 8 characters', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Passwords do not match');
      }
    });

    it('rejects passwords shorter than 8 characters', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'Short7!',
        confirmPassword: 'Short7!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          'at least 8 characters',
        );
      }
    });
  });

  describe('Rate Limiter Invariant Tests', () => {
    const testIpKey = `test-ip-${Date.now()}:user@example.com`;

    it('enforces 5 attempts per window on login attempts', async () => {
      // 1st to 5th attempts should succeed
      for (let i = 1; i <= 5; i++) {
        const res = await checkLoginRateLimit(testIpKey);
        expect(res.success).toBe(true);
      }

      // 6th attempt must be blocked
      const blockedRes = await checkLoginRateLimit(testIpKey);
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.remaining).toBe(0);
    });
  });
});
