/**
 * AI Code Review API Endpoint
 * Handles code review requests with context enrichment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { claudeService } from '@/lib/ai/claude';
import { promptTemplateService } from '@/lib/ai/prompt-templates';
import { CodeReview } from '@/lib/types';
import { z } from 'zod';

// Request validation schema
const codeReviewRequestSchema = z.object({
     code: z.string().min(1).max(50000), // 50KB limit
     language: z.enum(['javascript', 'python', 'html']),
     lessonId: z.string().uuid().optional(),
     projectId: z.string().uuid().optional(),
     submissionId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
     try {
          // Get authenticated user
          const supabase = createServerClient();
          const {
               data: { user },
               error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Parse and validate request body
          const body = await req.json();
          const validation = codeReviewRequestSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validation.error },
                    { status: 400 }
               );
          }

          const { code, language, lessonId, projectId, submissionId } = validation.data;

          // Fetch user profile for context
          const { data: userProfile, error: profileError } = await supabase
               .from('user_profiles')
               .select('experience_level')
               .eq('id', user.id)
               .single();

          if (profileError || !userProfile) {
               return NextResponse.json(
                    { error: 'Failed to fetch user profile' },
                    { status: 500 }
               );
          }

          // Enrich context with lesson objectives if lessonId provided
          let lessonContext: { lessonTitle?: string; learningObjective?: string } = {};

          if (lessonId) {
               const { data: lesson, error: lessonError } = await supabase
                    .from('lessons')
                    .select('title, content')
                    .eq('id', lessonId)
                    .single();

               if (!lessonError && lesson) {
                    lessonContext.lessonTitle = lesson.title;
                    // Extract first learning objective if available
                    if (lesson.content?.learningObjectives?.length > 0) {
                         lessonContext.learningObjective = lesson.content.learningObjectives[0];
                    }
               }
          }

          // Build code review prompt
          const reviewPrompt = promptTemplateService.buildCodeReviewPrompt(code, language, {
               experienceLevel: userProfile.experience_level || 'beginner',
               ...lessonContext,
          });

          // Call Claude API for code review
          const reviewResponse = await claudeService.reviewCode(reviewPrompt);

          // Parse and validate JSON response
          let codeReview: CodeReview;
          try {
               const parsed = JSON.parse(reviewResponse);

               // Validate the response structure
               if (!promptTemplateService.validateCodeReviewResponse(parsed)) {
                    throw new Error('Invalid code review response structure');
               }

               codeReview = parsed as CodeReview;
          } catch (parseError) {
               console.error('Failed to parse code review response:', parseError);
               console.error('Raw response:', reviewResponse);

               return NextResponse.json(
                    {
                         error: 'Failed to generate valid code review',
                         details: parseError instanceof Error ? parseError.message : 'Unknown error',
                    },
                    { status: 500 }
               );
          }

          // Save review to project_submissions if submissionId provided
          if (submissionId) {
               const { error: updateError } = await supabase
                    .from('project_submissions')
                    .update({
                         review_feedback: codeReview,
                         score: codeReview.score,
                         status: 'reviewed',
                         reviewed_at: new Date().toISOString(),
                    })
                    .eq('id', submissionId)
                    .eq('user_id', user.id); // Ensure user owns the submission

               if (updateError) {
                    console.error('Failed to save review to submission:', updateError);
                    // Don't fail the request, just log the error
               }
          }

          // Return the code review
          return NextResponse.json({
               success: true,
               review: codeReview,
          });
     } catch (error) {
          console.error('Code review API error:', error);

          // Handle rate limit errors
          if (error instanceof Error && error.message.includes('Rate limit')) {
               return NextResponse.json(
                    { error: 'Too many requests. Please try again in a moment.' },
                    { status: 429 }
               );
          }

          // Handle service outage errors
          if (error instanceof Error && error.message.includes('Service outage')) {
               return NextResponse.json(
                    { error: 'AI service is temporarily unavailable. Please try again later.' },
                    { status: 503 }
               );
          }

          return NextResponse.json(
               {
                    error: 'Internal server error',
                    details: error instanceof Error ? error.message : 'Unknown error',
               },
               { status: 500 }
          );
     }
}
