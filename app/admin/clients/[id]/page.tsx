import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClientDetail, getActiveClients } from '@/lib/data/clients';
import { ClientDetailView } from '@/components/clients/client-detail-view';

interface AdminClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: AdminClientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getClientDetail(id);

  if (!data) {
    return {
      title: 'Client Not Found | Taskora',
    };
  }

  return {
    title: `${data.client.displayName} | Taskora Admin`,
    description: `Manage deliverables and account settings for ${data.client.displayName}.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function AdminClientDetailPage({
  params,
}: AdminClientDetailPageProps) {
  const { id } = await params;
  const [data, activeClients] = await Promise.all([
    getClientDetail(id),
    getActiveClients(),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-200">
      <ClientDetailView initialData={data} activeClients={activeClients} />
    </div>
  );
}
