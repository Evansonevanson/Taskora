import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClientPortalData } from '@/lib/data/portal';
import { PortalView } from '@/components/portal/portal-view';

export const metadata: Metadata = {
  title: 'My Jobs | Taskora Client Portal',
  description: 'View completed deliverables and project tasks for review.',
};

export const dynamic = 'force-dynamic';

export default async function ClientPortalPage() {
  const data = await getClientPortalData();

  if (!data) {
    notFound();
  }

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-200">
      <PortalView initialData={data} />
    </div>
  );
}
