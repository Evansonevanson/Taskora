'use client';

import * as React from 'react';
import { SettingsHeader } from './settings-header';
import { AdminProfileCard } from './admin-profile-card';
import { NotificationPreferencesCard } from './notification-preferences-card';
import { CategoryManagementCard } from './category-management-card';
import {
  type CategoryItem,
  DEFAULT_SYSTEM_CATEGORIES,
} from '@/lib/data/settings';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsViewProps {
  userEmail: string;
  userName: string;
}

const STORAGE_KEYS = {
  NOTIFY_CLIENT: 'taskora_setting_default_notify_client',
  CONFIRM_COMPLETION: 'taskora_setting_confirm_completion',
  CUSTOM_CATEGORIES: 'taskora_setting_custom_categories',
};

export function SettingsView({ userEmail, userName }: SettingsViewProps) {
  const [defaultNotifyClient, setDefaultNotifyClient] = React.useState<boolean>(
    () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.NOTIFY_CLIENT);
          if (stored !== null) return stored === 'true';
        } catch {}
      }
      return true;
    },
  );

  const [confirmBeforeCompleting, setConfirmBeforeCompleting] =
    React.useState<boolean>(() => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.CONFIRM_COMPLETION);
          if (stored !== null) return stored === 'true';
        } catch {}
      }
      return true;
    });

  const [categories, setCategories] = React.useState<CategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCats = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
        if (storedCats) {
          const parsed = JSON.parse(storedCats);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_SYSTEM_CATEGORIES;
  });

  const [savedAlert, setSavedAlert] = React.useState(false);

  const triggerSavedFeedback = () => {
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
    }, 2500);
  };

  const handleNotifyChange = (val: boolean) => {
    setDefaultNotifyClient(val);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFY_CLIENT, String(val));
    } catch {}
    triggerSavedFeedback();
  };

  const handleConfirmChange = (val: boolean) => {
    setConfirmBeforeCompleting(val);
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIRM_COMPLETION, String(val));
    } catch {}
    triggerSavedFeedback();
  };

  const handleAddCategory = (cat: CategoryItem) => {
    const next = [...categories, cat];
    setCategories(next);
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_CATEGORIES,
        JSON.stringify(next),
      );
    } catch {}
    triggerSavedFeedback();
  };

  const handleRemoveCategory = (catId: string) => {
    const next = categories.filter((c) => c.id !== catId);
    setCategories(next);
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_CATEGORIES,
        JSON.stringify(next),
      );
    } catch {}
    triggerSavedFeedback();
  };

  const handleResetDefaults = () => {
    setDefaultNotifyClient(true);
    setConfirmBeforeCompleting(true);
    setCategories(DEFAULT_SYSTEM_CATEGORIES);
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTIFY_CLIENT);
      localStorage.removeItem(STORAGE_KEYS.CONFIRM_COMPLETION);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    } catch {}
    triggerSavedFeedback();
  };

  return (
    <div className="space-y-6">
      <SettingsHeader />

      {savedAlert && (
        <div
          role="status"
          className="animate-in fade-in-50 flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        </div>
      )}

      <AdminProfileCard userEmail={userEmail} userName={userName} />

      <NotificationPreferencesCard
        defaultNotifyClient={defaultNotifyClient}
        onDefaultNotifyClientChange={handleNotifyChange}
        confirmBeforeCompleting={confirmBeforeCompleting}
        onConfirmBeforeCompletingChange={handleConfirmChange}
      />

      <CategoryManagementCard
        categories={categories}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
      />

      <div className="flex items-center justify-between border-t border-stone-800/80 pt-6">
        <div className="text-xs text-stone-500">
          Taskora Admin Configuration &bull; v1.0.0
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={handleResetDefaults}
          className="gap-1.5 text-xs text-stone-400 hover:text-stone-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset All Defaults</span>
        </Button>
      </div>
    </div>
  );
}
