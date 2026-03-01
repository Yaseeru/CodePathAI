/**
 * AI Context Builder Service
 * Builds enriched context for AI requests by gathering user data from the database
 */

import { createServerClient } from '@/lib/supabase';
import { AIContext, UserProfile, Lesson, LessonProgress, Message, CodeSave } from '@/lib/types/ai';

export class AIContextBuilder {
     /**
      * Build complete AI context for a user
      */
     async buildAIContext(
          userId: string,
          options?: {
               lessonId?: string;
               conversationId?: string;
          }
     ): Promise<AIContext> {
          const supabase = createServerClient();

          // Fetch all required data in parallel
          const [
               userProfile,
               currentLesson,
               recentProgress,
               conversationHistory,
               recentCodeSubmissions,
               userProgress,
          ] = await Promise.all([
               this.fetchUserProfile(supabase, userId),
               options?.lessonId ? this.fetchLesson(supabase, options.lessonId) : null,
               this.fetchRecentProgress(supabase, userId),
               options?.conversationId
                    ? this.fetchConversationHistory(supabase, options.conversationId)
                    : [],
               this.fetchRecentCodeSubmissions(supabase, userId),
               this.fetchUserProgress(supabase, userId),
          ]);

          return {
               userProfile,
               currentLesson: currentLesson || undefined,
               recentProgress,
               conversationHistory,
               recentCodeSubmissions,
               difficultyLevel: userProgress?.difficulty_level || 1,
          };
     }

     /**
      * Fetch user profile
      */
     private async fetchUserProfile(supabase: Awaited<ReturnType<typeof createServerClient>>, userId: string): Promise<UserProfile> {
          const { data, error } = await supabase
               .from('user_profiles')
               .select('*')
               .eq('id', userId)
               .single();

          if (error || !data) {
               throw new Error(`Failed to fetch user profile: ${error?.message}`);
          }

          return {
               id: data.id,
               name: data.name,
               email: data.email,
               learningGoal: data.learning_goal,
               timeCommitment: data.time_commitment,
               experienceLevel: data.experience_level as 'beginner' | 'intermediate' | 'advanced' | null,
               onboardingCompleted: data.onboarding_completed,
               createdAt: data.created_at,
               updatedAt: data.updated_at,
          };
     }

     /**
      * Fetch current lesson content
      */
     private async fetchLesson(supabase: Awaited<ReturnType<typeof createServerClient>>, lessonId: string): Promise<Lesson | null> {
          const { data, error } = await supabase
               .from('lessons')
               .select('*')
               .eq('id', lessonId)
               .single();

          if (error || !data) {
               return null;
          }

          return {
               id: data.id,
               roadmapId: data.roadmap_id,
               title: data.title,
               description: data.description,
               content: data.content as any,
               orderIndex: data.order_index,
               estimatedDuration: data.estimated_duration,
               difficultyLevel: data.difficulty_level,
               prerequisites: data.prerequisites,
               language: data.language as 'javascript' | 'python' | 'html',
               starterCode: data.starter_code,
               testCases: data.test_cases as any,
               createdAt: data.created_at,
               updatedAt: data.updated_at,
          };
     }

     /**
      * Fetch recent progress (last 10 lessons)
      */
     private async fetchRecentProgress(
          supabase: Awaited<ReturnType<typeof createServerClient>>,
          userId: string
     ): Promise<LessonProgress[]> {
          const { data, error } = await supabase
               .from('lesson_progress')
               .select('*')
               .eq('user_id', userId)
               .order('updated_at', { ascending: false })
               .limit(10);

          if (error || !data) {
               return [];
          }

          return data.map((row) => ({
               id: row.id,
               userId: row.user_id,
               lessonId: row.lesson_id,
               status: row.status as 'not_started' | 'in_progress' | 'completed',
               startedAt: row.started_at,
               completedAt: row.completed_at,
               completionTime: row.completion_time,
               attempts: row.attempts,
               errorCount: row.error_count,
               createdAt: row.created_at,
               updatedAt: row.updated_at,
          }));
     }

     /**
      * Fetch conversation history (last 10 messages)
      */
     private async fetchConversationHistory(
          supabase: Awaited<ReturnType<typeof createServerClient>>,
          conversationId: string
     ): Promise<Message[]> {
          const { data, error } = await supabase
               .from('messages')
               .select('*')
               .eq('conversation_id', conversationId)
               .order('created_at', { ascending: true })
               .limit(10);

          if (error || !data) {
               return [];
          }

          return data.map((row) => ({
               id: row.id,
               conversationId: row.conversation_id,
               role: row.role as 'user' | 'assistant',
               content: row.content,
               contextSnapshot: row.context_snapshot as AIContext | null,
               createdAt: row.created_at,
          }));
     }

     /**
      * Fetch recent code submissions (last 3)
      */
     private async fetchRecentCodeSubmissions(
          supabase: Awaited<ReturnType<typeof createServerClient>>,
          userId: string
     ): Promise<CodeSave[]> {
          const { data, error } = await supabase
               .from('code_saves')
               .select('*')
               .eq('user_id', userId)
               .order('saved_at', { ascending: false })
               .limit(3);

          if (error || !data) {
               return [];
          }

          return data.map((row) => ({
               id: row.id,
               userId: row.user_id,
               lessonId: row.lesson_id,
               projectId: row.project_id,
               code: row.code,
               language: row.language,
               savedAt: row.saved_at,
          }));
     }

     /**
      * Fetch user progress for difficulty level
      */
     private async fetchUserProgress(
          supabase: Awaited<ReturnType<typeof createServerClient>>,
          userId: string
     ): Promise<{ difficulty_level: number } | null> {
          const { data, error } = await supabase
               .from('user_progress')
               .select('difficulty_level')
               .eq('user_id', userId)
               .single();

          if (error || !data) {
               return null;
          }

          return data;
     }
}

// Export singleton instance
export const aiContextBuilder = new AIContextBuilder();
