/**
 * GET /api/analytics/projects-per-user
 * Calculate average projects built per active user per month
 * Returns: average number of projects submitted by active users in the last 30 days
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
     try {
          const supabase = createServerClient();

          // Get authenticated user (admin check could be added here)
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Get date 30 days ago
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

          // Get active users (users with activity in last 30 days)
          const { data: activeUsers, error: activeUsersError } = await supabase
               .from('daily_activity')
               .select('user_id')
               .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0]);

          if (activeUsersError) {
               console.error('Error fetching active users:', activeUsersError);
               return NextResponse.json(
                    { error: 'Failed to fetch active users' },
                    { status: 500 }
               );
          }

          // Get unique active user IDs
          const uniqueActiveUserIds = activeUsers
               ? [...new Set(activeUsers.map(a => a.user_id))]
               : [];

          if (uniqueActiveUserIds.length === 0) {
               return NextResponse.json({
                    activeUsers: 0,
                    totalProjects: 0,
                    projectsPerUser: 0,
                    unit: 'projects',
                    message: 'No active users in the last 30 days',
               });
          }

          // Count project submissions by active users in last 30 days
          const { data: projects, error: projectsError } = await supabase
               .from('project_submissions')
               .select('id, user_id')
               .in('user_id', uniqueActiveUserIds)
               .gte('submitted_at', thirtyDaysAgoISO);

          if (projectsError) {
               console.error('Error fetching projects:', projectsError);
               return NextResponse.json(
                    { error: 'Failed to fetch projects' },
                    { status: 500 }
               );
          }

          const totalProjects = projects ? projects.length : 0;
          const projectsPerUser = uniqueActiveUserIds.length > 0
               ? Math.round((totalProjects / uniqueActiveUserIds.length) * 100) / 100
               : 0;

          return NextResponse.json({
               activeUsers: uniqueActiveUserIds.length,
               totalProjects,
               projectsPerUser,
               unit: 'projects',
               period: 'last 30 days',
          });
     } catch (error) {
          console.error('Error calculating projects per user:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
