import { createClient } from '@supabase/supabase-js';

/**
 * Database setup utilities for E2E tests
 */

const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Clean up test data from the database
 */
export async function cleanupTestData() {
     // Delete test users (emails ending with @codepath.test)
     const { data: testUsers } = await supabase
          .from('user_profiles')
          .select('id')
          .like('email', '%@codepath.test');

     if (testUsers && testUsers.length > 0) {
          for (const user of testUsers) {
               await supabase.auth.admin.deleteUser(user.id);
          }
     }
}

/**
 * Create a test roadmap for a user
 */
export async function createTestRoadmap(userId: string, goal: string) {
     const { data: roadmap, error } = await supabase
          .from('roadmaps')
          .insert({
               user_id: userId,
               title: 'Test Roadmap',
               description: 'A test roadmap for E2E testing',
               goal: goal,
               status: 'active',
          })
          .select()
          .single();

     if (error) {
          throw new Error(`Failed to create test roadmap: ${error.message}`);
     }

     return roadmap;
}

/**
 * Create test lessons for a roadmap
 */
export async function createTestLessons(roadmapId: string, count: number = 3) {
     const lessons = [];

     for (let i = 0; i < count; i++) {
          const lesson = {
               roadmap_id: roadmapId,
               title: `Test Lesson ${i + 1}`,
               description: `Description for test lesson ${i + 1}`,
               content: {
                    sections: [
                         {
                              type: 'text',
                              content: `This is test lesson ${i + 1} content.`,
                         },
                    ],
                    learningObjectives: [`Learn concept ${i + 1}`],
                    exercises: [
                         {
                              id: `ex-${i + 1}`,
                              prompt: `Complete exercise ${i + 1}`,
                              hints: ['Hint 1', 'Hint 2'],
                         },
                    ],
               },
               order_index: i,
               estimated_duration: 15,
               difficulty_level: 1,
               prerequisites: i > 0 ? [lessons[i - 1].id] : [],
               language: 'javascript',
               starter_code: 'console.log("Hello World");',
          };

          const { data, error } = await supabase
               .from('lessons')
               .insert(lesson)
               .select()
               .single();

          if (error) {
               throw new Error(`Failed to create test lesson: ${error.message}`);
          }

          lessons.push(data);
     }

     return lessons;
}

/**
 * Create a test project for a roadmap
 */
export async function createTestProject(roadmapId: string, unlockAfterLessonId?: string) {
     const { data: project, error } = await supabase
          .from('projects')
          .insert({
               roadmap_id: roadmapId,
               title: 'Test Project',
               description: 'A test project for E2E testing',
               requirements: [
                    {
                         id: 'req-1',
                         description: 'Implement feature X',
                         priority: 'must',
                    },
               ],
               success_criteria: [
                    {
                         id: 'sc-1',
                         description: 'Code runs without errors',
                         testable: true,
                    },
               ],
               order_index: 0,
               estimated_duration: 30,
               unlock_after_lesson: unlockAfterLessonId,
          })
          .select()
          .single();

     if (error) {
          throw new Error(`Failed to create test project: ${error.message}`);
     }

     return project;
}

/**
 * Mark a lesson as completed for a user
 */
export async function completeLessonForUser(userId: string, lessonId: string) {
     const { error } = await supabase.from('lesson_progress').upsert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          completion_time: 12,
          attempts: 1,
          error_count: 0,
     });

     if (error) {
          throw new Error(`Failed to mark lesson as completed: ${error.message}`);
     }
}

/**
 * Update user progress
 */
export async function updateUserProgress(userId: string, updates: any) {
     const { error } = await supabase
          .from('user_progress')
          .upsert({
               user_id: userId,
               ...updates,
          });

     if (error) {
          throw new Error(`Failed to update user progress: ${error.message}`);
     }
}

/**
 * Create a conversation for testing
 */
export async function createTestConversation(userId: string, lessonId?: string) {
     const { data: conversation, error } = await supabase
          .from('conversations')
          .insert({
               user_id: userId,
               lesson_id: lessonId,
               title: 'Test Conversation',
          })
          .select()
          .single();

     if (error) {
          throw new Error(`Failed to create test conversation: ${error.message}`);
     }

     return conversation;
}

/**
 * Add messages to a conversation
 */
export async function addTestMessages(conversationId: string, messages: Array<{ role: string; content: string }>) {
     const messagesToInsert = messages.map(msg => ({
          conversation_id: conversationId,
          role: msg.role,
          content: msg.content,
     }));

     const { error } = await supabase.from('messages').insert(messagesToInsert);

     if (error) {
          throw new Error(`Failed to add test messages: ${error.message}`);
     }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
     const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

     if (error) {
          throw new Error(`Failed to get user profile: ${error.message}`);
     }

     return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: any) {
     const { error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', userId);

     if (error) {
          throw new Error(`Failed to update user profile: ${error.message}`);
     }
}
