/**
 * POST /api/roadmap/pivot
 * Change user's learning goal and generate a new roadmap
 * Archives current roadmap and preserves all historical progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { claudeService } from '@/lib/ai/claude';
import { promptTemplateService } from '@/lib/ai/prompt-templates';
import { roadmapService } from '@/lib/services/roadmap-service';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { trackServerEvent, ServerAnalyticsEvents } from '@/lib/analytics/server-analytics';

// Validation schema
const pivotRequestSchema = z.object({
     newGoal: z.string().min(20, 'Goal must be at least 20 characters').max(500, 'Goal must be at most 500 characters'),
});

export async function POST(request: NextRequest) {
     try {
          // Get authenticated user
          const supabase = createServerClient();
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    {
                         error: 'Unauthorized',
                         message: 'You must be logged in to change your goal.',
                    },
                    { status: 401 }
               );
          }

          // Parse and validate request body
          const body = await request.json();
          const validated = pivotRequestSchema.safeParse(body);

          if (!validated.success) {
               return NextResponse.json(
                    {
                         error: 'Invalid input',
                         details: validated.error.errors.map((e) => ({
                              field: e.path.join('.'),
                              message: e.message,
                         })),
                    },
                    { status: 400 }
               );
          }

          const { newGoal } = validated.data;

          // Fetch user profile for context
          const { data: profile, error: profileError } = await supabase
               .from('user_profiles')
               .select('time_commitment, experience_level')
               .eq('id', user.id)
               .single();

          if (profileError || !profile) {
               return NextResponse.json(
                    {
                         error: 'Profile not found',
                         message: 'User profile could not be found.',
                    },
                    { status: 404 }
               );
          }

          // Get current roadmap
          const { data: userProgress } = await supabase
               .from('user_progress')
               .select('current_roadmap_id')
               .eq('user_id', user.id)
               .single();

          // Get old goal for tracking
          const { data: oldProfile } = await supabase
               .from('user_profiles')
               .select('learning_goal')
               .eq('id', user.id)
               .single();

          const oldGoal = oldProfile?.learning_goal || '';

          // Archive current roadmap if it exists
          if (userProgress?.current_roadmap_id) {
               const { error: archiveError } = await supabase
                    .from('roadmaps')
                    .update({ status: 'archived' })
                    .eq('id', userProgress.current_roadmap_id);

               if (archiveError) {
                    console.error('Error archiving roadmap:', archiveError);
                    // Continue anyway - this is not critical
               }
          }

          // Enrich context for roadmap generation
          const context = promptTemplateService.enrichRoadmapContext(
               newGoal,
               profile.time_commitment || 5, // Default to 5 hours if not set
               profile.experience_level || 'beginner'
          );

          // Build prompt
          const systemPrompt = promptTemplateService.buildRoadmapGenerationPrompt(context);

          // Generate new roadmap with retries
          let roadmapResponse;
          let lastError;
          const maxRetries = 3;

          for (let attempt = 0; attempt < maxRetries; attempt++) {
               try {
                    roadmapResponse = await claudeService.generateRoadmap(systemPrompt);

                    // Validate response structure
                    if (promptTemplateService.validateRoadmapResponse(roadmapResponse)) {
                         break;
                    } else {
                         lastError = new Error('Invalid roadmap structure returned by AI');
                         if (attempt < maxRetries - 1) {
                              // Wait before retry with exponential backoff
                              await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                              continue;
                         }
                    }
               } catch (error) {
                    lastError = error;
                    if (attempt < maxRetries - 1) {
                         // Wait before retry with exponential backoff
                         await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                         continue;
                    }
               }
          }

          // If all retries failed
          if (!roadmapResponse || !promptTemplateService.validateRoadmapResponse(roadmapResponse)) {
               console.error('Failed to generate valid roadmap after retries:', lastError);
               return NextResponse.json(
                    {
                         error: 'Failed to generate roadmap',
                         message: 'The AI service is temporarily unavailable. Please try again in a moment.',
                    },
                    { status: 503 }
               );
          }

          // Save new roadmap to database (this will update user_progress.current_roadmap_id)
          try {
               const result = await roadmapService.saveRoadmap(user.id, roadmapResponse);

               // Update user profile with new learning goal
               const { error: updateProfileError } = await supabase
                    .from('user_profiles')
                    .update({ learning_goal: newGoal })
                    .eq('id', user.id);

               if (updateProfileError) {
                    console.error('Error updating user profile:', updateProfileError);
                    // Continue anyway - roadmap is already created
               }

               // Track goal pivot event
               await trackServerEvent({
                    user_id: user.id,
                    event_type: ServerAnalyticsEvents.GOAL_PIVOTED,
                    event_data: {
                         old_goal: oldGoal,
                         new_goal: newGoal,
                         old_roadmap_id: userProgress?.current_roadmap_id,
                         new_roadmap_id: result.roadmapId,
                    },
               });

               // Return successful response
               return NextResponse.json(
                    {
                         success: true,
                         message: 'Goal changed successfully! Your new roadmap has been generated.',
                         roadmap: roadmapResponse.roadmap,
                         roadmapId: result.roadmapId,
                         lessonCount: result.lessonIds.length,
                         projectCount: result.projectIds.length,
                    },
                    { status: 200 }
               );
          } catch (saveError) {
               console.error('Error saving new roadmap:', saveError);
               return NextResponse.json(
                    {
                         error: 'Failed to save roadmap',
                         message: 'The roadmap was generated but could not be saved. Please try again.',
                    },
                    { status: 500 }
               );
          }
     } catch (error) {
          console.error('Error pivoting goal:', error);

          // Handle specific error types
          if (error instanceof Error) {
               if (error.message.includes('Rate limit')) {
                    return NextResponse.json(
                         {
                              error: 'Rate limit exceeded',
                              message: 'Too many requests. Please try again in a moment.',
                         },
                         { status: 429 }
                    );
               }

               if (error.message.includes('timeout')) {
                    return NextResponse.json(
                         {
                              error: 'Request timeout',
                              message: 'The request took too long. Please try again.',
                         },
                         { status: 504 }
                    );
               }
          }

          // Generic error response
          return NextResponse.json(
               {
                    error: 'Internal server error',
                    message: 'An unexpected error occurred. Please try again later.',
               },
               { status: 500 }
          );
     }
}
