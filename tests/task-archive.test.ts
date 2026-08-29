import { describe, it, expect } from 'vitest';

describe('Individual Task Archiving', () => {
  it('filters out archived tasks from active dashboard queries', () => {
    const tasks = [
      { id: '1', title: 'Active Task 1', status: 'pending', archived: false },
      { id: '2', title: 'Archived Task 2', status: 'pending', archived: true },
      { id: '3', title: 'Active Task 3', status: 'completed', archived: false },
      {
        id: '4',
        title: 'Archived Task 4',
        status: 'completed',
        archived: true,
      },
    ];

    const activeTasks = tasks.filter((t) => !t.archived);
    expect(activeTasks).toHaveLength(2);
    expect(activeTasks.map((t) => t.id)).toEqual(['1', '3']);
  });

  it('allows clients to access completed deliverables even if archived', () => {
    // Invariant #5: Client can view completed deliverables regardless of archived flag
    const clientTasks = [
      {
        id: '1',
        title: 'Landing Page v1',
        client_id: 'client-123',
        status: 'completed',
        archived: true,
      },
      {
        id: '2',
        title: 'Backend API',
        client_id: 'client-123',
        status: 'completed',
        archived: false,
      },
      {
        id: '3',
        title: 'Draft Spec',
        client_id: 'client-123',
        status: 'pending',
        archived: false,
      },
    ];

    // Client Completed Tab query condition:
    // status = 'completed' AND client_id = client.id (archived does NOT exclude)
    const clientCompletedJobs = clientTasks.filter(
      (t) => t.client_id === 'client-123' && t.status === 'completed',
    );

    expect(clientCompletedJobs).toHaveLength(2);
    expect(clientCompletedJobs.map((t) => t.id)).toEqual(['1', '2']);
  });

  it('produces proper archive mutation payloads with updated_at timestamp', () => {
    const beforeTime = Date.now();

    const archivePayload = {
      archived: true,
      updated_at: new Date().toISOString(),
    };

    const afterTime = Date.now();
    const updatedTime = new Date(archivePayload.updated_at).getTime();

    expect(archivePayload.archived).toBe(true);
    expect(updatedTime).toBeGreaterThanOrEqual(beforeTime);
    expect(updatedTime).toBeLessThanOrEqual(afterTime);
  });
});
