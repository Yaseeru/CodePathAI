/**
 * GET /api/analytics/retention
 * Calculate Day-7 user retention rate
 * Returns: percentage of users who were active 7 days after registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
     try {
          const supabase = createServerClient();

          // Get authenticated user (admin check could be added here)
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Get users who registered at least 7 days ago
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const sevenDaysAgoISO = sevenDaysAgo.toISOString();

          const { data: eligibleUsers, error: usersError } = await supabase
               .from('user_profiles')
               .select('id, created_at')
               .lt('created_at', sevenDaysAgoISO);

          if (usersError) {
               console.error('Error fetching eligible users:', usersError);
               return NextResponse.json(
                    { error: 'Failed to fetch users' },
                    { status: 500 }
               );
          }

          if (!eligibleUsers || eligibleUsers.length === 0) {
               return NextResponse.json({
                    totalEligibleUsers: 0,
                    retainedUsers: 0,
                    retentionRate: 0,
                    unit: 'percentage',
                    message: 'No users have been registered for 7+ days yet',
               });
          }

          // For each user, check if they had activity on day 7 (±1 day window)
          let retainedCount = 0;

          for (const eligibleUser of eligibleUsers) {
               const registrationDate = new Date(eligibleUser.created_at);
               const day7 = new Date(registrationDate);
               day7.setDate(day7.getDate() + 7);

               // Check for activity within ±1 day of day 7
               const day6 = new Date(day7);
               day6.setDate(day6.getDate() - 1);
               const day8 = new Date(day7);
               day8.setDate(day8.getDate() + 1);

               const day6Str = day6.toISOString().split('T')[0];
               const day7Str = day7.toISOString().split('T')[0];
               const day8Str = day8.toISOString().split('T')[0];

               // Check if user had any activity on day 6, 7, or 8
               const { data: activity, error: activityError } = await supabase
                    .from('daily_activity')
                    .select('id')
                    .eq('user_id', eligibleUser.id)
                    .in('activity_date', [day6Str, day7Str, day8Str])
                    .limit(1);

               if (!activityError && activity && activity.length > 0) {
                    retainedCount++;
               }
          }

          // Calculate retention rate
          const retentionRate = eligibleUsers.length > 0
               ? Math.round((retainedCount / eligibleUsers.length) * 100 * 100) / 100
               : 0;

          return NextResponse.json({
               totalEligibleUsers: eligibleUsers.length,
               retainedUsers: retainedCount,
               retentionRate,
               unit: 'percentage',
          });
     } catch (error) {
          console.error('Error calculating retention:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
