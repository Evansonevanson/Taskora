import * as React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/layout/admin-nav';
import type { Database } from '@/lib/supabase/database.types';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin/dashboard');
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

  if (!profile || profile.role !== 'admin') {
    redirect('/portal');
  }

  const userData = {
    id: user.id,
    email: user.email,
    fullName: profile.full_name,
    role: profile.role,
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-950 text-stone-100">
      <AdminNav user={userData} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
