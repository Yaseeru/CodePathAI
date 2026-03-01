/**
 * API Route: GET /api/lessons/[id]/versions/[version]
 * Retrieves a specific version of a lesson
 * 
 * API Route: POST /api/lessons/[id]/versions/[version]
 * Restores a lesson to a specific version
 */

import { NextRequest, NextResponse } from 'next/server';
import {
     getLessonVersion,
     restoreLessonVersion,
     compareLessonVersions
} from '@/lib/services/lesson-versioning';
import { createClient } from '@/lib/supabase';

export async function GET(
     request: NextRequest,
     { params }: { params: { id: string; version: string } }
) {
     try {
          const lessonId = params.id;
          const versionNumber = parseInt(params.version, 10);

          if (!lessonId || isNaN(versionNumber)) {
               return NextResponse.json(
                    { error: 'Valid lesson ID and version number are required' },
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

          // Get specific version
          const version = await getLessonVersion(lessonId, versionNumber);

          if (!version) {
               return NextResponse.json(
                    { error: 'Version not found' },
                    { status: 404 }
               );
          }

          return NextResponse.json({
               success: true,
               version
          });

     } catch (error) {
          console.error('Error fetching lesson version:', error);
          return NextResponse.json(
               {
                    error: 'Failed to fetch version',
                    message: error instanceof Error ? error.message : 'Unknown error'
               },
               { status: 500 }
          );
     }
}

export async function POST(
     request: NextRequest,
     { params }: { params: { id: string; version: string } }
) {
     try {
          const lessonId = params.id;
          const versionNumber = parseInt(params.version, 10);

          if (!lessonId || isNaN(versionNumber)) {
               return NextResponse.json(
                    { error: 'Valid lesson ID and version number are required' },
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

          // Parse request body for optional change notes
          const body = await request.json().catch(() => ({}));
          const changeNotes = body.changeNotes || `Restored to version ${versionNumber}`;

          // Restore the version
          const restoredLesson = await restoreLessonVersion(
               lessonId,
               versionNumber,
               changeNotes
          );

          return NextResponse.json({
               success: true,
               lesson: restoredLesson,
               message: `Successfully restored lesson to version ${versionNumber}`
          });

     } catch (error) {
          console.error('Error restoring lesson version:', error);
          return NextResponse.json(
               {
                    error: 'Failed to restore version',
                    message: error instanceof Error ? error.message : 'Unknown error'
               },
               { status: 500 }
          );
     }
}
