/**
 * API Route: Update Email Preferences
 * Allows users to update their re-engagement email preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
     try {
          const supabase = createServerClient();

          // Get authenticated user
          const {
               data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Parse request body
          const body = await req.json();
          const { reengagementEmailsEnabled } = body;

          if (typeof reengagementEmailsEnabled !== 'boolean') {
               return NextResponse.json(
                    { error: 'Invalid request body' },
                    { status: 400 }
               );
          }

          // Update user profile
          const { error } = await supabase
               .from('user_profiles')
               .update({
                    reengagement_emails_enabled: reengagementEmailsEnabled,
                    updated_at: new Date().toISOString(),
               })
               .eq('id', user.id);

          if (error) {
               console.error('Error updating email preferences:', error);
               return NextResponse.json(
                    { error: 'Failed to update preferences' },
                    { status: 500 }
               );
          }

          return NextResponse.json({
               success: true,
               reengagementEmailsEnabled,
          });
     } catch (error) {
          console.error('Error in email preferences update:', error);
          return NextResponse.json(
               {
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error',
               },
               { status: 500 }
          );
     }
}
