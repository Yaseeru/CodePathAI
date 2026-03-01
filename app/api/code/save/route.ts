import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { z } from 'zod';

const saveCodeSchema = z.object({
     lessonId: z.string().uuid().optional(),
     projectId: z.string().uuid().optional(),
     code: z.string(),
     language: z.enum(['javascript', 'python', 'html']),
});

export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();

          // Get authenticated user
          const {
               data: { user },
               error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Parse and validate request body
          const body = await request.json();
          const validation = saveCodeSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validation.error.errors },
                    { status: 400 }
               );
          }

          const { lessonId, projectId, code, language } = validation.data;

          // Ensure either lessonId or projectId is provided
          if (!lessonId && !projectId) {
               return NextResponse.json(
                    { error: 'Either lessonId or projectId must be provided' },
                    { status: 400 }
               );
          }

          // Save code to database
          const { data, error } = await supabase
               .from('code_saves')
               .insert({
                    user_id: user.id,
                    lesson_id: lessonId || null,
                    project_id: projectId || null,
                    code,
                    language,
                    saved_at: new Date().toISOString(),
               })
               .select()
               .single();

          if (error) {
               console.error('Error saving code:', error);
               return NextResponse.json(
                    { error: 'Failed to save code' },
                    { status: 500 }
               );
          }

          return NextResponse.json({
               success: true,
               savedAt: data.saved_at,
          });
     } catch (error) {
          console.error('Unexpected error in code save:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
