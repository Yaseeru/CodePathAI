import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { trackServerEvent, ServerAnalyticsEvents } from '@/lib/analytics/server-analytics';

/**
 * POST /api/lessons/:id/start
 * Start tracking a lesson
 * - Insert or update lesson_progress record with started_at timestamp
 * - Update status to 'in_progress'
 * - Update user_progress.current_lesson_id
 */
export async function POST(
     request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
) {
     try {
          const { id: lessonId } = await params;
          const supabase = await createClient();

          // Get authenticated user
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Verify lesson exists
          const { data: lesson, error: lessonError } = await supabase
               .from('lessons')
               .select('id, roadmap_id')
               .eq('id', lessonId)
               .single();

          if (lessonError || !lesson) {
               return NextResponse.json(
                    { error: 'Lesson not found' },
                    { status: 404 }
               );
          }

          // Check if lesson_progress record exists
          const { data: existingProgress } = await supabase
               .from('lesson_progress')
               .select('id, status')
               .eq('user_id', user.id)
               .eq('lesson_id', lessonId)
               .single();

          const now = new Date().toISOString();

          if (existingProgress) {
               // Update existing record only if not already completed
               if (existingProgress.status !== 'completed') {
                    const { error: updateError } = await supabase
                         .from('lesson_progress')
                         .update({
                              status: 'in_progress',
                              started_at: existingProgress.status === 'not_started' ? now : undefined,
                              updated_at: now
                         })
                         .eq('id', existingProgress.id);

                    if (updateError) {
                         console.error('Error updating lesson progress:', updateError);
                         return NextResponse.json(
                              { error: 'Failed to update lesson progress' },
                              { status: 500 }
                         );
                    }
               }
          } else {
               // Insert new lesson_progress record
               const { error: insertError } = await supabase
                    .from('lesson_progress')
                    .insert({
                         user_id: user.id,
                         lesson_id: lessonId,
                         status: 'in_progress',
                         started_at: now,
                         attempts: 0,
                         error_count: 0
                    });

               if (insertError) {
                    console.error('Error inserting lesson progress:', insertError);
                    return NextResponse.json(
                         { error: 'Failed to create lesson progress' },
                         { status: 500 }
                    );
               }
          }

          // Update user_progress.current_lesson_id
          const { error: userProgressError } = await supabase
               .from('user_progress')
               .upsert({
                    user_id: user.id,
                    current_lesson_id: lessonId,
                    updated_at: now
               }, {
                    onConflict: 'user_id'
               });

          if (userProgressError) {
               console.error('Error updating user progress:', userProgressError);
               return NextResponse.json(
                    { error: 'Failed to update user progress' },
                    { status: 500 }
               );
          }

          // Track lesson start event
          await trackServerEvent({
               user_id: user.id,
               event_type: ServerAnalyticsEvents.LESSON_STARTED,
               event_data: {
                    lesson_id: lessonId,
                    roadmap_id: lesson.roadmap_id,
                    started_at: now,
               },
          });

          return NextResponse.json({
               success: true,
               message: 'Lesson started successfully'
          });

     } catch (error) {
          console.error('Error starting lesson:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
