/**
 * API Route: GET /api/lessons/[id]/versions
 * Retrieves version history for a specific lesson
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLessonVersionHistory } from '@/lib/services/lesson-versioning';
import { createClient } from '@/lib/supabase';

export async function GET(
     request: NextRequest,
     { params }: { params: { id: string } }
) {
     try {
          const lessonId = params.id;

          if (!lessonId) {
               return NextResponse.json(
                    { error: 'Lesson ID is required' },
                    { status: 400 }
               );
          }

          // Verify user is authenticated
          const supabase = createClient();
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Get version history
          const versions = await getLessonVersionHistory(lessonId);

          return NextResponse.json({
               success: true,
               versions,
               count: versions.length
          });

     } catch (error) {
          console.error('Error fetching lesson version history:', error);
          return NextResponse.json(
               {
                    error: 'Failed to fetch version history',
                    message: error instanceof Error ? error.message : 'Unknown error'
               },
               { status: 500 }
          );
     }
}
