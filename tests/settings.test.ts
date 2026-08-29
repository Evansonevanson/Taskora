import { describe, it, expect } from 'vitest';
import {
  categorySchema,
  updateNotificationSettingsSchema,
} from '@/lib/validation/settings';
import {
  DEFAULT_SYSTEM_CATEGORIES,
  DEFAULT_ADMIN_SETTINGS,
  type CategoryItem,
} from '@/lib/data/settings';

describe('Settings & Category Management', () => {
  describe('Category Validation Schema', () => {
    it('accepts valid category definitions', () => {
      const valid = categorySchema.safeParse({
        name: 'marketing',
        label: 'Marketing Campaign',
        color: 'sky',
        isSystem: false,
      });

      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.name).toBe('marketing');
        expect(valid.data.color).toBe('sky');
      }
    });

    it('rejects category names shorter than 2 characters', () => {
      const invalid = categorySchema.safeParse({
        name: 'a',
        label: 'A',
        color: 'indigo',
        isSystem: false,
      });

      expect(invalid.success).toBe(false);
    });

    it('rejects category names with invalid symbols', () => {
      const invalid = categorySchema.safeParse({
        name: 'work@home!',
        label: 'Work Home',
        color: 'emerald',
        isSystem: false,
      });

      expect(invalid.success).toBe(false);
    });
  });

  describe('Notification Settings Schema', () => {
    it('accepts valid boolean preferences', () => {
      const valid = updateNotificationSettingsSchema.safeParse({
        defaultNotifyClient: false,
        confirmBeforeCompleting: true,
      });

      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.defaultNotifyClient).toBe(false);
        expect(valid.data.confirmBeforeCompleting).toBe(true);
      }
    });
  });

  describe('System Default Categories & Custom Category Mutations', () => {
    it('includes all 5 system default categories marked as isSystem', () => {
      expect(DEFAULT_SYSTEM_CATEGORIES).toHaveLength(5);
      const systemIds = DEFAULT_SYSTEM_CATEGORIES.map((c) => c.id);
      expect(systemIds).toContain('work');
      expect(systemIds).toContain('general');
      expect(systemIds).toContain('personal');
      expect(systemIds).toContain('urgent');
      expect(systemIds).toContain('shopping');

      DEFAULT_SYSTEM_CATEGORIES.forEach((cat) => {
        expect(cat.isSystem).toBe(true);
      });
    });

    it('allows adding and removing custom categories while preserving system defaults', () => {
      let categories: CategoryItem[] = [...DEFAULT_SYSTEM_CATEGORIES];

      const newCategory: CategoryItem = {
        id: 'engineering',
        name: 'engineering',
        label: 'Engineering & QA',
        color: 'purple',
        isSystem: false,
      };

      // Add custom category
      categories = [...categories, newCategory];
      expect(categories).toHaveLength(6);
      expect(categories.find((c) => c.id === 'engineering')?.label).toBe(
        'Engineering & QA',
      );

      // Remove custom category
      categories = categories.filter((c) => c.id !== 'engineering');
      expect(categories).toHaveLength(5);
      expect(categories.find((c) => c.id === 'engineering')).toBeUndefined();
    });

    it('verifies default settings state', () => {
      expect(DEFAULT_ADMIN_SETTINGS.defaultNotifyClient).toBe(true);
      expect(DEFAULT_ADMIN_SETTINGS.confirmBeforeCompleting).toBe(true);
      expect(DEFAULT_ADMIN_SETTINGS.categories).toHaveLength(5);
    });
  });
});
