/**
 * Roadmap Service
 * Handles saving and managing roadmaps in the database
 */

import { createServerClient } from '@/lib/supabase';
import { RoadmapGenerationResponse } from '@/lib/ai/prompt-templates';

export interface SaveRoadmapResult {
     roadmapId: string;
     lessonIds: string[];
     projectIds: string[];
}

export class RoadmapService {
     /**
      * Save generated roadmap to database
      * This includes:
      * - Creating roadmap record
      * - Creating lesson records with proper ordering
      * - Creating project records
      * - Creating initial lesson_progress records
      * - Updating user_progress with current_roadmap_id
      */
     async saveRoadmap(
          userId: string,
          roadmapData: RoadmapGenerationResponse
     ): Promise<SaveRoadmapResult> {
          const supabase = createServerClient();

          // Start a transaction-like operation by doing all inserts
          // Note: Supabase doesn't support transactions in the client, so we'll do sequential inserts
          // and handle errors appropriately

          try {
               // 1. Insert roadmap record
               const { data: roadmap, error: roadmapError } = await supabase
                    .from('roadmaps')
                    .insert({
                         user_id: userId,
                         title: roadmapData.roadmap.title,
                         description: roadmapData.roadmap.description,
                         goal: roadmapData.roadmap.title, // Using title as goal for now
                         status: 'active',
                    })
                    .select()
                    .single();

               if (roadmapError || !roadmap) {
                    throw new Error(`Failed to create roadmap: ${roadmapError?.message}`);
               }

               const roadmapId = roadmap.id;

               // 2. Insert lessons with order_index and prerequisites
               const lessonInserts = roadmapData.lessons.map((lesson) => ({
                    roadmap_id: roadmapId,
                    title: lesson.title,
                    description: lesson.description,
                    content: lesson.content,
                    order_index: lesson.orderIndex,
                    estimated_duration: lesson.estimatedDuration,
                    difficulty_level: lesson.difficultyLevel,
                    prerequisites: lesson.prerequisites.map(String), // Convert to string array
                    language: lesson.language,
                    starter_code: lesson.starterCode,
                    test_cases: null,
               }));

               const { data: lessons, error: lessonsError } = await supabase
                    .from('lessons')
                    .insert(lessonInserts)
                    .select();

               if (lessonsError || !lessons) {
                    // Rollback: delete the roadmap
                    await supabase.from('roadmaps').delete().eq('id', roadmapId);
                    throw new Error(`Failed to create lessons: ${lessonsError?.message}`);
               }

               const lessonIds = lessons.map((l) => l.id);

               // Create a map of orderIndex to lesson ID for project unlocking
               const orderIndexToLessonId = new Map<number, string>();
               lessons.forEach((lesson) => {
                    orderIndexToLessonId.set(lesson.order_index, lesson.id);
               });

               // 3. Insert projects with unlock conditions
               const projectInserts = roadmapData.projects.map((project) => ({
                    roadmap_id: roadmapId,
                    title: project.title,
                    description: project.description,
                    requirements: project.requirements,
                    success_criteria: project.successCriteria,
                    order_index: project.orderIndex,
                    estimated_duration: 60, // Default to 60 minutes for projects
                    unlock_after_lesson: orderIndexToLessonId.get(project.unlockAfterLesson) || null,
               }));

               const { data: projects, error: projectsError } = await supabase
                    .from('projects')
                    .insert(projectInserts)
                    .select();

               if (projectsError || !projects) {
                    // Rollback: delete lessons and roadmap
                    await supabase.from('lessons').delete().eq('roadmap_id', roadmapId);
                    await supabase.from('roadmaps').delete().eq('id', roadmapId);
                    throw new Error(`Failed to create projects: ${projectsError?.message}`);
               }

               const projectIds = projects.map((p) => p.id);

               // 4. Create initial lesson_progress records (status: not_started)
               const progressInserts = lessonIds.map((lessonId) => ({
                    user_id: userId,
                    lesson_id: lessonId,
                    status: 'not_started',
                    attempts: 0,
                    error_count: 0,
               }));

               const { error: progressError } = await supabase
                    .from('lesson_progress')
                    .insert(progressInserts);

               if (progressError) {
                    // Rollback: delete projects, lessons, and roadmap
                    await supabase.from('projects').delete().eq('roadmap_id', roadmapId);
                    await supabase.from('lessons').delete().eq('roadmap_id', roadmapId);
                    await supabase.from('roadmaps').delete().eq('id', roadmapId);
                    throw new Error(`Failed to create lesson progress: ${progressError.message}`);
               }

               // 5. Update or create user_progress with current_roadmap_id
               const { data: existingProgress } = await supabase
                    .from('user_progress')
                    .select()
                    .eq('user_id', userId)
                    .single();

               if (existingProgress) {
                    // Update existing progress
                    const { error: updateError } = await supabase
                         .from('user_progress')
                         .update({
                              current_roadmap_id: roadmapId,
                              current_lesson_id: lessonIds[0], // Set first lesson as current
                              updated_at: new Date().toISOString(),
                         })
                         .eq('user_id', userId);

                    if (updateError) {
                         console.error('Failed to update user_progress:', updateError);
                         // Don't rollback for this error, just log it
                    }
               } else {
                    // Create new progress record
                    const { error: insertError } = await supabase
                         .from('user_progress')
                         .insert({
                              user_id: userId,
                              current_roadmap_id: roadmapId,
                              current_lesson_id: lessonIds[0],
                              total_lessons_completed: 0,
                              total_projects_completed: 0,
                              total_learning_time: 0,
                              current_streak: 0,
                              longest_streak: 0,
                              difficulty_level: 1,
                         });

                    if (insertError) {
                         console.error('Failed to create user_progress:', insertError);
                         // Don't rollback for this error, just log it
                    }
               }

               return {
                    roadmapId,
                    lessonIds,
                    projectIds,
               };
          } catch (error) {
               console.error('Error saving roadmap:', error);
               throw error;
          }
     }

     /**
      * Get roadmap with lessons and projects
      */
     async getRoadmap(roadmapId: string) {
          const supabase = createServerClient();

          const { data: roadmap, error: roadmapError } = await supabase
               .from('roadmaps')
               .select('*')
               .eq('id', roadmapId)
               .single();

          if (roadmapError || !roadmap) {
               throw new Error(`Failed to fetch roadmap: ${roadmapError?.message}`);
          }

          const { data: lessons, error: lessonsError } = await supabase
               .from('lessons')
               .select('*')
               .eq('roadmap_id', roadmapId)
               .order('order_index', { ascending: true });

          if (lessonsError) {
               throw new Error(`Failed to fetch lessons: ${lessonsError.message}`);
          }

          const { data: projects, error: projectsError } = await supabase
               .from('projects')
               .select('*')
               .eq('roadmap_id', roadmapId)
               .order('order_index', { ascending: true });

          if (projectsError) {
               throw new Error(`Failed to fetch projects: ${projectsError.message}`);
          }

          return {
               roadmap,
               lessons: lessons || [],
               projects: projects || [],
          };
     }
}

// Export singleton instance
export const roadmapService = new RoadmapService();
