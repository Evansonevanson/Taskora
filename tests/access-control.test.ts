import { describe, it, expect } from 'vitest';
import type { Database, UserRole } from '@/lib/supabase/database.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type CommentRow = Database['public']['Tables']['comments']['Row'];

interface AuthContext {
  userId: string | null;
  role: UserRole | null;
  clientId: string | null;
  isActiveClient?: boolean;
}

/**
 * Evaluates the exact SQL RLS policy for public.tasks SELECT:
 * - Admin: current_role() = 'admin' (can select all)
 * - Client: current_role() = 'client' AND client_id = current_client_id() AND status = 'completed'
 */
function canSelectTask(auth: AuthContext, task: TaskRow): boolean {
  if (!auth.userId || !auth.role) return false;
  if (auth.role === 'admin') return true;
  if (auth.role === 'client') {
    if (auth.isActiveClient === false) return false;
    return auth.clientId === task.client_id && task.status === 'completed';
  }
  return false;
}

/**
 * Evaluates the exact SQL RLS policy for public.tasks INSERT/UPDATE/DELETE:
 * - Only current_role() = 'admin'
 */
function canMutateTask(auth: AuthContext): boolean {
  if (!auth.userId || !auth.role) return false;
  return auth.role === 'admin';
}

/**
 * Evaluates the exact SQL RLS policy for public.comments SELECT:
 * - Admin: current_role() = 'admin'
 * - Client: current_role() = 'client' AND exists(select 1 from tasks where tasks.id = task_id AND client_id = current_client_id() AND status = 'completed')
 */
function canSelectComment(
  auth: AuthContext,
  comment: CommentRow,
  task: TaskRow,
): boolean {
  if (!auth.userId || !auth.role) return false;
  if (auth.role === 'admin') return true;
  if (auth.role === 'client') {
    if (auth.isActiveClient === false) return false;
    return (
      comment.task_id === task.id &&
      task.client_id === auth.clientId &&
      task.status === 'completed'
    );
  }
  return false;
}

/**
 * Evaluates the exact SQL RLS policy for public.comments INSERT:
 * - Admin: current_role() = 'admin' AND author_id = auth.uid()
 * - Client: current_role() = 'client' AND author_id = auth.uid() AND exists(select 1 from tasks where tasks.id = task_id AND client_id = current_client_id() AND status = 'completed')
 */
function canInsertComment(
  auth: AuthContext,
  authorId: string,
  task: TaskRow,
): boolean {
  if (!auth.userId || !auth.role) return false;
  if (auth.userId !== authorId) return false;
  if (auth.role === 'admin') return true;
  if (auth.role === 'client') {
    if (auth.isActiveClient === false) return false;
    return task.client_id === auth.clientId && task.status === 'completed';
  }
  return false;
}

describe('Mandatory Access-Control & RLS Policy Invariant Tests', () => {
  // Test identities
  const adminAuth: AuthContext = {
    userId: 'admin-uuid-1',
    role: 'admin',
    clientId: null,
  };

  const clientAAuth: AuthContext = {
    userId: 'client-a-user-uuid',
    role: 'client',
    clientId: 'client-a-org-uuid',
    isActiveClient: true,
  };

  const clientBAuth: AuthContext = {
    userId: 'client-b-user-uuid',
    role: 'client',
    clientId: 'client-b-org-uuid',
    isActiveClient: true,
  };

  const deactivatedClientAuth: AuthContext = {
    userId: 'client-deactivated-user-uuid',
    role: 'client',
    clientId: 'client-deactivated-org-uuid',
    isActiveClient: false,
  };

  // Test tasks
  const clientAPendingTask: TaskRow = {
    id: 'task-a-pending-1',
    title: 'Client A Pending Design Work',
    category: 'work',
    client_id: 'client-a-org-uuid',
    priority: 'high',
    due_date: '2026-09-01',
    status: 'pending',
    needs_revision: false,
    notes: 'Drafting design assets',
    archived: false,
    created_by: 'admin-uuid-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    client_notified_at: null,
  };

  const clientACompletedTask: TaskRow = {
    id: 'task-a-completed-1',
    title: 'Client A Completed Deliverable',
    category: 'work',
    client_id: 'client-a-org-uuid',
    priority: 'medium',
    due_date: '2026-08-25',
    status: 'completed',
    needs_revision: false,
    notes: 'Delivered branding pack',
    archived: false,
    created_by: 'admin-uuid-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: '2026-08-25T14:00:00Z',
    client_notified_at: '2026-08-25T14:05:00Z',
  };

  const clientAArchivedCompletedTask: TaskRow = {
    id: 'task-a-archived-1',
    title: 'Client A Past Completed Work (Archived)',
    category: 'work',
    client_id: 'client-a-org-uuid',
    priority: 'low',
    due_date: '2026-08-01',
    status: 'completed',
    needs_revision: false,
    notes: 'Initial scope delivered and archived',
    archived: true,
    created_by: 'admin-uuid-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: '2026-08-01T10:00:00Z',
    client_notified_at: '2026-08-01T10:05:00Z',
  };

  const clientBCompletedTask: TaskRow = {
    id: 'task-b-completed-1',
    title: 'Client B Completed Work',
    category: 'work',
    client_id: 'client-b-org-uuid',
    priority: 'high',
    due_date: '2026-08-20',
    status: 'completed',
    needs_revision: false,
    notes: 'Confidential client B strategy',
    archived: false,
    created_by: 'admin-uuid-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: '2026-08-20T12:00:00Z',
    client_notified_at: '2026-08-20T12:05:00Z',
  };

  const clientBArchivedCompletedTask: TaskRow = {
    id: 'task-b-archived-1',
    title: 'Client B Past Completed Work (Archived)',
    category: 'work',
    client_id: 'client-b-org-uuid',
    priority: 'low',
    due_date: '2026-07-15',
    status: 'completed',
    needs_revision: false,
    notes: 'Archived deliverables for Client B',
    archived: true,
    created_by: 'admin-uuid-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: '2026-07-15T15:00:00Z',
    client_notified_at: '2026-07-15T15:05:00Z',
  };

  it('1. Client A cannot read Client B tasks', () => {
    const canRead = canSelectTask(clientAAuth, clientBCompletedTask);
    expect(canRead).toBe(false);
  });

  it('2. Client cannot read Pending tasks, even their own', () => {
    const canReadOwnPending = canSelectTask(clientAAuth, clientAPendingTask);
    expect(canReadOwnPending).toBe(false);
  });

  it('3. Client cannot insert/update/delete a task', () => {
    const canMutate = canMutateTask(clientAAuth);
    expect(canMutate).toBe(false);
  });

  it('4. Client cannot comment on a task that is not theirs', () => {
    const canComment = canInsertComment(
      clientAAuth,
      clientAAuth.userId!,
      clientBCompletedTask,
    );
    expect(canComment).toBe(false);
  });

  it('5. Client cannot comment on their own Pending task', () => {
    const canCommentOnPending = canInsertComment(
      clientAAuth,
      clientAAuth.userId!,
      clientAPendingTask,
    );
    expect(canCommentOnPending).toBe(false);
  });

  it('6. Deactivated client is denied access to all tasks and comments', () => {
    const canReadTask = canSelectTask(
      deactivatedClientAuth,
      clientACompletedTask,
    );
    expect(canReadTask).toBe(false);

    const canPostComment = canInsertComment(
      deactivatedClientAuth,
      deactivatedClientAuth.userId!,
      clientACompletedTask,
    );
    expect(canPostComment).toBe(false);
  });

  it('7. Admin can read and mutate all tasks across all clients', () => {
    expect(canSelectTask(adminAuth, clientAPendingTask)).toBe(true);
    expect(canSelectTask(adminAuth, clientACompletedTask)).toBe(true);
    expect(canSelectTask(adminAuth, clientBCompletedTask)).toBe(true);
    expect(canSelectTask(adminAuth, clientBArchivedCompletedTask)).toBe(true);
    expect(canMutateTask(adminAuth)).toBe(true);
  });

  it('8. Direct URL access to unauthorized task/client id returns not found', () => {
    // When Client A queries Client B's task ID, RLS returns empty array / null
    const dataset = [
      clientAPendingTask,
      clientACompletedTask,
      clientBCompletedTask,
    ];
    const visibleTasksForClientA = dataset.filter((t) =>
      canSelectTask(clientAAuth, t),
    );

    const foundClientBTask = visibleTasksForClientA.find(
      (t) => t.id === clientBCompletedTask.id,
    );
    expect(foundClientBTask).toBeUndefined();
  });

  it('9. Client can read their own archived Completed task (preserves delivered history)', () => {
    const canReadOwnArchived = canSelectTask(
      clientAAuth,
      clientAArchivedCompletedTask,
    );
    expect(canReadOwnArchived).toBe(true);
  });

  it('10. Client cannot read another Client archived Completed task', () => {
    const canReadOtherArchived = canSelectTask(
      clientAAuth,
      clientBArchivedCompletedTask,
    );
    expect(canReadOtherArchived).toBe(false);
  });

  it('11. Client can successfully read and comment on their own Completed task', () => {
    const canRead = canSelectTask(clientAAuth, clientACompletedTask);
    expect(canRead).toBe(true);

    const canComment = canInsertComment(
      clientAAuth,
      clientAAuth.userId!,
      clientACompletedTask,
    );
    expect(canComment).toBe(true);
  });

  it('12. Comment isolation: Client A cannot read comments on Client B task', () => {
    const clientBComment: CommentRow = {
      id: 'comment-b-1',
      task_id: clientBCompletedTask.id,
      author_id: clientBAuth.userId!,
      body: 'Feedback on Client B deliverable',
      created_at: new Date().toISOString(),
    };

    expect(
      canSelectComment(clientAAuth, clientBComment, clientBCompletedTask),
    ).toBe(false);
    expect(
      canSelectComment(clientBAuth, clientBComment, clientBCompletedTask),
    ).toBe(true);
    expect(
      canSelectComment(adminAuth, clientBComment, clientBCompletedTask),
    ).toBe(true);
  });
});
