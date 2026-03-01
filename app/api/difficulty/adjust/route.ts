import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import {
     calculateDifficultyAdjustment,
     applyDifficultyAdjustment
} from '@/lib/services/difficulty-adjustment';

/**
 * POST /api/difficulty/adjust
 * Calculate and apply difficulty adjustment based on recent performance
 * - Analyze last 5 lessons performance
 * - Calculate new difficulty level
 * - Update user_progress.difficulty_level
 * - Create user_event record for adjustment
 * - Generate notification for user if level changes
 */
export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();

          // Get authenticated user
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Calculate difficulty adjustment
          const adjustment = await calculateDifficultyAdjustment(user.id);

          // Apply adjustment if there's a change
          if (adjustment.shouldNotify) {
               await applyDifficultyAdjustment(user.id, adjustment);
          }

          // Generate notification message
          let notification = null;
          if (adjustment.shouldNotify) {
               const levelChange = adjustment.newLevel > adjustment.oldLevel ? 'increased' : 'decreased';
               notification = {
                    type: 'difficulty_adjustment',
                    title: `Difficulty Level ${levelChange.charAt(0).toUpperCase() + levelChange.slice(1)}`,
                    message: adjustment.reason,
                    oldLevel: adjustment.oldLevel,
                    newLevel: adjustment.newLevel
               };
          }

          return NextResponse.json({
               success: true,
               adjustment: {
                    oldLevel: adjustment.oldLevel,
                    newLevel: adjustment.newLevel,
                    changed: adjustment.shouldNotify,
                    reason: adjustment.reason
               },
               notification
          });

     } catch (error) {
          console.error('Error adjusting difficulty:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
