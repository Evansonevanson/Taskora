import * as React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SettingsView } from '@/components/settings/settings-view';

export const metadata: Metadata = {
  title: 'Settings | Taskora',
  description: 'Manage your administrator settings and account preferences.',
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email || 'admin@taskora.app';
  const userName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    'Administrator';

  return (
    <div className="animate-in fade-in-50 duration-200">
      <SettingsView userEmail={userEmail} userName={userName} />
    </div>
  );
}
