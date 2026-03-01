/**
 * User Data Export API Endpoint
 * Allows users to export all their data in JSON format (GDPR compliance)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
     try {
          const supabase = createServerClient();

          // Get authenticated user
          const {
               data: { user },
               error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Gather all user data
          const exportData: any = {
               exportDate: new Date().toISOString(),
               userId: user.id,
               email: user.email,
          };

          // 1. User Profile
          const { data: profile } = await supabase
               .from('user_profiles')
               .select('*')
               .eq('id', user.id)
               .single();
          exportData.profile = profile;

          // 2. Roadmaps
          const { data: roadmaps } = await supabase
               .from('roadmaps')
               .select('*')
               .eq('user_id', user.id);
          exportData.roadmaps = roadmaps;

          // 3. Lessons (from user's roadmaps)
          if (roadmaps && roadmaps.length > 0) {
               const roadmapIds = roadmaps.map(r => r.id);
               const { data: lessons } = await supabase
                    .from('lessons')
                    .select('*')
                    .in('roadmap_id', roadmapIds);
               exportData.lessons = lessons;

               // 4. Projects (from user's roadmaps)
               const { data: projects } = await supabase
                    .from('projects')
                    .select('*')
                    .in('roadmap_id', roadmapIds);
               exportData.projects = projects;
          }

          // 5. Lesson Progress
          const { data: lessonProgress } = await supabase
               .from('lesson_progress')
               .select('*')
               .eq('user_id', user.id);
          exportData.lessonProgress = lessonProgress;

          // 6. Project Submissions
          const { data: projectSubmissions } = await supabase
               .from('project_submissions')
               .select('*')
               .eq('user_id', user.id);
          exportData.projectSubmissions = projectSubmissions;

          // 7. User Progress
          const { data: userProgress } = await supabase
               .from('user_progress')
               .select('*')
               .eq('user_id', user.id)
               .single();
          exportData.userProgress = userProgress;

          // 8. Conversations
          const { data: conversations } = await supabase
               .from('conversations')
               .select('*')
               .eq('user_id', user.id);
          exportData.conversations = conversations;

          // 9. Messages (from user's conversations)
          if (conversations && conversations.length > 0) {
               const conversationIds = conversations.map(c => c.id);
               const { data: messages } = await supabase
                    .from('messages')
                    .select('*')
                    .in('conversation_id', conversationIds);
               exportData.messages = messages;
          }

          // 10. Code Saves
          const { data: codeSaves } = await supabase
               .from('code_saves')
               .select('*')
               .eq('user_id', user.id);
          exportData.codeSaves = codeSaves;

          // 11. User Events
          const { data: userEvents } = await supabase
               .from('user_events')
               .select('*')
               .eq('user_id', user.id);
          exportData.userEvents = userEvents;

          // 12. Daily Activity
          const { data: dailyActivity } = await supabase
               .from('daily_activity')
               .select('*')
               .eq('user_id', user.id);
          exportData.dailyActivity = dailyActivity;

          // 13. NPS Responses
          const { data: npsResponses } = await supabase
               .from('nps_responses')
               .select('*')
               .eq('user_id', user.id);
          exportData.npsResponses = npsResponses;

          // Return as downloadable JSON
          const fileName = `codepath-ai-data-export-${user.id}-${Date.now()}.json`;

          return new NextResponse(JSON.stringify(exportData, null, 2), {
               status: 200,
               headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${fileName}"`,
               },
          });
     } catch (error) {
          console.error('Data export error:', error);
          return NextResponse.json(
               { error: 'Failed to export data' },
               { status: 500 }
          );
     }
}
