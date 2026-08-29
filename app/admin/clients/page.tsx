import * as React from 'react';
import type { Metadata } from 'next';
import { getClientsOverview } from '@/lib/data/clients';
import { ClientManagementView } from '@/components/clients/client-management-view';

export const metadata: Metadata = {
  title: 'Client Management | Taskora',
  description: 'Manage clients, active status, and project assignments.',
};

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const clients = await getClientsOverview();

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-200">
      <ClientManagementView clients={clients} />
    </div>
  );
}
