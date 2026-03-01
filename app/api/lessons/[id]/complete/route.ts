import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/lessons/:id/complete
 * Complete a lesson and update all related progress tracking
 * - Update lesson_progress status to 'completed'
 * - Record completed_at timestamp and completion_time
 * - Increment user_progress.total_lessons_completed
 * - Update user_progress.total_learning_time
 * - Update daily_activity for current date
 * - Return next lesson in roadmap
 */
export async function POST(
     request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
) {
     try {
          const { id: lessonId } = await params;
          const body = await request.json();
          const { completionTime } = body; // completion time in minutes

          const supabase = await createClient();

          // Get authenticated user
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Get lesson and its progress
          const { data: lesson, error: lessonError } = await supabase
               .from('lessons')
               .select('id, roadmap_id, order_index')
               .eq('id', lessonId)
               .single();

          if (lessonError || !lesson) {
               return NextResponse.json(
                    { error: 'Lesson not found' },
                    { status: 404 }
               );
          }

          // Get lesson progress
          const { data: lessonProgress, error: progressError } = await supabase
               .from('lesson_progress')
               .select('id, started_at, status')
               .eq('user_id', user.id)
               .eq('lesson_id', lessonId)
               .single();

          if (progressError || !lessonProgress) {
               return NextResponse.json(
                    { error: 'Lesson progress not found. Please start the lesson first.' },
                    { status: 404 }
               );
          }

          // Don't re-complete already completed lessons
          if (lessonProgress.status === 'completed') {
               return NextResponse.json({
                    success: true,
                    message: 'Lesson already completed',
                    alreadyCompleted: true
               });
          }

          const now = new Date().toISOString();

          // Calculate completion time if not provided
          let calculatedCompletionTime = completionTime;
          if (!calculatedCompletionTime && lessonProgress.started_at) {
               const startTime = new Date(lessonProgress.started_at).getTime();
               const endTime = new Date(now).getTime();
               calculatedCompletionTime = Math.round((endTime - startTime) / 60000); // Convert to minutes
          }

          // Update lesson_progress to completed
          const { error: updateProgressError } = await supabase
               .from('lesson_progress')
               .update({
                    status: 'completed',
                    completed_at: now,
                    completion_time: calculatedCompletionTime || 0,
                    updated_at: now
               })
               .eq('id', lessonProgress.id);

          if (updateProgressError) {
               console.error('Error updating lesson progress:', updateProgressError);
               return NextResponse.json(
                    { error: 'Failed to update lesson progress' },
                    { status: 500 }
               );
          }

          // Get current user progress
          const { data: userProgress } = await supabase
               .from('user_progress')
               .select('*')
               .eq('user_id', user.id)
               .single();

          // Update user_progress
          const { error: userProgressError } = await supabase
               .from('user_progress')
               .upsert({
                    user_id: user.id,
                    total_lessons_completed: (userProgress?.total_lessons_completed || 0) + 1,
                    total_learning_time: (userProgress?.total_learning_time || 0) + (calculatedCompletionTime || 0),
                    last_activity_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
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

          // Update daily_activity for current date
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

          const { data: dailyActivity } = await supabase
               .from('daily_activity')
               .select('*')
               .eq('user_id', user.id)
               .eq('activity_date', today)
               .single();

          const { error: dailyActivityError } = await supabase
               .from('daily_activity')
               .upsert({
                    user_id: user.id,
                    activity_date: today,
                    lessons_completed: (dailyActivity?.lessons_completed || 0) + 1,
                    time_spent: (dailyActivity?.time_spent || 0) + (calculatedCompletionTime || 0)
               }, {
                    onConflict: 'user_id,activity_date'
               });

          if (dailyActivityError) {
               console.error('Error updating daily activity:', dailyActivityError);
               // Don't fail the request if daily activity update fails
          }

          // Find next lesson in roadmap
          const { data: nextLesson } = await supabase
               .from('lessons')
               .select('id, title, description, order_index')
               .eq('roadmap_id', lesson.roadmap_id)
               .gt('order_index', lesson.order_index)
               .order('order_index', { ascending: true })
               .limit(1)
               .single();

          return NextResponse.json({
               success: true,
               message: 'Lesson completed successfully',
               completionTime: calculatedCompletionTime,
               nextLesson: nextLesson || null
          });

     } catch (error) {
          console.error('Error completing lesson:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
