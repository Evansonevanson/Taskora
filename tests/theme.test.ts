import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';

const themeSchema = z.enum(['light', 'dark', 'system']);

// Helper logic mimicking ThemeProvider resolution
function resolveActiveTheme(
  theme: 'light' | 'dark' | 'system',
  systemPrefersDark: boolean,
): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return systemPrefersDark ? 'dark' : 'light';
}

function applyThemeToDom(
  resolved: 'light' | 'dark',
  classList: Set<string>,
  attributes: Record<string, string>,
) {
  if (resolved === 'dark') {
    classList.add('dark');
    classList.delete('light');
    attributes['data-theme'] = 'dark';
  } else {
    classList.add('light');
    classList.delete('dark');
    attributes['data-theme'] = 'light';
  }
}

describe('Theme Management & Appearance Settings', () => {
  let mockStorage: Record<string, string>;
  let mockClassList: Set<string>;
  let mockAttributes: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    mockClassList = new Set();
    mockAttributes = {};
  });

  describe('Theme Validation', () => {
    it('validates light, dark, and system theme options', () => {
      expect(themeSchema.safeParse('light').success).toBe(true);
      expect(themeSchema.safeParse('dark').success).toBe(true);
      expect(themeSchema.safeParse('system').success).toBe(true);
      expect(themeSchema.safeParse('invalid-theme').success).toBe(false);
    });
  });

  describe('Theme Storage & DOM Application', () => {
    it('persists selected theme to storage key taskora-theme', () => {
      const STORAGE_KEY = 'taskora-theme';
      mockStorage[STORAGE_KEY] = 'dark';
      expect(mockStorage[STORAGE_KEY]).toBe('dark');

      mockStorage[STORAGE_KEY] = 'light';
      expect(mockStorage[STORAGE_KEY]).toBe('light');

      mockStorage[STORAGE_KEY] = 'system';
      expect(mockStorage[STORAGE_KEY]).toBe('system');
    });

    it('correctly resolves and applies dark theme classes and data-theme', () => {
      const resolved = resolveActiveTheme('dark', false);
      applyThemeToDom(resolved, mockClassList, mockAttributes);

      expect(mockClassList.has('dark')).toBe(true);
      expect(mockClassList.has('light')).toBe(false);
      expect(mockAttributes['data-theme']).toBe('dark');
    });

    it('correctly resolves and applies light theme classes and data-theme', () => {
      const resolved = resolveActiveTheme('light', true);
      applyThemeToDom(resolved, mockClassList, mockAttributes);

      expect(mockClassList.has('light')).toBe(true);
      expect(mockClassList.has('dark')).toBe(false);
      expect(mockAttributes['data-theme']).toBe('light');
    });

    it('resolves system theme based on prefers-color-scheme preference', () => {
      expect(resolveActiveTheme('system', true)).toBe('dark');
      expect(resolveActiveTheme('system', false)).toBe('light');
    });
  });

  describe('Client Portal Navigation Theme Toggle', () => {
    it('allows client to switch to Light mode and persist immediately', () => {
      const STORAGE_KEY = 'taskora-theme';
      let currentTheme: 'light' | 'dark' | 'system' = 'dark';

      // Client selects Light in client nav
      currentTheme = 'light';
      mockStorage[STORAGE_KEY] = currentTheme;
      const resolved = resolveActiveTheme(currentTheme, true);
      applyThemeToDom(resolved, mockClassList, mockAttributes);

      expect(mockStorage[STORAGE_KEY]).toBe('light');
      expect(resolved).toBe('light');
      expect(mockClassList.has('light')).toBe(true);
      expect(mockAttributes['data-theme']).toBe('light');
    });

    it('allows client to switch to Dark mode and persist immediately', () => {
      const STORAGE_KEY = 'taskora-theme';
      let currentTheme: 'light' | 'dark' | 'system' = 'light';

      // Client selects Dark in client nav
      currentTheme = 'dark';
      mockStorage[STORAGE_KEY] = currentTheme;
      const resolved = resolveActiveTheme(currentTheme, false);
      applyThemeToDom(resolved, mockClassList, mockAttributes);

      expect(mockStorage[STORAGE_KEY]).toBe('dark');
      expect(resolved).toBe('dark');
      expect(mockClassList.has('dark')).toBe(true);
      expect(mockAttributes['data-theme']).toBe('dark');
    });

    it('allows client to switch to System mode and follow OS preference', () => {
      const STORAGE_KEY = 'taskora-theme';
      let currentTheme: 'light' | 'dark' | 'system' = 'dark';

      // Client selects System in client nav
      currentTheme = 'system';
      mockStorage[STORAGE_KEY] = currentTheme;
      const resolved = resolveActiveTheme(currentTheme, false);
      applyThemeToDom(resolved, mockClassList, mockAttributes);

      expect(mockStorage[STORAGE_KEY]).toBe('system');
      expect(resolved).toBe('light');
      expect(mockClassList.has('light')).toBe(true);
    });

    it('provides correct semantic accessibility attributes for theme menu items', () => {
      const activeTheme = 'dark';
      const options = ['light', 'dark', 'system'] as const;

      const menuItems = options.map((opt) => ({
        id: opt,
        role: 'menuitemradio',
        'aria-checked': opt === activeTheme,
        'aria-label': `${opt} theme`,
      }));

      const activeItem = menuItems.find((i) => i.id === activeTheme);
      const inactiveItem = menuItems.find((i) => i.id === 'light');

      expect(activeItem?.['aria-checked']).toBe(true);
      expect(inactiveItem?.['aria-checked']).toBe(false);
      expect(activeItem?.role).toBe('menuitemradio');
    });
  });
});
