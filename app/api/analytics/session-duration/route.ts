/**
 * GET /api/analytics/session-duration
 * Calculate average session duration
 * Returns: average time spent per session (based on daily activity)
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

          // Get all daily activity records
          const { data: activities, error: activitiesError } = await supabase
               .from('daily_activity')
               .select('time_spent')
               .gt('time_spent', 0); // Only include sessions with actual time

          if (activitiesError) {
               console.error('Error fetching activities:', activitiesError);
               return NextResponse.json(
                    { error: 'Failed to fetch activities' },
                    { status: 500 }
               );
          }

          if (!activities || activities.length === 0) {
               return NextResponse.json({
                    totalSessions: 0,
                    totalTime: 0,
                    averageDuration: 0,
                    unit: 'minutes',
                    message: 'No session data available',
               });
          }

          // Calculate total time and average
          const totalTime = activities.reduce((sum, activity) => sum + activity.time_spent, 0);
          const averageDuration = Math.round((totalTime / activities.length) * 100) / 100;

          return NextResponse.json({
               totalSessions: activities.length,
               totalTime,
               averageDuration,
               unit: 'minutes',
          });
     } catch (error) {
          console.error('Error calculating session duration:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
