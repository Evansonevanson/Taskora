import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

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
    redirect('/portal');
  }

  redirect('/login');
}
