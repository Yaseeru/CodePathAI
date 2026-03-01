/**
 * GET /api/roadmap/history
 * Fetch user's archived roadmaps with completion statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
     try {
          // Get authenticated user
          const supabase = createServerClient();
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    {
                         error: 'Unauthorized',
                         message: 'You must be logged in to view your history.',
                    },
                    { status: 401 }
               );
          }

          // Fetch all roadmaps (active and archived) for the user
          const { data: roadmaps, error: roadmapsError } = await supabase
               .from('roadmaps')
               .select('id, title, description, goal, status, created_at, updated_at')
               .eq('user_id', user.id)
               .order('created_at', { ascending: false });

          if (roadmapsError) {
               console.error('Error fetching roadmaps:', roadmapsError);
               return NextResponse.json(
                    {
                         error: 'Failed to fetch roadmaps',
                         message: 'Could not retrieve your roadmap history.',
                    },
                    { status: 500 }
               );
          }

          // For each roadmap, fetch completion statistics
          const roadmapsWithStats = await Promise.all(
               roadmaps.map(async (roadmap) => {
                    // Get all lessons for this roadmap
                    const { data: lessons, error: lessonsError } = await supabase
                         .from('lessons')
                         .select('id')
                         .eq('roadmap_id', roadmap.id);

                    if (lessonsError) {
                         console.error('Error fetching lessons:', lessonsError);
                         return {
                              ...roadmap,
                              totalLessons: 0,
                              completedLessons: 0,
                              completionPercentage: 0,
                              totalProjects: 0,
                              completedProjects: 0,
                         };
                    }

                    const lessonIds = lessons?.map((l) => l.id) || [];
                    const totalLessons = lessonIds.length;

                    // Get completed lessons count
                    let completedLessons = 0;
                    if (lessonIds.length > 0) {
                         const { data: completedProgress, error: progressError } = await supabase
                              .from('lesson_progress')
                              .select('id')
                              .eq('user_id', user.id)
                              .in('lesson_id', lessonIds)
                              .eq('status', 'completed');

                         if (!progressError && completedProgress) {
                              completedLessons = completedProgress.length;
                         }
                    }

                    // Get all projects for this roadmap
                    const { data: projects, error: projectsError } = await supabase
                         .from('projects')
                         .select('id')
                         .eq('roadmap_id', roadmap.id);

                    if (projectsError) {
                         console.error('Error fetching projects:', projectsError);
                    }

                    const projectIds = projects?.map((p) => p.id) || [];
                    const totalProjects = projectIds.length;

                    // Get completed projects count
                    let completedProjects = 0;
                    if (projectIds.length > 0) {
                         const { data: completedSubmissions, error: submissionsError } = await supabase
                              .from('project_submissions')
                              .select('project_id')
                              .eq('user_id', user.id)
                              .in('project_id', projectIds)
                              .eq('status', 'approved');

                         if (!submissionsError && completedSubmissions) {
                              // Count unique projects
                              const uniqueProjects = new Set(completedSubmissions.map((s) => s.project_id));
                              completedProjects = uniqueProjects.size;
                         }
                    }

                    const completionPercentage = totalLessons > 0
                         ? Math.round((completedLessons / totalLessons) * 100)
                         : 0;

                    return {
                         ...roadmap,
                         totalLessons,
                         completedLessons,
                         completionPercentage,
                         totalProjects,
                         completedProjects,
                    };
               })
          );

          return NextResponse.json(
               {
                    roadmaps: roadmapsWithStats,
               },
               { status: 200 }
          );
     } catch (error) {
          console.error('Error fetching roadmap history:', error);
          return NextResponse.json(
               {
                    error: 'Internal server error',
                    message: 'An unexpected error occurred. Please try again later.',
               },
               { status: 500 }
          );
     }
}
