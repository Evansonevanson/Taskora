'use client';

import * as React from 'react';
import { ClientsHeader } from './clients-header';
import { ClientTable } from './client-table';
import { CreateClientDialog } from './create-client-dialog';
import type { ClientOverviewItem } from '@/lib/data/clients';

export interface ClientManagementViewProps {
  clients: ClientOverviewItem[];
}

export function ClientManagementView({ clients }: ClientManagementViewProps) {
  const [isAddClientOpen, setIsAddClientOpen] = React.useState(false);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.active).length;
  const totalDeliverables = clients.reduce(
    (acc, curr) => acc + curr.totalTasksCount,
    0,
  );

  return (
    <div className="space-y-6">
      <ClientsHeader
        totalClients={totalClients}
        activeClients={activeClients}
        totalDeliverables={totalDeliverables}
        onAddClientClick={() => setIsAddClientOpen(true)}
      />

      <ClientTable
        clients={clients}
        onAddClientClick={() => setIsAddClientOpen(true)}
      />

      <CreateClientDialog
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />
    </div>
  );
}
