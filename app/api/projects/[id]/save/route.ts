import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const saveCodeSchema = z.object({
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
          const validated = saveCodeSchema.safeParse(body);

          if (!validated.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validated.error.errors },
                    { status: 400 }
               );
          }

          const { code, language } = validated.data;

          // Verify project exists and user has access
          const { data: project, error: projectError } = await supabase
               .from('projects')
               .select('id, roadmap_id')
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

          // Save code to code_saves table
          const { data: savedCode, error: saveError } = await supabase
               .from('code_saves')
               .insert({
                    user_id: user.id,
                    project_id: projectId,
                    code,
                    language,
                    saved_at: new Date().toISOString(),
               })
               .select()
               .single();

          if (saveError) {
               console.error('Error saving code:', saveError);
               return NextResponse.json(
                    { error: 'Failed to save code' },
                    { status: 500 }
               );
          }

          return NextResponse.json({
               success: true,
               savedAt: savedCode.saved_at,
          });
     } catch (error) {
          console.error('Error in save code endpoint:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
