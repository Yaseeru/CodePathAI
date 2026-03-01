import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { claudeService } from '@/lib/ai/claude';
import { trackServerEvent, ServerAnalyticsEvents } from '@/lib/analytics/server-analytics';

// Validation schema
const submitProjectSchema = z.object({
     code: z.string().min(1).max(500000), // 500KB limit
     language: z.enum(['javascript', 'python', 'html']),
});

interface RouteContext {
     params: Promise<{ id: string }>;
}

export async function POST(
     request: NextRequest,
     context: RouteContext
) {
     try {
          const { id: projectId } = await context.params;
          const supabase = await createClient();

          // Get authenticated user
          const {
               data: { user },
               error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Parse and validate request body
          const body = await request.json();
          const validated = submitProjectSchema.safeParse(body);

          if (!validated.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validated.error.errors },
                    { status: 400 }
               );
          }

          const { code, language } = validated.data;

          // Fetch project details
          const { data: project, error: projectError } = await supabase
               .from('projects')
               .select('*, roadmap_id')
               .eq('id', projectId)
               .single();

          if (projectError || !project) {
               return NextResponse.json(
                    { error: 'Project not found' },
                    { status: 404 }
               );
          }

          // Verify user owns the roadmap
          const { data: roadmap, error: roadmapError } = await supabase
               .from('roadmaps')
               .select('user_id')
               .eq('id', project.roadmap_id)
               .single();

          if (roadmapError || !roadmap || roadmap.user_id !== user.id) {
               return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
               );
          }

          // Get user profile for context
          const { data: userProfile } = await supabase
               .from('user_profiles')
               .select('experience_level, learning_goal')
               .eq('id', user.id)
               .single();

          // Insert project submission record
          const { data: submission, error: submissionError } = await supabase
               .from('project_submissions')
               .insert({
                    user_id: user.id,
                    project_id: projectId,
                    code,
                    language,
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
               })
               .select()
               .single();

          if (submissionError || !submission) {
               console.error('Error creating submission:', submissionError);
               return NextResponse.json(
                    { error: 'Failed to submit project' },
                    { status: 500 }
               );
          }

          // Trigger AI code review asynchronously
          // We don't await this to return response quickly
          triggerAICodeReview(
               submission.id,
               code,
               language,
               project,
               userProfile?.experience_level || 'beginner',
               supabase
          ).catch((error) => {
               console.error('AI code review failed:', error);
          });

          // Track project submission event
          await trackServerEvent({
               user_id: user.id,
               event_type: ServerAnalyticsEvents.PROJECT_SUBMITTED,
               event_data: {
                    project_id: projectId,
                    roadmap_id: project.roadmap_id,
                    language,
                    code_length: code.length,
               },
          });

          return NextResponse.json({
               success: true,
               submissionId: submission.id,
               status: 'submitted',
               message: 'Project submitted successfully. AI review is in progress.',
          });
     } catch (error) {
          console.error('Error in submit project endpoint:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}

/**
 * Trigger AI code review asynchronously
 */
async function triggerAICodeReview(
     submissionId: string,
     code: string,
     language: string,
     project: any,
     experienceLevel: string,
     supabase: any
) {
     try {
          // Build code review prompt
          const reviewPrompt = buildCodeReviewPrompt(
               code,
               language,
               project,
               experienceLevel
          );

          // Get AI review
          const review = await claudeService.reviewCode(reviewPrompt);

          // Parse review response
          const reviewFeedback = parseCodeReview(review);

          // Update submission with review
          const { error: updateError } = await supabase
               .from('project_submissions')
               .update({
                    status: 'reviewed',
                    review_feedback: reviewFeedback,
                    score: reviewFeedback.score,
                    reviewed_at: new Date().toISOString(),
               })
               .eq('id', submissionId);

          if (updateError) {
               console.error('Error updating submission with review:', updateError);
          }
     } catch (error) {
          console.error('Error in AI code review:', error);

          // Update submission status to indicate review failed
          await supabase
               .from('project_submissions')
               .update({
                    status: 'review_failed',
                    review_feedback: {
                         overallFeedback: 'AI review failed. Please try resubmitting.',
                         score: 0,
                         issues: [],
                         suggestions: [],
                    },
               })
               .eq('id', submissionId);
     }
}

/**
 * Build code review prompt for Claude
 */
function buildCodeReviewPrompt(
     code: string,
     language: string,
     project: any,
     experienceLevel: string
): string {
     return `Review the following code submission for a coding learner:

Learner context:
- Experience level: ${experienceLevel}
- Project: ${project.title}
- Project description: ${project.description}

Project requirements:
${JSON.stringify(project.requirements, null, 2)}

Success criteria:
${JSON.stringify(project.success_criteria, null, 2)}

Code:
\`\`\`${language}
${code}
\`\`\`

Evaluation criteria:
1. Correctness: Does it meet the project requirements?
2. Code quality: Is it readable and well-structured?
3. Best practices: Does it follow ${language} conventions?
4. Learning alignment: Does it demonstrate understanding of the concepts?

Provide feedback in this JSON format:
{
  "overallFeedback": "string (2-3 sentences)",
  "score": number (0-100),
  "strengths": ["string"],
  "issues": [
    {
      "line": number | null,
      "severity": "error" | "warning" | "info",
      "message": "string",
      "suggestion": "string"
    }
  ],
  "suggestions": ["string"],
  "nextSteps": "string"
}

Tone: Encouraging and constructive. Celebrate what they did well before addressing issues.`;
}

/**
 * Parse code review response from Claude
 */
function parseCodeReview(review: string): any {
     try {
          // Try to extract JSON from the response
          const jsonMatch = review.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
               return JSON.parse(jsonMatch[0]);
          }

          // If no JSON found, create a basic review structure
          return {
               overallFeedback: review,
               score: 70,
               strengths: [],
               issues: [],
               suggestions: [],
               nextSteps: 'Continue practicing and refining your code.',
          };
     } catch (error) {
          console.error('Error parsing code review:', error);
          return {
               overallFeedback: 'Review completed. Please check the feedback.',
               score: 70,
               strengths: [],
               issues: [],
               suggestions: [],
               nextSteps: 'Continue practicing.',
          };
     }
}
