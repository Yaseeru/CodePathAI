/**
 * NPS Survey API
 * POST: Submit NPS survey response
 * GET: Calculate NPS score from all responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for NPS submission
const npsSubmissionSchema = z.object({
     score: z.number().int().min(0).max(10),
     feedback: z.string().max(500).optional(),
});

/**
 * POST /api/analytics/nps
 * Submit NPS survey response
 */
export async function POST(request: NextRequest) {
     try {
          const supabase = createServerClient();

          // Get authenticated user
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Parse and validate request body
          const body = await request.json();
          const validation = npsSubmissionSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validation.error.errors },
                    { status: 400 }
               );
          }

          const { score, feedback } = validation.data;

          // Check if user has already submitted NPS survey
          const { data: existingResponse } = await supabase
               .from('nps_responses')
               .select('id')
               .eq('user_id', user.id)
               .single();

          if (existingResponse) {
               return NextResponse.json(
                    { error: 'You have already submitted an NPS survey' },
                    { status: 400 }
               );
          }

          // Insert NPS response
          const { error: insertError } = await supabase
               .from('nps_responses')
               .insert({
                    user_id: user.id,
                    score,
                    feedback: feedback || null,
               });

          if (insertError) {
               console.error('Error inserting NPS response:', insertError);
               return NextResponse.json(
                    { error: 'Failed to save NPS response' },
                    { status: 500 }
               );
          }

          return NextResponse.json({
               success: true,
               message: 'Thank you for your feedback!',
          });
     } catch (error) {
          console.error('Error submitting NPS survey:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}

/**
 * GET /api/analytics/nps
 * Calculate NPS score from all responses
 * NPS = % Promoters (9-10) - % Detractors (0-6)
 */
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

          // Get all NPS responses
          const { data: responses, error: responsesError } = await supabase
               .from('nps_responses')
               .select('score');

          if (responsesError) {
               console.error('Error fetching NPS responses:', responsesError);
               return NextResponse.json(
                    { error: 'Failed to fetch NPS responses' },
                    { status: 500 }
               );
          }

          if (!responses || responses.length === 0) {
               return NextResponse.json({
                    totalResponses: 0,
                    promoters: 0,
                    passives: 0,
                    detractors: 0,
                    npsScore: 0,
                    message: 'No NPS responses yet',
               });
          }

          // Categorize responses
          const promoters = responses.filter(r => r.score >= 9).length;
          const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
          const detractors = responses.filter(r => r.score <= 6).length;

          // Calculate NPS score
          const totalResponses = responses.length;
          const promoterPercentage = (promoters / totalResponses) * 100;
          const detractorPercentage = (detractors / totalResponses) * 100;
          const npsScore = Math.round(promoterPercentage - detractorPercentage);

          return NextResponse.json({
               totalResponses,
               promoters,
               passives,
               detractors,
               npsScore,
               promoterPercentage: Math.round(promoterPercentage * 100) / 100,
               passivePercentage: Math.round((passives / totalResponses) * 100 * 100) / 100,
               detractorPercentage: Math.round(detractorPercentage * 100) / 100,
          });
     } catch (error) {
          console.error('Error calculating NPS:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
