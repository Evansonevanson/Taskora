import * as React from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getClientPortalJobDetail } from '@/lib/data/portal';
import { getTaskComments } from '@/lib/data/comments';
import { getTaskAttachments } from '@/lib/data/attachments';
import { PortalJobDetailView } from '@/components/portal/portal-job-detail-view';
import type { Database } from '@/lib/supabase/database.types';

interface ClientJobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ClientJobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getClientPortalJobDetail(id);

  if (!data) {
    return {
      title: 'Deliverable Not Found | Taskora Client Portal',
    };
  }

  return {
    title: `${data.task.title} | Taskora Client Portal`,
    description: `Inspect details and submit feedback for ${data.task.title}.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function ClientJobDetailPage({
  params,
}: ClientJobDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/portal/jobs/${id}`);
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as {
    role: Database['public']['Tables']['profiles']['Row']['role'];
  } | null;

  // If Admin manually accesses Client deliverable route, redirect to Admin Dashboard
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  const [data, comments, attachments] = await Promise.all([
    getClientPortalJobDetail(id),
    getTaskComments(id),
    getTaskAttachments(id),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-200">
      <PortalJobDetailView
        client={data.client}
        task={data.task}
        comments={comments}
        attachments={attachments}
      />
    </div>
  );
}
