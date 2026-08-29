import * as React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientNav } from '@/components/layout/client-nav';
import type { Database } from '@/lib/supabase/database.types';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/portal');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as {
    id: string;
    full_name: string | null;
    role: Database['public']['Tables']['profiles']['Row']['role'];
  } | null;

  if (!profile || profile.role !== 'client') {
    redirect('/admin/dashboard');
  }

  const { data: clientData } = await supabase
    .from('clients')
    .select('company_name, active')
    .eq('profile_id', user.id)
    .maybeSingle();

  const clientRecord = clientData as {
    company_name: Database['public']['Tables']['clients']['Row']['company_name'];
    active: Database['public']['Tables']['clients']['Row']['active'];
  } | null;

  if (!clientRecord || !clientRecord.active) {
    await supabase.auth.signOut();
    redirect('/login?error=deactivated');
  }

  const userData = {
    id: user.id,
    email: user.email,
    fullName: profile.full_name,
    role: profile.role,
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-950 text-stone-100">
      <ClientNav user={userData} companyName={clientRecord.company_name} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
