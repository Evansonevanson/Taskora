import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { LandingView } from '@/components/landing/landing-view';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated visitor: render the public Taskora landing page
  if (!user) {
    return <LandingView />;
  }

  // 2. Authenticated user: retrieve role & route to respective dashboard/portal
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as {
    role: Database['public']['Tables']['profiles']['Row']['role'];
  } | null;

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  if (profile?.role === 'client') {
    redirect('/portal/jobs');
  }

  // Fallback for authenticated user without an established role
  return <LandingView />;
}
