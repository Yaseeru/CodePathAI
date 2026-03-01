/**
 * Performance Metrics Service
 * Tracks and calculates user performance metrics for adaptive difficulty
 */

import { createClient } from '@/lib/supabase';

export interface PerformanceMetrics {
     avgCompletionTime: number;
     avgErrorCount: number;
     totalLessons: number;
}

/**
 * Get performance metrics for the last N lessons
 * @param userId - User ID
 * @param lessonCount - Number of recent lessons to analyze (default: 5)
 * @returns Performance metrics
 */
export async function getRecentPerformanceMetrics(
     userId: string,
     lessonCount: number = 5
): Promise<PerformanceMetrics> {
     const supabase = await createClient();

     // Get the last N completed lessons
     const { data: recentLessons, error } = await supabase
          .from('lesson_progress')
          .select('completion_time, error_count')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .not('completion_time', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(lessonCount);

     if (error || !recentLessons || recentLessons.length === 0) {
          return {
               avgCompletionTime: 0,
               avgErrorCount: 0,
               totalLessons: 0
          };
     }

     const totalCompletionTime = recentLessons.reduce(
          (sum, lesson) => sum + (lesson.completion_time || 0),
          0
     );

     const totalErrorCount = recentLessons.reduce(
          (sum, lesson) => sum + (lesson.error_count || 0),
          0
     );

     return {
          avgCompletionTime: totalCompletionTime / recentLessons.length,
          avgErrorCount: totalErrorCount / recentLessons.length,
          totalLessons: recentLessons.length
     };
}

/**
 * Update error count for a lesson
 * @param userId - User ID
 * @param lessonId - Lesson ID
 */
export async function incrementLessonErrorCount(
     userId: string,
     lessonId: string
): Promise<void> {
     const supabase = await createClient();

     // Get current error count
     const { data: progress } = await supabase
          .from('lesson_progress')
          .select('error_count')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .single();

     if (progress) {
          await supabase
               .from('lesson_progress')
               .update({
                    error_count: (progress.error_count || 0) + 1,
                    updated_at: new Date().toISOString()
               })
               .eq('user_id', userId)
               .eq('lesson_id', lessonId);
     }
}

/**
 * Update attempts count for a lesson
 * @param userId - User ID
 * @param lessonId - Lesson ID
 */
export async function incrementLessonAttempts(
     userId: string,
     lessonId: string
): Promise<void> {
     const supabase = await createClient();

     // Get current attempts count
     const { data: progress } = await supabase
          .from('lesson_progress')
          .select('attempts')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .single();

     if (progress) {
          await supabase
               .from('lesson_progress')
               .update({
                    attempts: (progress.attempts || 0) + 1,
                    updated_at: new Date().toISOString()
               })
               .eq('user_id', userId)
               .eq('lesson_id', lessonId);
     }
}
