import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/supabase';

// Configure route caching - revalidate every 5 minutes
export const revalidate = 300;

/**
 * GET /api/progress
 * Calculate and return all dashboard metrics for the authenticated user
 */
export async function GET(req: NextRequest) {
     try {
          // Authenticate user
          const user = await getUser();

          if (!user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          const supabase = createServerClient();

          // Fetch or create user progress
          let { data: userProgress, error: progressError } = await supabase
               .from('user_progress')
               .select('*')
               .eq('user_id', user.id)
               .single();

          // If no progress record exists, create one
          if (progressError || !userProgress) {
               const { data: newProgress, error: createError } = await supabase
                    .from('user_progress')
                    .insert({
                         user_id: user.id,
                         total_lessons_completed: 0,
                         total_projects_completed: 0,
                         total_learning_time: 0,
                         current_streak: 0,
                         longest_streak: 0,
                         difficulty_level: 1,
                    })
                    .select()
                    .single();

               if (createError) {
                    console.error('Error creating user progress:', createError);
                    // Return default values if we can't create the record
                    return NextResponse.json({
                         completedLessons: 0,
                         totalLessons: 0,
                         completedProjects: 0,
                         totalProjects: 0,
                         roadmapCompletionPercentage: 0,
                         totalTime: {
                              minutes: 0,
                              formatted: '0h 0m',
                              hours: 0,
                              minutesRemainder: 0,
                         },
                         currentStreak: 0,
                         longestStreak: 0,
                         difficultyLevel: 1,
                         lastActivityDate: null,
                         recentActivity: [],
                    });
               }

               userProgress = newProgress;
          }

          // Fetch current roadmap to calculate completion percentage
          const { data: roadmap } = await supabase
               .from('roadmaps')
               .select('id')
               .eq('user_id', user.id)
               .eq('status', 'active')
               .single();

          let roadmapCompletionPercentage = 0;
          let totalLessons = 0;

          if (roadmap) {
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

          const { data: recentActivity } = await supabase
               .from('daily_activity')
               .select('*')
               .eq('user_id', user.id)
               .gte('activity_date', sevenDaysAgo.toISOString().split('T')[0])
               .order('activity_date', { ascending: false });

          // Format total learning time (convert minutes to hours and minutes)
          const totalMinutes = userProgress.total_learning_time || 0;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          // Return formatted progress data
          return NextResponse.json({
               completedLessons: userProgress.total_lessons_completed || 0,
               totalLessons,
               completedProjects: userProgress.total_projects_completed || 0,
               totalProjects: 0,
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
