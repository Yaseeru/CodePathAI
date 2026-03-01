/**
 * POST /api/ai/generate-roadmap
 * Generate a personalized learning roadmap based on user goals and context
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { claudeService } from '@/lib/ai/claude';
import { promptTemplateService } from '@/lib/ai/prompt-templates';
import { roadmapService } from '@/lib/services/roadmap-service';
import { createServerClient } from '@/lib/supabase';

// Validation schema
const roadmapRequestSchema = z.object({
     goal: z.string().min(20, 'Goal must be at least 20 characters').max(500, 'Goal must be at most 500 characters'),
     timeCommitment: z.number().min(1, 'Time commitment must be at least 1 hour per week').max(40, 'Time commitment must be at most 40 hours per week'),
     experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
     userId: z.string().uuid('Invalid user ID'),
});

export async function POST(request: NextRequest) {
     try {
          // Parse and validate request body
          const body = await request.json();
          const validated = roadmapRequestSchema.safeParse(body);

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

          const { goal, timeCommitment, experienceLevel, userId } = validated.data;

          // Verify user exists
          const supabase = createServerClient();
          const { data: user, error: userError } = await supabase
               .from('user_profiles')
               .select('id')
               .eq('id', userId)
               .single();

          if (userError || !user) {
               return NextResponse.json(
                    {
                         error: 'User not found',
                         message: 'The specified user does not exist.',
                    },
                    { status: 404 }
               );
          }

          // Enrich context for roadmap generation
          const context = promptTemplateService.enrichRoadmapContext(
               goal,
               timeCommitment,
               experienceLevel
          );

          // Build prompt
          const systemPrompt = promptTemplateService.buildRoadmapGenerationPrompt(context);

          // Generate roadmap with retries
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

          // Save roadmap to database
          try {
               const result = await roadmapService.saveRoadmap(userId, roadmapResponse);

               // Return successful response with database IDs
               return NextResponse.json(
                    {
                         roadmap: roadmapResponse.roadmap,
                         lessons: roadmapResponse.lessons,
                         projects: roadmapResponse.projects,
                         roadmapId: result.roadmapId,
                         lessonIds: result.lessonIds,
                         projectIds: result.projectIds,
                    },
                    { status: 200 }
               );
          } catch (saveError) {
               console.error('Error saving roadmap to database:', saveError);
               return NextResponse.json(
                    {
                         error: 'Failed to save roadmap',
                         message: 'The roadmap was generated but could not be saved. Please try again.',
                    },
                    { status: 500 }
               );
          }
     } catch (error) {
          console.error('Error generating roadmap:', error);

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
