import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/lessons/:id/state
 * Save lesson state for pause/resume functionality
 * - Save current code
 * - Save scroll position
 * - Save timer state
 * - Update lesson_progress.updated_at
 */
export async function POST(
     request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
) {
     try {
          const { id: lessonId } = await params;
          const body = await request.json();
          const { code, language, scrollPosition, timerElapsed } = body;

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
               .select('id')
               .eq('id', lessonId)
               .single();

          if (lessonError || !lesson) {
               return NextResponse.json(
                    { error: 'Lesson not found' },
                    { status: 404 }
               );
          }

          const now = new Date().toISOString();

          // Save code if provided
          if (code !== undefined && language) {
               const { error: codeSaveError } = await supabase
                    .from('code_saves')
                    .insert({
                         user_id: user.id,
                         lesson_id: lessonId,
                         code,
                         language,
                         saved_at: now
                    });

               if (codeSaveError) {
                    console.error('Error saving code:', codeSaveError);
                    // Don't fail the request if code save fails
               }
          }

          // Update lesson_progress with state information
          const { data: lessonProgress } = await supabase
               .from('lesson_progress')
               .select('id')
               .eq('user_id', user.id)
               .eq('lesson_id', lessonId)
               .single();

          if (lessonProgress) {
               // Store state in the state JSONB field
               const stateUpdate: Record<string, any> = {
                    updated_at: now
               };

               // Build state object with provided values
               const state: Record<string, any> = {};
               if (scrollPosition !== undefined) {
                    state.scrollPosition = scrollPosition;
               }
               if (timerElapsed !== undefined) {
                    state.timerElapsed = timerElapsed;
               }

               if (Object.keys(state).length > 0) {
                    stateUpdate.state = state;
               }

               const { error: updateError } = await supabase
                    .from('lesson_progress')
                    .update(stateUpdate)
                    .eq('id', lessonProgress.id);

               if (updateError) {
                    console.error('Error updating lesson progress:', updateError);
               }
          }

          return NextResponse.json({
               success: true,
               message: 'Lesson state saved successfully',
               savedAt: now
          });

     } catch (error) {
          console.error('Error saving lesson state:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}

/**
 * GET /api/lessons/:id/state
 * Retrieve saved lesson state for resume functionality
 * - Get latest saved code
 * - Get scroll position
 * - Get timer state
 */
export async function GET(
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

          // Get latest code save for this lesson
          const { data: codeSave } = await supabase
               .from('code_saves')
               .select('code, language, saved_at')
               .eq('user_id', user.id)
               .eq('lesson_id', lessonId)
               .order('saved_at', { ascending: false })
               .limit(1)
               .single();

          // Get lesson progress for additional state
          const { data: lessonProgress } = await supabase
               .from('lesson_progress')
               .select('started_at, status, updated_at, state')
               .eq('user_id', user.id)
               .eq('lesson_id', lessonId)
               .single();

          // Calculate elapsed time if lesson is in progress
          let timerElapsed = 0;
          if (lessonProgress?.started_at && lessonProgress.status === 'in_progress') {
               const startTime = new Date(lessonProgress.started_at).getTime();
               const currentTime = new Date().getTime();
               timerElapsed = Math.round((currentTime - startTime) / 1000); // seconds
          }

          // Get saved state or use defaults
          const savedState = (lessonProgress?.state as Record<string, any>) || {};

          return NextResponse.json({
               success: true,
               state: {
                    code: codeSave?.code || null,
                    language: codeSave?.language || null,
                    savedAt: codeSave?.saved_at || null,
                    timerElapsed: savedState.timerElapsed || timerElapsed,
                    scrollPosition: savedState.scrollPosition || 0,
                    status: lessonProgress?.status || 'not_started'
               }
          });

     } catch (error) {
          console.error('Error retrieving lesson state:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
