import { describe, it, expect } from 'vitest';
import type { ClientOverviewItem } from '@/lib/data/clients';

describe('Client Management Overview & Filtering', () => {
  const mockClients: ClientOverviewItem[] = [
    {
      id: 'c-1',
      profileId: 'p-1',
      displayName: 'Bruce Wayne',
      fullName: 'Bruce Wayne',
      companyName: 'Wayne Enterprises',
      email: 'bruce@wayne.com',
      active: true,
      createdAt: '2026-08-20T10:00:00Z',
      activeTasksCount: 3,
      completedTasksCount: 5,
      totalTasksCount: 8,
    },
    {
      id: 'c-2',
      profileId: 'p-2',
      displayName: 'Tony Stark',
      fullName: 'Anthony Stark',
      companyName: 'Stark Industries',
      email: 'tony@stark.com',
      active: false,
      createdAt: '2026-08-25T14:30:00Z',
      activeTasksCount: 0,
      completedTasksCount: 12,
      totalTasksCount: 12,
    },
    {
      id: 'c-3',
      profileId: 'p-3',
      displayName: 'Diana Prince',
      fullName: 'Diana Prince',
      companyName: 'Themyscira Global',
      email: 'diana@themyscira.org',
      active: true,
      createdAt: '2026-08-28T09:15:00Z',
      activeTasksCount: 5,
      completedTasksCount: 2,
      totalTasksCount: 7,
    },
  ];

  it('filters clients by active and inactive status correctly', () => {
    const activeClients = mockClients.filter((c) => c.active);
    const inactiveClients = mockClients.filter((c) => !c.active);

    expect(activeClients).toHaveLength(2);
    expect(activeClients.map((c) => c.displayName)).toEqual([
      'Bruce Wayne',
      'Diana Prince',
    ]);

    expect(inactiveClients).toHaveLength(1);
    expect(inactiveClients[0].displayName).toBe('Tony Stark');
  });

  it('searches clients across display name, full name, company, and email', () => {
    const search = (query: string) => {
      const q = query.toLowerCase();
      return mockClients.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.fullName.toLowerCase().includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q),
      );
    };

    // By company
    expect(search('stark')).toHaveLength(1);
    expect(search('stark')[0].id).toBe('c-2');

    // By full name
    expect(search('Anthony')).toHaveLength(1);
    expect(search('Anthony')[0].id).toBe('c-2');

    // By email domain
    expect(search('@themyscira.org')).toHaveLength(1);
    expect(search('@themyscira.org')[0].id).toBe('c-3');
  });

  it('sorts clients correctly by newest, company name, and active jobs', () => {
    // Newest
    const sortedNewest = [...mockClients].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    expect(sortedNewest.map((c) => c.id)).toEqual(['c-3', 'c-2', 'c-1']);

    // Company A-Z
    const sortedCompany = [...mockClients].sort((a, b) =>
      (a.companyName || a.displayName).localeCompare(
        b.companyName || b.displayName,
      ),
    );
    expect(sortedCompany.map((c) => c.companyName)).toEqual([
      'Stark Industries',
      'Themyscira Global',
      'Wayne Enterprises',
    ]);

    // Active Jobs count descending
    const sortedActive = [...mockClients].sort(
      (a, b) => b.activeTasksCount - a.activeTasksCount,
    );
    expect(sortedActive.map((c) => c.id)).toEqual(['c-3', 'c-1', 'c-2']);
  });
});
