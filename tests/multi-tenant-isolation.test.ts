import { describe, it, expect } from 'vitest';
import type {
  Database,
  WorkspaceMemberRole,
} from '@/lib/supabase/database.types';

type WorkspaceRow = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMemberRow =
  Database['public']['Tables']['workspace_members']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type CommentRow = Database['public']['Tables']['comments']['Row'];
type TaskAttachmentRow =
  Database['public']['Tables']['task_attachments']['Row'];

interface TestDatabaseState {
  workspaces: WorkspaceRow[];
  workspaceMembers: WorkspaceMemberRow[];
  profiles: ProfileRow[];
  clients: ClientRow[];
  tasks: TaskRow[];
  comments: CommentRow[];
  taskAttachments: TaskAttachmentRow[];
}

/**
 * Simulates PostgreSQL RLS Helper Functions & Policies (Hardened)
 */
class PostgresRLSEngine {
  constructor(private db: TestDatabaseState) {}

  isWorkspaceMember(targetWorkspaceId: string, authUserId: string): boolean {
    return this.db.workspaceMembers.some(
      (m) =>
        m.workspace_id === targetWorkspaceId && m.profile_id === authUserId,
    );
  }

  isWorkspaceAdmin(targetWorkspaceId: string, authUserId: string): boolean {
    return this.db.workspaceMembers.some(
      (m) =>
        m.workspace_id === targetWorkspaceId &&
        m.profile_id === authUserId &&
        (m.role === 'owner' || m.role === 'admin'),
    );
  }

  isWorkspaceOwner(targetWorkspaceId: string, authUserId: string): boolean {
    return this.db.workspaceMembers.some(
      (m) =>
        m.workspace_id === targetWorkspaceId &&
        m.profile_id === authUserId &&
        m.role === 'owner',
    );
  }

  private currentClientId(authUserId: string): string | null {
    const client = this.db.clients.find(
      (c) => c.profile_id === authUserId && c.active,
    );
    return client ? client.id : null;
  }

  // --- Workspace Members Privilege Escalation Guards ---
  canInsertWorkspaceMember(
    authUserId: string,
    workspaceId: string,
    targetRole: WorkspaceMemberRole,
  ): boolean {
    // Owner can insert any role
    if (this.isWorkspaceOwner(workspaceId, authUserId)) return true;

    // Regular admin can only insert 'admin' or 'client' (never 'owner')
    if (
      this.isWorkspaceAdmin(workspaceId, authUserId) &&
      (targetRole === 'admin' || targetRole === 'client')
    ) {
      return true;
    }

    return false;
  }

  canUpdateWorkspaceMember(
    authUserId: string,
    targetRow: WorkspaceMemberRow,
    newRole: WorkspaceMemberRole,
  ): boolean {
    // Owner can update memberships
    if (this.isWorkspaceOwner(targetRow.workspace_id, authUserId)) return true;

    // Regular admin can only update non-owner rows to non-owner roles
    if (
      this.isWorkspaceAdmin(targetRow.workspace_id, authUserId) &&
      targetRow.role !== 'owner' &&
      (newRole === 'admin' || newRole === 'client')
    ) {
      return true;
    }

    return false;
  }

  canDeleteWorkspaceMember(
    authUserId: string,
    targetRow: WorkspaceMemberRow,
  ): boolean {
    // Regular admin can only delete non-owner rows
    if (
      this.isWorkspaceAdmin(targetRow.workspace_id, authUserId) &&
      targetRow.role !== 'owner'
    ) {
      return true;
    }

    return false;
  }

  // --- Immutability Trigger Simulation ---
  attemptUpdateWorkspaceId(
    oldWorkspaceId: string,
    newWorkspaceId: string,
  ): { success: boolean; error?: string } {
    if (oldWorkspaceId && oldWorkspaceId !== newWorkspaceId) {
      return {
        success: false,
        error: 'workspace_id is immutable on existing records',
      };
    }
    return { success: true };
  }

  // --- Profiles Policy Evaluation ---
  canSelectProfile(authUserId: string, targetProfileId: string): boolean {
    if (authUserId === targetProfileId) return true;
    const userWorkspaceIds = this.db.workspaceMembers
      .filter((m) => m.profile_id === authUserId)
      .map((m) => m.workspace_id);

    return this.db.workspaceMembers.some(
      (m) =>
        userWorkspaceIds.includes(m.workspace_id) &&
        m.profile_id === targetProfileId,
    );
  }

  // --- Clients Policy Evaluation ---
  canSelectClient(authUserId: string, client: ClientRow): boolean {
    if (this.isWorkspaceAdmin(client.workspace_id, authUserId)) return true;
    return client.profile_id === authUserId;
  }

  canMutateClient(authUserId: string, client: ClientRow): boolean {
    return this.isWorkspaceAdmin(client.workspace_id, authUserId);
  }

  // --- Tasks Policy Evaluation ---
  canSelectTask(authUserId: string, task: TaskRow): boolean {
    if (this.isWorkspaceAdmin(task.workspace_id, authUserId)) return true;
    const cId = this.currentClientId(authUserId);
    return (
      cId !== null && task.client_id === cId && task.status === 'completed'
    );
  }

  canMutateTask(authUserId: string, task: TaskRow): boolean {
    return this.isWorkspaceAdmin(task.workspace_id, authUserId);
  }

  // --- Comments Policy Evaluation ---
  canSelectComment(authUserId: string, comment: CommentRow): boolean {
    const task = this.db.tasks.find((t) => t.id === comment.task_id);
    if (!task) return false;

    if (this.isWorkspaceAdmin(task.workspace_id, authUserId)) return true;
    const cId = this.currentClientId(authUserId);
    return (
      cId !== null && task.client_id === cId && task.status === 'completed'
    );
  }

  canInsertComment(
    authUserId: string,
    comment: { task_id: string; author_id: string },
  ): boolean {
    if (comment.author_id !== authUserId) return false;
    const task = this.db.tasks.find((t) => t.id === comment.task_id);
    if (!task) return false;

    if (this.isWorkspaceAdmin(task.workspace_id, authUserId)) return true;
    const cId = this.currentClientId(authUserId);
    return (
      cId !== null && task.client_id === cId && task.status === 'completed'
    );
  }

  // --- Task Attachments Policy Evaluation ---
  canSelectAttachment(
    authUserId: string,
    attachment: TaskAttachmentRow,
  ): boolean {
    if (this.isWorkspaceAdmin(attachment.workspace_id, authUserId)) return true;
    const task = this.db.tasks.find((t) => t.id === attachment.task_id);
    if (!task) return false;
    const cId = this.currentClientId(authUserId);
    return (
      cId !== null && task.client_id === cId && task.status === 'completed'
    );
  }

  canMutateAttachment(
    authUserId: string,
    attachment: TaskAttachmentRow,
  ): boolean {
    return this.isWorkspaceAdmin(attachment.workspace_id, authUserId);
  }

  // --- Storage Object Policy Evaluation ---
  canAccessStorageObject(
    authUserId: string,
    storagePath: string,
    mode: 'all' | 'select',
  ): boolean {
    const attachment = this.db.taskAttachments.find(
      (a) => a.storage_path === storagePath,
    );
    if (!attachment) return false;

    if (this.isWorkspaceAdmin(attachment.workspace_id, authUserId)) {
      return true;
    }

    if (mode === 'select') {
      const task = this.db.tasks.find((t) => t.id === attachment.task_id);
      if (!task) return false;
      const cId = this.currentClientId(authUserId);
      return (
        cId !== null && task.client_id === cId && task.status === 'completed'
      );
    }

    return false;
  }
}

/**
 * Simulates the Backfill Validation Logic
 */
function simulateBackfill(adminProfiles: Array<{ id: string; role: string }>) {
  const adminCount = adminProfiles.filter((p) => p.role === 'admin').length;
  if (adminCount === 0) {
    throw new Error(
      'Migration halted: No existing admin profile found in public.profiles. Cannot assign initial workspace ownership.',
    );
  }
  if (adminCount > 1) {
    throw new Error(
      `Migration halted: Found ${adminCount} admin profiles in public.profiles. Ambiguous initial workspace ownership. Resolve manually before migrating.`,
    );
  }
  return { success: true, ownerId: adminProfiles[0].id };
}

describe('Phase 14: Strict Multi-Tenant Workspace & Privilege Escalation Tests', () => {
  // Mock Data Setup
  const workspaceA: WorkspaceRow = {
    id: 'ws-a-uuid',
    name: 'Studio Alpha',
    slug: 'studio-alpha',
    created_at: '2026-08-29T10:00:00Z',
    updated_at: '2026-08-29T10:00:00Z',
  };

  const workspaceB: WorkspaceRow = {
    id: 'ws-b-uuid',
    name: 'Beta Agency',
    slug: 'beta-agency',
    created_at: '2026-08-29T10:00:00Z',
    updated_at: '2026-08-29T10:00:00Z',
  };

  const ownerA: ProfileRow = {
    id: 'owner-a-id',
    role: 'admin',
    full_name: 'Alice Owner',
    email: 'alice@alpha.com',
    created_at: '2026-08-29T10:00:00Z',
  };

  const adminA: ProfileRow = {
    id: 'admin-a-id',
    role: 'admin',
    full_name: 'Alex Admin',
    email: 'alex@alpha.com',
    created_at: '2026-08-29T10:00:00Z',
  };

  const ownerB: ProfileRow = {
    id: 'owner-b-id',
    role: 'admin',
    full_name: 'Bob Owner',
    email: 'bob@beta.com',
    created_at: '2026-08-29T10:00:00Z',
  };

  const clientAProfile: ProfileRow = {
    id: 'client-a-profile-id',
    role: 'client',
    full_name: 'Charlie Client Alpha',
    email: 'charlie@clienta.com',
    created_at: '2026-08-29T10:00:00Z',
  };

  const clientBProfile: ProfileRow = {
    id: 'client-b-profile-id',
    role: 'client',
    full_name: 'David Client Beta',
    email: 'david@clientb.com',
    created_at: '2026-08-29T10:00:00Z',
  };

  const ownerMemberRowA: WorkspaceMemberRow = {
    id: 'm-1',
    workspace_id: workspaceA.id,
    profile_id: ownerA.id,
    role: 'owner',
    created_at: '2026-08-29T10:00:00Z',
  };

  const adminMemberRowA: WorkspaceMemberRow = {
    id: 'm-admin-a',
    workspace_id: workspaceA.id,
    profile_id: adminA.id,
    role: 'admin',
    created_at: '2026-08-29T10:00:00Z',
  };

  const clientMemberRowA: WorkspaceMemberRow = {
    id: 'm-2',
    workspace_id: workspaceA.id,
    profile_id: clientAProfile.id,
    role: 'client',
    created_at: '2026-08-29T10:00:00Z',
  };

  const ownerMemberRowB: WorkspaceMemberRow = {
    id: 'm-3',
    workspace_id: workspaceB.id,
    profile_id: ownerB.id,
    role: 'owner',
    created_at: '2026-08-29T10:00:00Z',
  };

  const clientMemberRowB: WorkspaceMemberRow = {
    id: 'm-4',
    workspace_id: workspaceB.id,
    profile_id: clientBProfile.id,
    role: 'client',
    created_at: '2026-08-29T10:00:00Z',
  };

  const workspaceMembers: WorkspaceMemberRow[] = [
    ownerMemberRowA,
    adminMemberRowA,
    clientMemberRowA,
    ownerMemberRowB,
    clientMemberRowB,
  ];

  const clientARow: ClientRow = {
    id: 'client-a-id',
    workspace_id: workspaceA.id,
    profile_id: clientAProfile.id,
    display_name: 'Alpha Customer',
    company_name: 'Acme Corp',
    active: true,
    created_at: '2026-08-29T10:00:00Z',
  };

  const clientBRow: ClientRow = {
    id: 'client-b-id',
    workspace_id: workspaceB.id,
    profile_id: clientBProfile.id,
    display_name: 'Beta Customer',
    company_name: 'Global Tech',
    active: true,
    created_at: '2026-08-29T10:00:00Z',
  };

  const taskACompleted: TaskRow = {
    id: 'task-a-completed-id',
    workspace_id: workspaceA.id,
    title: 'Brand Package Alpha',
    category: 'work',
    client_id: clientARow.id,
    priority: 'high',
    due_date: '2026-09-01',
    status: 'completed',
    needs_revision: false,
    notes: 'Approved brand deliverables',
    project_url: 'https://figma.com/file/alpha',
    archived: false,
    created_by: ownerA.id,
    created_at: '2026-08-29T10:00:00Z',
    updated_at: '2026-08-29T10:00:00Z',
    completed_at: '2026-08-29T11:00:00Z',
    client_notified_at: '2026-08-29T11:00:00Z',
  };

  const taskAPending: TaskRow = {
    id: 'task-a-pending-id',
    workspace_id: workspaceA.id,
    title: 'Social Media Assets Alpha',
    category: 'work',
    client_id: clientARow.id,
    priority: 'medium',
    due_date: '2026-09-05',
    status: 'pending',
    needs_revision: false,
    notes: 'Draft in progress',
    project_url: null,
    archived: false,
    created_by: ownerA.id,
    created_at: '2026-08-29T10:00:00Z',
    updated_at: '2026-08-29T10:00:00Z',
    completed_at: null,
    client_notified_at: null,
  };

  const taskBCompleted: TaskRow = {
    id: 'task-b-completed-id',
    workspace_id: workspaceB.id,
    title: 'Website Redesign Beta',
    category: 'work',
    client_id: clientBRow.id,
    priority: 'high',
    due_date: '2026-09-10',
    status: 'completed',
    needs_revision: false,
    notes: 'Beta deliverables ready',
    project_url: 'https://staging.beta.com',
    archived: false,
    created_by: ownerB.id,
    created_at: '2026-08-29T10:00:00Z',
    updated_at: '2026-08-29T10:00:00Z',
    completed_at: '2026-08-29T11:30:00Z',
    client_notified_at: '2026-08-29T11:30:00Z',
  };

  const commentA: CommentRow = {
    id: 'comment-a-id',
    task_id: taskACompleted.id,
    author_id: clientAProfile.id,
    body: 'Looks great! Can we adjust the logo contrast?',
    created_at: '2026-08-29T11:15:00Z',
  };

  const commentB: CommentRow = {
    id: 'comment-b-id',
    task_id: taskBCompleted.id,
    author_id: clientBProfile.id,
    body: 'Reviewed the staging link. Perfect.',
    created_at: '2026-08-29T11:45:00Z',
  };

  const attachmentA: TaskAttachmentRow = {
    id: 'attach-a-id',
    workspace_id: workspaceA.id,
    task_id: taskACompleted.id,
    file_name: 'alpha-brand-assets.pdf',
    storage_path:
      'workspaces/ws-a-uuid/tasks/task-a-completed-id/attach-a-id-alpha-brand-assets.pdf',
    mime_type: 'application/pdf',
    file_size: 2048000,
    uploaded_by: ownerA.id,
    created_at: '2026-08-29T10:30:00Z',
  };

  const attachmentB: TaskAttachmentRow = {
    id: 'attach-b-id',
    workspace_id: workspaceB.id,
    task_id: taskBCompleted.id,
    file_name: 'beta-deliverables.zip',
    storage_path:
      'workspaces/ws-b-uuid/tasks/task-b-completed-id/attach-b-id-beta-deliverables.pdf',
    mime_type: 'application/pdf',
    file_size: 4096000,
    uploaded_by: ownerB.id,
    created_at: '2026-08-29T10:45:00Z',
  };

  const testState: TestDatabaseState = {
    workspaces: [workspaceA, workspaceB],
    workspaceMembers,
    profiles: [ownerA, adminA, ownerB, clientAProfile, clientBProfile],
    clients: [clientARow, clientBRow],
    tasks: [taskACompleted, taskAPending, taskBCompleted],
    comments: [commentA, commentB],
    taskAttachments: [attachmentA, attachmentB],
  };

  const rls = new PostgresRLSEngine(testState);

  describe('1. Privilege Escalation & Owner Membership Guards', () => {
    it('Admin CANNOT promote self to owner', () => {
      const allowed = rls.canUpdateWorkspaceMember(
        adminA.id,
        adminMemberRowA,
        'owner',
      );
      expect(allowed).toBe(false);
    });

    it('Admin CANNOT promote another member to owner', () => {
      const allowed = rls.canUpdateWorkspaceMember(
        adminA.id,
        clientMemberRowA,
        'owner',
      );
      expect(allowed).toBe(false);
    });

    it('Admin CANNOT insert a new member with role = owner', () => {
      const allowed = rls.canInsertWorkspaceMember(
        adminA.id,
        workspaceA.id,
        'owner',
      );
      expect(allowed).toBe(false);
    });

    it('Admin CANNOT demote the owner', () => {
      const allowed = rls.canUpdateWorkspaceMember(
        adminA.id,
        ownerMemberRowA,
        'admin',
      );
      expect(allowed).toBe(false);
    });

    it('Admin CANNOT delete the owner membership row', () => {
      const allowed = rls.canDeleteWorkspaceMember(adminA.id, ownerMemberRowA);
      expect(allowed).toBe(false);
    });

    it('Admin CAN update or manage non-owner memberships (admin/client)', () => {
      const updateClient = rls.canUpdateWorkspaceMember(
        adminA.id,
        clientMemberRowA,
        'admin',
      );
      expect(updateClient).toBe(true);

      const deleteClient = rls.canDeleteWorkspaceMember(
        adminA.id,
        clientMemberRowA,
      );
      expect(deleteClient).toBe(true);
    });

    it('Owner CAN update and manage any memberships in own workspace', () => {
      const promoteToAdmin = rls.canUpdateWorkspaceMember(
        ownerA.id,
        clientMemberRowA,
        'admin',
      );
      expect(promoteToAdmin).toBe(true);

      const insertMember = rls.canInsertWorkspaceMember(
        ownerA.id,
        workspaceA.id,
        'admin',
      );
      expect(insertMember).toBe(true);
    });
  });

  describe('2. Immutable workspace_id Reassignment Guards', () => {
    it('Rejects changing workspace_id on existing client', () => {
      const result = rls.attemptUpdateWorkspaceId(
        clientARow.workspace_id,
        workspaceB.id,
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('workspace_id is immutable');
    });

    it('Rejects changing workspace_id on existing task', () => {
      const result = rls.attemptUpdateWorkspaceId(
        taskACompleted.workspace_id,
        workspaceB.id,
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('workspace_id is immutable');
    });

    it('Rejects changing workspace_id on existing attachment', () => {
      const result = rls.attemptUpdateWorkspaceId(
        attachmentA.workspace_id,
        workspaceB.id,
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('workspace_id is immutable');
    });

    it('Allows updating other fields while workspace_id remains unchanged', () => {
      const result = rls.attemptUpdateWorkspaceId(
        taskACompleted.workspace_id,
        taskACompleted.workspace_id,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('3. Fail-Safe Initial Owner Backfill Logic', () => {
    it('Succeeds when exactly one admin profile exists', () => {
      const result = simulateBackfill([{ id: 'admin-1', role: 'admin' }]);
      expect(result.success).toBe(true);
      expect(result.ownerId).toBe('admin-1');
    });

    it('Fails safely with exception when zero admin profiles exist', () => {
      expect(() =>
        simulateBackfill([{ id: 'user-1', role: 'client' }]),
      ).toThrowError('No existing admin profile found');
    });

    it('Fails safely with exception when multiple admin profiles exist', () => {
      expect(() =>
        simulateBackfill([
          { id: 'admin-1', role: 'admin' },
          { id: 'admin-2', role: 'admin' },
        ]),
      ).toThrowError('Found 2 admin profiles');
    });
  });

  describe('4. Owner/Admin Cross-Tenant Task Isolation', () => {
    it('Owner A can SELECT tasks belonging to Workspace A', () => {
      expect(rls.canSelectTask(ownerA.id, taskACompleted)).toBe(true);
      expect(rls.canSelectTask(ownerA.id, taskAPending)).toBe(true);
    });

    it('Owner A CANNOT SELECT tasks belonging to Workspace B', () => {
      expect(rls.canSelectTask(ownerA.id, taskBCompleted)).toBe(false);
    });

    it('Owner A CANNOT UPDATE, ARCHIVE, or DELETE tasks in Workspace B', () => {
      expect(rls.canMutateTask(ownerA.id, taskBCompleted)).toBe(false);
    });

    it('Owner B CANNOT SELECT or MUTATE tasks in Workspace A', () => {
      expect(rls.canSelectTask(ownerB.id, taskACompleted)).toBe(false);
      expect(rls.canSelectTask(ownerB.id, taskAPending)).toBe(false);
      expect(rls.canMutateTask(ownerB.id, taskACompleted)).toBe(false);
    });
  });

  describe('5. Owner/Admin Cross-Tenant Client Isolation', () => {
    it('Owner A can SELECT and MUTATE clients in Workspace A', () => {
      expect(rls.canSelectClient(ownerA.id, clientARow)).toBe(true);
      expect(rls.canMutateClient(ownerA.id, clientARow)).toBe(true);
    });

    it('Owner A CANNOT SELECT or MUTATE clients in Workspace B', () => {
      expect(rls.canSelectClient(ownerA.id, clientBRow)).toBe(false);
      expect(rls.canMutateClient(ownerA.id, clientBRow)).toBe(false);
    });

    it('Owner B CANNOT SELECT or MUTATE clients in Workspace A', () => {
      expect(rls.canSelectClient(ownerB.id, clientARow)).toBe(false);
      expect(rls.canMutateClient(ownerB.id, clientARow)).toBe(false);
    });
  });

  describe('6. Cross-Tenant Comment Thread Isolation', () => {
    it('Owner A can view comments on Workspace A tasks', () => {
      expect(rls.canSelectComment(ownerA.id, commentA)).toBe(true);
    });

    it('Owner A CANNOT view comments on Workspace B tasks', () => {
      expect(rls.canSelectComment(ownerA.id, commentB)).toBe(false);
    });

    it('Owner A CANNOT insert comments on Workspace B tasks', () => {
      expect(
        rls.canInsertComment(ownerA.id, {
          task_id: taskBCompleted.id,
          author_id: ownerA.id,
        }),
      ).toBe(false);
    });
  });

  describe('7. Cross-Tenant Attachment Metadata & Storage Isolation', () => {
    it('Owner A can SELECT and MUTATE attachments in Workspace A', () => {
      expect(rls.canSelectAttachment(ownerA.id, attachmentA)).toBe(true);
      expect(rls.canMutateAttachment(ownerA.id, attachmentA)).toBe(true);
    });

    it('Owner A CANNOT SELECT or MUTATE attachments in Workspace B', () => {
      expect(rls.canSelectAttachment(ownerA.id, attachmentB)).toBe(false);
      expect(rls.canMutateAttachment(ownerA.id, attachmentB)).toBe(false);
    });

    it('Owner A CANNOT access Storage objects in Workspace B path', () => {
      expect(
        rls.canAccessStorageObject(ownerA.id, attachmentB.storage_path, 'all'),
      ).toBe(false);
    });

    it('Owner B CANNOT access Storage objects in Workspace A path', () => {
      expect(
        rls.canAccessStorageObject(ownerB.id, attachmentA.storage_path, 'all'),
      ).toBe(false);
    });
  });

  describe('8. Profile Privacy & Cross-Workspace Non-Exposure', () => {
    it('Owner A can view their own profile, Admin A profile, and Client A profile (same workspace)', () => {
      expect(rls.canSelectProfile(ownerA.id, ownerA.id)).toBe(true);
      expect(rls.canSelectProfile(ownerA.id, adminA.id)).toBe(true);
      expect(rls.canSelectProfile(ownerA.id, clientAProfile.id)).toBe(true);
    });

    it('Owner A CANNOT view Owner B or Client B profile (unshared workspace)', () => {
      expect(rls.canSelectProfile(ownerA.id, ownerB.id)).toBe(false);
      expect(rls.canSelectProfile(ownerA.id, clientBProfile.id)).toBe(false);
    });
  });

  describe('9. Client Tenant & Task Scope Enforcement', () => {
    it('Client A can view their own Completed task in Workspace A', () => {
      expect(rls.canSelectTask(clientAProfile.id, taskACompleted)).toBe(true);
    });

    it('Client A CANNOT view their own Pending task in Workspace A', () => {
      expect(rls.canSelectTask(clientAProfile.id, taskAPending)).toBe(false);
    });

    it('Client A CANNOT view tasks in Workspace B', () => {
      expect(rls.canSelectTask(clientAProfile.id, taskBCompleted)).toBe(false);
    });

    it('Client A can view and download attachments for their own Completed task', () => {
      expect(rls.canSelectAttachment(clientAProfile.id, attachmentA)).toBe(
        true,
      );
      expect(
        rls.canAccessStorageObject(
          clientAProfile.id,
          attachmentA.storage_path,
          'select',
        ),
      ).toBe(true);
    });

    it('Client A CANNOT view or download attachments for Workspace B tasks', () => {
      expect(rls.canSelectAttachment(clientAProfile.id, attachmentB)).toBe(
        false,
      );
      expect(
        rls.canAccessStorageObject(
          clientAProfile.id,
          attachmentB.storage_path,
          'select',
        ),
      ).toBe(false);
    });

    it('Client A CANNOT mutate tasks or attachments directly', () => {
      expect(rls.canMutateTask(clientAProfile.id, taskACompleted)).toBe(false);
      expect(rls.canMutateAttachment(clientAProfile.id, attachmentA)).toBe(
        false,
      );
    });
  });
});
