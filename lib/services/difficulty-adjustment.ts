/**
 * Difficulty Adjustment Service
 * Implements adaptive difficulty algorithm based on user performance
 */

import { getRecentPerformanceMetrics, PerformanceMetrics } from './performance-metrics';
import { createClient } from '@/lib/supabase';

export interface DifficultyAdjustment {
     oldLevel: number;
     newLevel: number;
     reason: string;
     shouldNotify: boolean;
}

/**
 * Calculate difficulty adjustment based on recent performance
 * 
 * Rules:
 * - Increase difficulty if: avg completion time < 10 min AND error count < 2
 * - Decrease difficulty if: avg completion time > 20 min OR error count > 5
 * - Maintain difficulty otherwise
 * - Clamp difficulty level between 1-5
 * 
 * @param userId - User ID
 * @returns Difficulty adjustment details
 */
export async function calculateDifficultyAdjustment(
     userId: string
): Promise<DifficultyAdjustment> {
     const supabase = await createClient();

     // Get current difficulty level
     const { data: userProgress } = await supabase
          .from('user_progress')
          .select('difficulty_level')
          .eq('user_id', userId)
          .single();

     const currentLevel = userProgress?.difficulty_level || 1;

     // Get performance metrics for last 5 lessons
     const metrics: PerformanceMetrics = await getRecentPerformanceMetrics(userId, 5);

     // If not enough data, maintain current level
     if (metrics.totalLessons < 3) {
          return {
               oldLevel: currentLevel,
               newLevel: currentLevel,
               reason: 'Not enough completed lessons to adjust difficulty',
               shouldNotify: false
          };
     }

     let newLevel = currentLevel;
     let reason = '';

     // Check if should increase difficulty
     if (metrics.avgCompletionTime < 10 && metrics.avgErrorCount < 2) {
          newLevel = Math.min(currentLevel + 1, 5); // Clamp to max 5
          reason = 'Great performance! Lessons are completing quickly with few errors.';
     }
     // Check if should decrease difficulty
     else if (metrics.avgCompletionTime > 20 || metrics.avgErrorCount > 5) {
          newLevel = Math.max(currentLevel - 1, 1); // Clamp to min 1
          reason = 'Taking more time or encountering more errors. Adjusting to a more comfortable pace.';
     }
     // Maintain current level
     else {
          reason = 'Performance is steady at current difficulty level.';
     }

     return {
          oldLevel: currentLevel,
          newLevel: newLevel,
          reason: reason,
          shouldNotify: newLevel !== currentLevel
     };
}

/**
 * Apply difficulty adjustment to user progress
 * @param userId - User ID
 * @param adjustment - Difficulty adjustment details
 */
export async function applyDifficultyAdjustment(
     userId: string,
     adjustment: DifficultyAdjustment
): Promise<void> {
     if (adjustment.oldLevel === adjustment.newLevel) {
          return; // No change needed
     }

     const supabase = await createClient();
     const now = new Date().toISOString();

     // Update user_progress with new difficulty level
     await supabase
          .from('user_progress')
          .update({
               difficulty_level: adjustment.newLevel,
               updated_at: now
          })
          .eq('user_id', userId);

     // Create user_event record for adjustment
     await supabase
          .from('user_events')
          .insert({
               user_id: userId,
               event_type: 'difficulty_adjustment',
               event_data: {
                    old_level: adjustment.oldLevel,
                    new_level: adjustment.newLevel,
                    reason: adjustment.reason
               },
               created_at: now
          });
}
