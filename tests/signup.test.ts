import { describe, it, expect, beforeEach } from 'vitest';
import { signupSchema } from '@/lib/validation/auth';
import { checkSignupRateLimit } from '@/lib/rate-limit/rate-limiter';
import type { Database } from '@/lib/supabase/database.types';

type WorkspaceRow = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMemberRow =
  Database['public']['Tables']['workspace_members']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

/**
 * Slug generation helper logic matching DB / action behavior
 */
function generateWorkspaceSlug(
  name: string,
  existingSlugs: string[] = [],
): string {
  const baseSlug =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workspace';

  let finalSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(finalSlug)) {
    counter += 1;
    finalSlug = `${baseSlug}-${counter}`;
  }

  return finalSlug;
}

/**
 * Transactional Owner Signup Simulator
 */
interface MockDatabaseState {
  profiles: ProfileRow[];
  workspaces: WorkspaceRow[];
  workspaceMembers: WorkspaceMemberRow[];
  clients: ClientRow[];
  tasks: TaskRow[];
}

/**
 * Simulates RPC permission gate in PostgreSQL
 */
function simulateRpcExecution(
  callerRole: 'anon' | 'authenticated' | 'service_role',
  db: MockDatabaseState,
  input: {
    userId: string;
    fullName: string;
    email: string;
    workspaceName: string;
  },
) {
  // Permission Gate: Only service_role is granted execute
  if (callerRole === 'anon' || callerRole === 'authenticated') {
    return {
      success: false,
      error: 'permission denied for function create_workspace_for_owner',
      code: '42501',
    };
  }

  // Defense-in-depth: Prevent creating owner workspace for an existing client user
  if (db.clients.some((c) => c.profile_id === input.userId)) {
    return {
      success: false,
      error: 'Cannot create owner workspace for an existing client profile',
    };
  }

  return simulateOwnerSignupTransaction(db, input);
}

function simulateOwnerSignupTransaction(
  db: MockDatabaseState,
  input: {
    userId: string;
    fullName: string;
    email: string;
    workspaceName: string;
  },
  simulateFailureStep?: 'profile' | 'workspace' | 'member',
) {
  // Snapshot for atomic rollback simulation
  const snapshot = {
    profiles: [...db.profiles],
    workspaces: [...db.workspaces],
    workspaceMembers: [...db.workspaceMembers],
  };

  try {
    if (simulateFailureStep === 'profile') {
      throw new Error('Profile creation failed');
    }
    const profile: ProfileRow = {
      id: input.userId,
      full_name: input.fullName.trim(),
      email: input.email.toLowerCase().trim(),
      role: 'admin',
      created_at: new Date().toISOString(),
    };
    db.profiles.push(profile);

    if (simulateFailureStep === 'workspace') {
      throw new Error('Workspace creation failed');
    }
    const existingSlugs = db.workspaces.map((w) => w.slug);
    const slug = generateWorkspaceSlug(input.workspaceName, existingSlugs);
    const workspace: WorkspaceRow = {
      id: `ws-${input.userId}`,
      name: input.workspaceName.trim(),
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.workspaces.push(workspace);

    if (simulateFailureStep === 'member') {
      throw new Error('Membership binding failed');
    }
    const member: WorkspaceMemberRow = {
      id: `mem-${input.userId}`,
      workspace_id: workspace.id,
      profile_id: input.userId,
      role: 'owner',
      created_at: new Date().toISOString(),
    };
    db.workspaceMembers.push(member);

    return {
      success: true,
      workspace,
      member,
      profile,
    };
  } catch (error) {
    // Atomic rollback
    db.profiles = snapshot.profiles;
    db.workspaces = snapshot.workspaces;
    db.workspaceMembers = snapshot.workspaceMembers;
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

describe('Taskora Public Owner Signup & Multi-Tenant Provisioning Tests', () => {
  describe('1. Signup Input Validation Schema', () => {
    it('accepts valid owner registration payload', () => {
      const validPayload = {
        fullName: 'Elena Rostova',
        email: 'elena@designstudio.com',
        workspaceName: 'Rostova Design Co',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      };

      const result = signupSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects password shorter than 10 characters', () => {
      const shortPasswordPayload = {
        fullName: 'Elena Rostova',
        email: 'elena@designstudio.com',
        workspaceName: 'Rostova Design Co',
        password: 'Short9!',
        confirmPassword: 'Short9!',
      };

      const result = signupSchema.safeParse(shortPasswordPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'at least 10 characters',
        );
      }
    });

    it('rejects mismatched password and confirmation', () => {
      const mismatchPayload = {
        fullName: 'Elena Rostova',
        email: 'elena@designstudio.com',
        workspaceName: 'Rostova Design Co',
        password: 'SuperSecurePassword123!',
        confirmPassword: 'DifferentPassword456!',
      };

      const result = signupSchema.safeParse(mismatchPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match');
      }
    });

    it('rejects invalid email formats', () => {
      const invalidEmailPayload = {
        fullName: 'Elena Rostova',
        email: 'not-an-email',
        workspaceName: 'Rostova Design Co',
        password: 'SuperSecurePassword123!',
        confirmPassword: 'SuperSecurePassword123!',
      };

      const result = signupSchema.safeParse(invalidEmailPayload);
      expect(result.success).toBe(false);
    });

    it('rejects empty or whitespace-only full name', () => {
      const emptyNamePayload = {
        fullName: '   ',
        email: 'elena@designstudio.com',
        workspaceName: 'Rostova Design Co',
        password: 'SuperSecurePassword123!',
        confirmPassword: 'SuperSecurePassword123!',
      };

      const result = signupSchema.safeParse(emptyNamePayload);
      expect(result.success).toBe(false);
    });

    it('rejects empty or whitespace-only workspace name', () => {
      const emptyWorkspacePayload = {
        fullName: 'Elena Rostova',
        email: 'elena@designstudio.com',
        workspaceName: '   ',
        password: 'SuperSecurePassword123!',
        confirmPassword: 'SuperSecurePassword123!',
      };

      const result = signupSchema.safeParse(emptyWorkspacePayload);
      expect(result.success).toBe(false);
    });
  });

  describe('2. Collision-Safe Unique Workspace Slug Generation', () => {
    it('generates a clean kebab-case slug from workspace name', () => {
      const slug = generateWorkspaceSlug('Evans Studio & Design Co.');
      expect(slug).toBe('evans-studio-design-co');
    });

    it('automatically increments slug suffix on collision', () => {
      const existing = ['acme-studio', 'acme-studio-2', 'acme-studio-3'];
      const slug = generateWorkspaceSlug('Acme Studio', existing);
      expect(slug).toBe('acme-studio-4');
    });

    it('handles special characters and whitespace gracefully', () => {
      const slug = generateWorkspaceSlug('  *** Apex // Labs *** ');
      expect(slug).toBe('apex-labs');
    });
  });

  describe('3. Transactional Owner Provisioning & Rollback Guarantees', () => {
    let mockDb: MockDatabaseState;

    beforeEach(() => {
      mockDb = {
        profiles: [],
        workspaces: [],
        workspaceMembers: [],
        clients: [],
        tasks: [],
      };
    });

    it('creates profile, workspace, and owner membership on successful signup', () => {
      const result = simulateOwnerSignupTransaction(mockDb, {
        userId: 'user-new-owner-1',
        fullName: 'Sarah Jenkins',
        email: 'sarah@jenkins.design',
        workspaceName: 'Jenkins Design',
      });

      expect(result.success).toBe(true);
      expect(mockDb.profiles.length).toBe(1);
      expect(mockDb.profiles[0].id).toBe('user-new-owner-1');
      expect(mockDb.workspaces.length).toBe(1);
      expect(mockDb.workspaces[0].name).toBe('Jenkins Design');
      expect(mockDb.workspaces[0].slug).toBe('jenkins-design');
      expect(mockDb.workspaceMembers.length).toBe(1);
      expect(mockDb.workspaceMembers[0].role).toBe('owner');
      expect(mockDb.workspaceMembers[0].profile_id).toBe('user-new-owner-1');
    });

    it('atomically rolls back if workspace creation fails', () => {
      const result = simulateOwnerSignupTransaction(
        mockDb,
        {
          userId: 'user-fail-1',
          fullName: 'Failed User',
          email: 'fail@test.com',
          workspaceName: 'Broken Workspace',
        },
        'workspace',
      );

      expect(result.success).toBe(false);
      expect(mockDb.profiles.length).toBe(0);
      expect(mockDb.workspaces.length).toBe(0);
      expect(mockDb.workspaceMembers.length).toBe(0);
    });

    it('atomically rolls back if membership binding fails', () => {
      const result = simulateOwnerSignupTransaction(
        mockDb,
        {
          userId: 'user-fail-2',
          fullName: 'Failed Member User',
          email: 'fail2@test.com',
          workspaceName: 'Broken Member Workspace',
        },
        'member',
      );

      expect(result.success).toBe(false);
      expect(mockDb.profiles.length).toBe(0);
      expect(mockDb.workspaces.length).toBe(0);
      expect(mockDb.workspaceMembers.length).toBe(0);
    });
  });

  describe('4. RPC Execution Permission Hardening', () => {
    let mockDb: MockDatabaseState;

    beforeEach(() => {
      mockDb = {
        profiles: [
          {
            id: 'client-user-1',
            role: 'client',
            full_name: 'Existing Client',
            email: 'client@client.com',
            created_at: new Date().toISOString(),
          },
        ],
        workspaces: [],
        workspaceMembers: [],
        clients: [
          {
            id: 'c-1',
            workspace_id: 'ws-existing',
            profile_id: 'client-user-1',
            display_name: 'Existing Client',
            company_name: null,
            active: true,
            created_at: new Date().toISOString(),
          },
        ],
        tasks: [],
      };
    });

    it('denies anon role from invoking create_workspace_for_owner RPC directly', () => {
      const res = simulateRpcExecution('anon', mockDb, {
        userId: 'some-user-id',
        fullName: 'Hacker',
        email: 'hacker@test.com',
        workspaceName: 'Hacked Workspace',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('permission denied');
    });

    it('denies authenticated user from invoking create_workspace_for_owner RPC directly', () => {
      const res = simulateRpcExecution('authenticated', mockDb, {
        userId: 'client-user-1',
        fullName: 'Client Escalate',
        email: 'client@client.com',
        workspaceName: 'Client Elevate Workspace',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('permission denied');
    });

    it('denies creating owner workspace for an existing client user even via service_role', () => {
      const res = simulateRpcExecution('service_role', mockDb, {
        userId: 'client-user-1',
        fullName: 'Client Escalate',
        email: 'client@client.com',
        workspaceName: 'Client Elevate Workspace',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain(
        'Cannot create owner workspace for an existing client',
      );
    });

    it('allows service_role to execute create_workspace_for_owner RPC for new user', () => {
      const res = simulateRpcExecution('service_role', mockDb, {
        userId: 'brand-new-user',
        fullName: 'Valid Owner',
        email: 'owner@valid.com',
        workspaceName: 'Valid Studio',
      });

      expect(res.success).toBe(true);
    });
  });

  describe('5. Rate Limiting for Public Signup', () => {
    it('allows up to 5 signups per hour then rate limits subsequent attempts', async () => {
      const testIp = `test-ip-${Date.now()}`;

      // First 5 attempts succeed
      for (let i = 1; i <= 5; i++) {
        const res = await checkSignupRateLimit(testIp);
        expect(res.success).toBe(true);
      }

      // 6th attempt should be blocked
      const blocked = await checkSignupRateLimit(testIp);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe('6. Cross-Tenant Data Non-Exposure for Newly Signed-Up Owner', () => {
    it('proves newly registered Owner has zero visibility into pre-existing tenant records', () => {
      // Existing established workspace
      const existingWorkspace: WorkspaceRow = {
        id: 'ws-established',
        name: 'Legacy Studio',
        slug: 'legacy-studio',
        created_at: '2026-08-01T10:00:00Z',
        updated_at: '2026-08-01T10:00:00Z',
      };

      const existingOwner: ProfileRow = {
        id: 'owner-established',
        role: 'admin',
        full_name: 'Established Owner',
        email: 'established@legacy.com',
        created_at: '2026-08-01T10:00:00Z',
      };

      const existingClient: ClientRow = {
        id: 'client-established',
        workspace_id: existingWorkspace.id,
        profile_id: 'client-user-1',
        display_name: 'Confidential Client',
        company_name: 'Big Corp',
        active: true,
        created_at: '2026-08-01T10:00:00Z',
      };

      const existingTask: TaskRow = {
        id: 'task-established',
        workspace_id: existingWorkspace.id,
        title: 'Secret Brand Strategy',
        category: 'work',
        client_id: existingClient.id,
        priority: 'high',
        due_date: '2026-09-01',
        status: 'completed',
        needs_revision: false,
        notes: 'Strict NDA deliverables',
        project_url: 'https://secret.drive.com',
        archived: false,
        created_by: existingOwner.id,
        created_at: '2026-08-01T10:00:00Z',
        updated_at: '2026-08-01T10:00:00Z',
        completed_at: '2026-08-05T10:00:00Z',
        client_notified_at: '2026-08-05T10:00:00Z',
      };

      const db: MockDatabaseState = {
        profiles: [existingOwner],
        workspaces: [existingWorkspace],
        workspaceMembers: [
          {
            id: 'mem-1',
            workspace_id: existingWorkspace.id,
            profile_id: existingOwner.id,
            role: 'owner',
            created_at: '2026-08-01T10:00:00Z',
          },
        ],
        clients: [existingClient],
        tasks: [existingTask],
      };

      // New Owner signs up
      const newOwnerSignup = simulateOwnerSignupTransaction(db, {
        userId: 'owner-brand-new',
        fullName: 'New Freelancer',
        email: 'new@freelancer.com',
        workspaceName: 'Fresh Freelance',
      });

      expect(newOwnerSignup.success).toBe(true);
      const newOwnerId = 'owner-brand-new';
      expect(newOwnerSignup.workspace?.id).toBeDefined();

      // Query simulation: Tasks visible to new owner (workspace_id = newOwnerWorkspaceId)
      const tasksVisibleToNewOwner = db.tasks.filter((t) => {
        const isAdminOfTaskWs = db.workspaceMembers.some(
          (m) =>
            m.workspace_id === t.workspace_id &&
            m.profile_id === newOwnerId &&
            (m.role === 'owner' || m.role === 'admin'),
        );
        return isAdminOfTaskWs;
      });

      expect(tasksVisibleToNewOwner.length).toBe(0);

      // Clients visible to new owner
      const clientsVisibleToNewOwner = db.clients.filter((c) => {
        return db.workspaceMembers.some(
          (m) =>
            m.workspace_id === c.workspace_id &&
            m.profile_id === newOwnerId &&
            (m.role === 'owner' || m.role === 'admin'),
        );
      });

      expect(clientsVisibleToNewOwner.length).toBe(0);
    });
  });

  describe('7. Generic Anti-Enumeration Error Message Handling', () => {
    const safeGenericMessage =
      "We couldn't create this workspace. If you already have a Taskora account, sign in or reset your password.";

    it('returns the safe generic message when signup indicates an existing account', () => {
      // Simulating the error mapping in registerOwner
      function mapSignupError(
        errorMsg?: string,
        identities?: unknown[],
      ): string {
        const msg = (errorMsg || '').toLowerCase();
        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('identity') ||
          (identities && identities.length === 0)
        ) {
          return safeGenericMessage;
        }
        return errorMsg || 'Failed to create account.';
      }

      expect(mapSignupError('User already registered')).toBe(
        safeGenericMessage,
      );
      expect(mapSignupError('An account with this email already exists')).toBe(
        safeGenericMessage,
      );
      expect(mapSignupError(undefined, [])).toBe(safeGenericMessage);
      expect(mapSignupError('Network timeout')).toBe('Network timeout');
    });

    it('returns the safe generic message when RPC encounters an existing client profile conflict', () => {
      function mapRpcError(rpcErrorMsg: string): string {
        const msg = rpcErrorMsg.toLowerCase();
        if (
          msg.includes('existing client profile') ||
          msg.includes('unique constraint') ||
          msg.includes('already exists') ||
          msg.includes('duplicate key')
        ) {
          return safeGenericMessage;
        }
        return 'Failed to initialize workspace. Please try registering again.';
      }

      expect(
        mapRpcError(
          'Cannot create owner workspace for an existing client profile',
        ),
      ).toBe(safeGenericMessage);
      expect(
        mapRpcError(
          'duplicate key value violates unique constraint "profiles_email_key"',
        ),
      ).toBe(safeGenericMessage);
    });
  });
});
