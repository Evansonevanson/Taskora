'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type UpdateClientInput,
} from '@/lib/validation/client';
import { checkClientCreationRateLimit } from '@/lib/rate-limit/rate-limiter';
import { sendEmail } from '@/lib/email/client';
import { generateClientInviteEmailHtml } from '@/lib/email/templates/client-invite';
import type { Database } from '@/lib/supabase/database.types';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface CreatedClientResult {
  id: string;
  email: string;
  displayName: string;
  temporaryPassword: string;
  emailSent: boolean;
}

export async function createClient(
  rawInput: CreateClientInput,
): Promise<ActionResponse<CreatedClientResult>> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Verify Admin Role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as {
      role: Database['public']['Tables']['profiles']['Row']['role'];
    } | null;

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    // 2. Rate Limiting: 20 per hour per admin
    const rateLimit = await checkClientCreationRateLimit(user.id);

    if (!rateLimit.success) {
      return {
        success: false,
        error:
          'Rate limit exceeded for client creation. Please try again later.',
      };
    }

    // 3. Validate Input
    const parseResult = createClientSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const input = parseResult.data;
    const fullName = input.fullName || input.displayName;
    const temporaryPassword =
      input.temporaryPassword && input.temporaryPassword.trim() !== ''
        ? input.temporaryPassword.trim()
        : `${crypto.randomBytes(4).toString('hex')}A1!${crypto.randomBytes(2).toString('hex')}`;

    // 4. Provision via Supabase Admin Client
    const adminClient = createAdminClient();

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: input.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'client',
        },
      });

    if (authError || !authData.user) {
      const errorMsg = authError?.message || 'Failed to create user account';
      if (
        errorMsg.toLowerCase().includes('already') ||
        errorMsg.toLowerCase().includes('exists')
      ) {
        return {
          success: false,
          error: 'An account with this email address already exists.',
          fieldErrors: {
            email: ['An account with this email address already exists.'],
          },
        };
      }
      return { success: false, error: errorMsg };
    }

    const authUserId = authData.user.id;

    // 5. Insert Profiles record
    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: authUserId,
      role: 'client',
      full_name: fullName,
      email: input.email,
    });

    if (profileError) {
      console.error('Error inserting profile record:', profileError);
      return { success: false, error: 'Failed to create client profile' };
    }

    // 6. Insert Clients record
    const { data: clientRecord, error: clientError } = await adminClient
      .from('clients')
      .insert({
        profile_id: authUserId,
        display_name: input.displayName,
        company_name: input.companyName || null,
        active: true,
      })
      .select('id')
      .single();

    if (clientError) {
      console.error('Error inserting client record:', clientError);
      return { success: false, error: 'Failed to create client record' };
    }

    const clientId = (clientRecord as { id: string }).id;
    let emailSent = false;

    // 7. Send Invite Email if requested
    if (input.sendInviteEmail) {
      const appUrl =
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

      const emailHtml = generateClientInviteEmailHtml({
        clientName: input.displayName,
        companyName: input.companyName || undefined,
        email: input.email,
        temporaryPassword,
        appUrl,
      });

      const emailResult = await sendEmail({
        to: input.email,
        subject: 'Welcome to Taskora — Your Client Portal Credentials',
        html: emailHtml,
      });

      emailSent = emailResult.success;
    }

    revalidatePath('/admin/clients');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      data: {
        id: clientId,
        email: input.email,
        displayName: input.displayName,
        temporaryPassword,
        emailSent,
      },
    };
  } catch (err) {
    console.error('Unexpected error in createClient action:', err);
    return { success: false, error: 'Failed to create client' };
  }
}

export async function updateClient(
  clientId: string,
  rawInput: UpdateClientInput,
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify Admin Role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as {
      role: Database['public']['Tables']['profiles']['Row']['role'];
    } | null;

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    // Validate input
    const parseResult = updateClientSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const input = parseResult.data;

    // Fetch existing client to retrieve profile_id
    const { data: clientData, error: clientFetchError } = await supabase
      .from('clients')
      .select('id, profile_id')
      .eq('id', clientId)
      .maybeSingle();

    if (clientFetchError || !clientData) {
      return { success: false, error: 'Client not found' };
    }

    const typedClient = clientData as { id: string; profile_id: string };

    const adminClient = createAdminClient();

    // Update clients record
    const { error: clientUpdateError } = await adminClient
      .from('clients')
      .update({
        display_name: input.displayName,
        company_name: input.companyName || null,
      })
      .eq('id', clientId);

    if (clientUpdateError) {
      console.error('Error updating client record:', clientUpdateError);
      return { success: false, error: 'Failed to update client details' };
    }

    // Update profiles full_name if provided
    if (input.fullName) {
      const { error: profileUpdateError } = await adminClient
        .from('profiles')
        .update({
          full_name: input.fullName,
        })
        .eq('id', typedClient.profile_id);

      if (profileUpdateError) {
        console.error('Error updating profile record:', profileUpdateError);
      }
    }

    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in updateClient action:', err);
    return { success: false, error: 'Failed to update client' };
  }
}

export async function toggleClientStatus(
  clientId: string,
  active: boolean,
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify Admin Role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as {
      role: Database['public']['Tables']['profiles']['Row']['role'];
    } | null;

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    const adminClient = createAdminClient();

    // Update active status
    const { error } = await adminClient
      .from('clients')
      .update({ active })
      .eq('id', clientId);

    if (error) {
      console.error('Error toggling client status:', error);
      return { success: false, error: 'Failed to update client status' };
    }

    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in toggleClientStatus action:', err);
    return { success: false, error: 'Failed to update client status' };
  }
}
