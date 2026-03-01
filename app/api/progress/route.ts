import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth/utils';

/**
 * GET /api/progress
 * Calculate and return all dashboard metrics for the authenticated user
 */
export async function GET(req: NextRequest) {
     try {
          // Authenticate user
          const user = await requireAuth();
          const supabase = createServerClient();

          // Fetch user progress
          const { data: userProgress, error: progressError } = await supabase
               .from('user_progress')
               .select('*')
               .eq('user_id', user.id)
               .single();

          if (progressError) {
               console.error('Error fetching user progress:', progressError);
               return NextResponse.json(
                    { error: 'Failed to fetch user progress' },
                    { status: 500 }
               );
          }

          // Fetch current roadmap to calculate completion percentage
          const { data: roadmap, error: roadmapError } = await supabase
               .from('roadmaps')
               .select('id')
               .eq('user_id', user.id)
               .eq('status', 'active')
               .single();

          let roadmapCompletionPercentage = 0;
          let totalLessons = 0;

          if (roadmap && !roadmapError) {
               // Count total lessons in roadmap
               const { count: lessonCount } = await supabase
                    .from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .eq('roadmap_id', roadmap.id);

               totalLessons = lessonCount || 0;

               // Calculate completion percentage
               if (totalLessons > 0) {
                    roadmapCompletionPercentage = Math.round(
                         (userProgress.total_lessons_completed / totalLessons) * 100
                    );
               }
          }

          // Calculate current streak from daily_activity
          const currentStreak = await calculateCurrentStreak(supabase, user.id);

          // Fetch recent activity (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { data: recentActivity, error: activityError } = await supabase
               .from('daily_activity')
               .select('*')
               .eq('user_id', user.id)
               .gte('activity_date', sevenDaysAgo.toISOString().split('T')[0])
               .order('activity_date', { ascending: false });

          if (activityError) {
               console.error('Error fetching recent activity:', activityError);
          }

          // Format total learning time (convert minutes to hours and minutes)
          const totalMinutes = userProgress.total_learning_time || 0;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          // Return formatted progress data
          return NextResponse.json({
               completedLessons: userProgress.total_lessons_completed || 0,
               totalLessons,
               completedProjects: userProgress.total_projects_completed || 0,
               totalProjects: 0, // TODO: Calculate from roadmap
               roadmapCompletionPercentage,
               totalTime: {
                    minutes: totalMinutes,
                    formatted: `${hours}h ${minutes}m`,
                    hours,
                    minutesRemainder: minutes,
               },
               currentStreak,
               longestStreak: userProgress.longest_streak || 0,
               difficultyLevel: userProgress.difficulty_level || 1,
               lastActivityDate: userProgress.last_activity_date,
               recentActivity: recentActivity || [],
          });
     } catch (error) {
          console.error('Error in GET /api/progress:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}

/**
 * Calculate current streak from daily_activity table
 * Counts consecutive days with activity from today backward
 */
async function calculateCurrentStreak(
     supabase: any,
     userId: string
): Promise<number> {
     const today = new Date();
     today.setHours(0, 0, 0, 0);

     let streak = 0;
     let currentDate = new Date(today);

     // Check each day backward until we find a day without activity
     while (true) {
          const dateStr = currentDate.toISOString().split('T')[0];

          const { data, error } = await supabase
               .from('daily_activity')
               .select('*')
               .eq('user_id', userId)
               .eq('activity_date', dateStr)
               .single();

          if (error || !data) {
               // No activity on this day, streak ends
               break;
          }

          streak++;
          currentDate.setDate(currentDate.getDate() - 1);

          // Safety limit to prevent infinite loops
          if (streak > 365) break;
     }

     return streak;
}
