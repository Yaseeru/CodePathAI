/**
 * GET /api/analytics/lesson-completion-rate
 * Calculate lesson completion rate
 * Returns: percentage of started lessons that were completed
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

          // Count total lessons started (status is not 'not_started')
          const { count: startedLessons, error: startedError } = await supabase
               .from('lesson_progress')
               .select('*', { count: 'exact', head: true })
               .neq('status', 'not_started');

          if (startedError) {
               console.error('Error counting started lessons:', startedError);
               return NextResponse.json(
                    { error: 'Failed to fetch started lessons' },
                    { status: 500 }
               );
          }

          // Count completed lessons
          const { count: completedLessons, error: completedError } = await supabase
               .from('lesson_progress')
               .select('*', { count: 'exact', head: true })
               .eq('status', 'completed');

          if (completedError) {
               console.error('Error counting completed lessons:', completedError);
               return NextResponse.json(
                    { error: 'Failed to fetch completed lessons' },
                    { status: 500 }
               );
          }

          // Calculate completion rate
          const completionRate = startedLessons && startedLessons > 0
               ? Math.round((completedLessons! / startedLessons) * 100 * 100) / 100
               : 0;

          return NextResponse.json({
               startedLessons: startedLessons || 0,
               completedLessons: completedLessons || 0,
               completionRate,
               unit: 'percentage',
          });
     } catch (error) {
          console.error('Error calculating lesson completion rate:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
