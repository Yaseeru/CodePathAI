/**
 * API Route: GET /api/lessons/[id]/versions/compare
 * Compares two versions of a lesson
 * Query params: version1, version2
 */

import { NextRequest, NextResponse } from 'next/server';
import { compareLessonVersions } from '@/lib/services/lesson-versioning';
import { createClient } from '@/lib/supabase';

export async function GET(
     request: NextRequest,
     { params }: { params: { id: string } }
) {
     try {
          const lessonId = params.id;
          const { searchParams } = new URL(request.url);
          const version1 = parseInt(searchParams.get('version1') || '', 10);
          const version2 = parseInt(searchParams.get('version2') || '', 10);

          if (!lessonId || isNaN(version1) || isNaN(version2)) {
               return NextResponse.json(
                    { error: 'Valid lesson ID and two version numbers are required' },
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

          // Compare versions
          const comparison = await compareLessonVersions(lessonId, version1, version2);

          return NextResponse.json({
               success: true,
               comparison
          });

     } catch (error) {
          console.error('Error comparing lesson versions:', error);
          return NextResponse.json(
               {
                    error: 'Failed to compare versions',
                    message: error instanceof Error ? error.message : 'Unknown error'
               },
               { status: 500 }
          );
     }
}
