import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import LessonPageClient from './LessonPageClient';

interface PageProps {
     params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
     const { id } = await params;
     const supabase = await createClient();

     // Get authenticated user
     const {
          data: { user },
          error: authError,
     } = await supabase.auth.getUser();

     if (authError || !user) {
          redirect('/login');
     }

     // Fetch lesson data
     const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();

     if (lessonError || !lesson) {
          redirect('/dashboard');
     }

     // Fetch saved code for this lesson
     const { data: savedCode } = await supabase
          .from('code_saves')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', id)
          .order('saved_at', { ascending: false })
          .limit(1)
          .single();

     // Fetch or create lesson progress
     const { data: progress } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', id)
          .single();

     // If no progress exists, create it
     if (!progress) {
          await supabase.from('lesson_progress').insert({
               user_id: user.id,
               lesson_id: id,
               status: 'in_progress',
               started_at: new Date().toISOString(),
          });
     }

     return (
          <LessonPageClient
               lesson={lesson}
               savedCode={savedCode?.code || lesson.starter_code || ''}
               userId={user.id}
               startTime={progress?.started_at || new Date().toISOString()}
          />
     );
}
