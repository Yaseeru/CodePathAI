/**
 * User Account Deletion API Endpoint
 * Allows users to delete their account and all associated data (GDPR compliance)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for account deletion
const deleteAccountSchema = z.object({
     confirmation: z.literal('DELETE_MY_ACCOUNT'),
});

export async function DELETE(request: NextRequest) {
     try {
          const supabase = createServerClient();

          // Get authenticated user
          const {
               data: { user },
               error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Parse and validate request body
          const body = await request.json();
          const validation = deleteAccountSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid confirmation. Please type "DELETE_MY_ACCOUNT" to confirm.' },
                    { status: 400 }
               );
          }

          // Delete user data from database
          // The CASCADE constraints will automatically delete related data:
          // - roadmaps (and their lessons/projects via CASCADE)
          // - lesson_progress
          // - project_submissions
          // - user_progress
          // - conversations (and their messages via CASCADE)
          // - code_saves
          // - user_events
          // - daily_activity
          // - nps_responses

          const { error: profileDeleteError } = await supabase
               .from('user_profiles')
               .delete()
               .eq('id', user.id);

          if (profileDeleteError) {
               console.error('Profile deletion error:', profileDeleteError);
               return NextResponse.json(
                    { error: 'Failed to delete user profile' },
                    { status: 500 }
               );
          }

          // Delete auth user from Supabase Auth
          // Note: This requires admin privileges, so we'll use the service role
          // In production, this should be done via a server-side admin client
          const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

          if (authDeleteError) {
               console.error('Auth user deletion error:', authDeleteError);
               // Profile is already deleted, but auth user remains
               // This should be handled by a cleanup job
               return NextResponse.json(
                    {
                         error: 'Account data deleted, but authentication cleanup failed. Please contact support.',
                         partialSuccess: true
                    },
                    { status: 500 }
               );
          }

          return NextResponse.json(
               { message: 'Account and all associated data have been permanently deleted.' },
               { status: 200 }
          );
     } catch (error) {
          console.error('Account deletion error:', error);
          return NextResponse.json(
               { error: 'Failed to delete account' },
               { status: 500 }
          );
     }
}
