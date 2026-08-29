import * as React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getClientPortalData } from '@/lib/data/portal';
import { PortalView } from '@/components/portal/portal-view';
import type { Database } from '@/lib/supabase/database.types';

export const metadata: Metadata = {
  title: 'My Jobs | Taskora Client Portal',
  description: 'View completed deliverables and project tasks for review.',
};

export const dynamic = 'force-dynamic';

export default async function ClientMyJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/portal/jobs');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as {
    role: Database['public']['Tables']['profiles']['Row']['role'];
  } | null;

  // If Admin manually accesses Client My Jobs route, redirect to Admin Dashboard
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  const data = await getClientPortalData();

  if (!data) {
    redirect('/login?error=deactivated');
  }

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-200">
      <PortalView initialData={data} />
    </div>
  );
}
