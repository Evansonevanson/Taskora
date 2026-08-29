'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, Mail, Users, ChevronRight, Sparkles } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import {
  ClientTableToolbar,
  type ClientStatusFilterOption,
  type ClientSortOption,
} from './client-table-toolbar';
import type { ClientOverviewItem } from '@/lib/data/clients';
import { cn } from '@/lib/utils';

export interface ClientTableProps {
  clients: ClientOverviewItem[];
  onAddClientClick?: () => void;
}

export function ClientTable({ clients, onAddClientClick }: ClientTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] =
    React.useState<ClientStatusFilterOption>('all');
  const [sortBy, setSortBy] = React.useState<ClientSortOption>('newest');

  const activeClientsCount = clients.filter((c) => c.active).length;

  // Filter logic
  const filteredClients = React.useMemo(() => {
    return clients.filter((client) => {
      // Status Filter
      if (statusFilter === 'active' && !client.active) {
        return false;
      }
      if (statusFilter === 'inactive' && client.active) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = client.displayName.toLowerCase().includes(query);
        const matchesFullName = client.fullName.toLowerCase().includes(query);
        const matchesCompany =
          client.companyName?.toLowerCase().includes(query) || false;
        const matchesEmail = client.email.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesFullName &&
          !matchesCompany &&
          !matchesEmail
        ) {
          return false;
        }
      }

      return true;
    });
  }, [clients, statusFilter, searchQuery]);

  // Sort logic
  const sortedClients = React.useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      if (sortBy === 'newest') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === 'company') {
        const compA = a.companyName || a.displayName;
        const compB = b.companyName || b.displayName;
        return compA.localeCompare(compB);
      }
      if (sortBy === 'active_jobs') {
        return b.activeTasksCount - a.activeTasksCount;
      }
      return 0;
    });
  }, [filteredClients, sortBy]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <ClientTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        activeCount={activeClientsCount}
        totalCount={clients.length}
      />

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white/80 shadow-sm dark:border-stone-800/80 dark:bg-stone-900/40">
        {sortedClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              clients.length === 0
                ? 'No client accounts found'
                : 'No clients match your filter'
            }
            description={
              clients.length === 0
                ? 'Provision and onboard your first client account to assign deliverables.'
                : 'Try adjusting your search query or switching status filters.'
            }
            action={
              clients.length === 0 && onAddClientClick ? (
                <Button variant="primary" size="sm" onClick={onAddClientClick}>
                  Add Client
                </Button>
              ) : undefined
            }
            className="border-0 bg-transparent py-16"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-stone-200 bg-stone-50/80 hover:bg-stone-50/80 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:bg-stone-900/80">
                <TableHead>Client</TableHead>
                <TableHead className="hidden sm:table-cell">Company</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="text-center">Active Jobs</TableHead>
                <TableHead className="hidden text-center lg:table-cell">
                  Completed
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client) => {
                return (
                  <TableRow
                    key={client.id}
                    className={cn(
                      'group cursor-pointer border-stone-200/60 transition-colors hover:bg-stone-50/80 dark:border-stone-800/60 dark:hover:bg-stone-800/30',
                      !client.active &&
                        'bg-stone-100/50 opacity-60 dark:bg-stone-950/20',
                    )}
                  >
                    {/* Client Name & Avatar */}
                    <TableCell className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={client.displayName || client.fullName}
                          className="h-8 w-8 text-xs font-semibold"
                        />
                        <div className="space-y-0.5">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="text-xs font-semibold text-stone-900 transition-colors group-hover:text-indigo-600 dark:text-stone-100 dark:group-hover:text-indigo-300"
                          >
                            {client.displayName}
                          </Link>
                          {client.fullName &&
                            client.fullName !== client.displayName && (
                              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                {client.fullName}
                              </p>
                            )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Company */}
                    <TableCell className="hidden p-3 sm:table-cell">
                      {client.companyName ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                          <Building2 className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                          <span className="max-w-[140px] truncate">
                            {client.companyName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-stone-600">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="hidden p-3 md:table-cell">
                      <div className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                        <Mail className="h-3 w-3 text-stone-400 dark:text-stone-500" />
                        <span className="max-w-[160px] truncate">
                          {client.email}
                        </span>
                      </div>
                    </TableCell>

                    {/* Active Jobs Count */}
                    <TableCell className="p-3 text-center">
                      {client.activeTasksCount > 0 ? (
                        <Badge
                          variant="work"
                          className="px-2 py-0.5 text-[11px] font-semibold"
                        >
                          <Sparkles className="mr-1 h-2.5 w-2.5 text-indigo-700 dark:text-indigo-300" />
                          <span>{client.activeTasksCount} active</span>
                        </Badge>
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-stone-600">
                          0
                        </span>
                      )}
                    </TableCell>

                    {/* Completed Jobs Count */}
                    <TableCell className="hidden p-3 text-center lg:table-cell">
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        {client.completedTasksCount}
                      </span>
                    </TableCell>

                    {/* Active/Inactive Status */}
                    <TableCell className="p-3 text-center">
                      {client.active ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-400"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-red-200 bg-red-50 text-[10px] text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 px-2 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100"
                      >
                        <Link href={`/admin/clients/${client.id}`}>
                          <span>View</span>
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
