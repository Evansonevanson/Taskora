export interface CategoryItem {
  id: string;
  name: string;
  label: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'stone';
  isSystem: boolean;
}

export interface AdminSettingsState {
  categories: CategoryItem[];
  defaultNotifyClient: boolean;
  confirmBeforeCompleting: boolean;
}

export const DEFAULT_SYSTEM_CATEGORIES: CategoryItem[] = [
  {
    id: 'work',
    name: 'work',
    label: 'Work (Client)',
    color: 'indigo',
    isSystem: true,
  },
  {
    id: 'general',
    name: 'general',
    label: 'General',
    color: 'stone',
    isSystem: true,
  },
  {
    id: 'personal',
    name: 'personal',
    label: 'Personal',
    color: 'emerald',
    isSystem: true,
  },
  {
    id: 'urgent',
    name: 'urgent',
    label: 'Urgent',
    color: 'rose',
    isSystem: true,
  },
  {
    id: 'shopping',
    name: 'shopping',
    label: 'Shopping',
    color: 'amber',
    isSystem: true,
  },
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsState = {
  categories: DEFAULT_SYSTEM_CATEGORIES,
  defaultNotifyClient: true,
  confirmBeforeCompleting: true,
};
