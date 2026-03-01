/**
 * Lesson Versioning Service
 * Manages lesson content versions and provides version history functionality
 */

import { createClient } from '@/lib/supabase';
import type { Lesson } from '@/lib/types';

export interface LessonVersion {
     id: string;
     lessonId: string;
     version: number;
     title: string;
     description: string;
     content: any;
     orderIndex: number;
     estimatedDuration: number;
     difficultyLevel: number;
     prerequisites: string[];
     language: string;
     starterCode: string | null;
     testCases: any | null;
     createdAt: string;
     createdBy: string | null;
     changeNotes: string | null;
}

/**
 * Gets the version history for a lesson
 * Returns all previous versions ordered by version number (newest first)
 * 
 * @param lessonId - The lesson ID
 * @returns Array of lesson versions
 */
export async function getLessonVersionHistory(lessonId: string): Promise<LessonVersion[]> {
     const supabase = createClient();

     const { data, error } = await supabase
          .from('lesson_versions')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('version', { ascending: false });

     if (error) {
          console.error('Error fetching lesson version history:', error);
          throw new Error(`Failed to fetch version history: ${error.message}`);
     }

     return (data || []).map(mapDatabaseToVersion);
}

/**
 * Gets a specific version of a lesson
 * 
 * @param lessonId - The lesson ID
 * @param version - The version number
 * @returns The lesson version or null if not found
 */
export async function getLessonVersion(
     lessonId: string,
     version: number
): Promise<LessonVersion | null> {
     const supabase = createClient();

     const { data, error } = await supabase
          .from('lesson_versions')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('version', version)
          .single();

     if (error) {
          if (error.code === 'PGRST116') {
               // Not found
               return null;
          }
          console.error('Error fetching lesson version:', error);
          throw new Error(`Failed to fetch version: ${error.message}`);
     }

     return data ? mapDatabaseToVersion(data) : null;
}

/**
 * Gets the current version number of a lesson
 * 
 * @param lessonId - The lesson ID
 * @returns The current version number
 */
export async function getCurrentLessonVersion(lessonId: string): Promise<number> {
     const supabase = createClient();

     const { data, error } = await supabase
          .from('lessons')
          .select('version')
          .eq('id', lessonId)
          .single();

     if (error) {
          console.error('Error fetching current lesson version:', error);
          throw new Error(`Failed to fetch current version: ${error.message}`);
     }

     return data?.version || 1;
}

/**
 * Restores a lesson to a previous version
 * This creates a new version with the content from the specified version
 * 
 * @param lessonId - The lesson ID
 * @param targetVersion - The version to restore to
 * @param changeNotes - Optional notes about the restoration
 * @returns The updated lesson
 */
export async function restoreLessonVersion(
     lessonId: string,
     targetVersion: number,
     changeNotes?: string
): Promise<Lesson> {
     const supabase = createClient();

     // Get the target version
     const versionData = await getLessonVersion(lessonId, targetVersion);

     if (!versionData) {
          throw new Error(`Version ${targetVersion} not found for lesson ${lessonId}`);
     }

     // Update the lesson with the version's content
     // The trigger will automatically save the current version before updating
     const { data, error } = await supabase
          .from('lessons')
          .update({
               title: versionData.title,
               description: versionData.description,
               content: versionData.content,
               order_index: versionData.orderIndex,
               estimated_duration: versionData.estimatedDuration,
               difficulty_level: versionData.difficultyLevel,
               prerequisites: versionData.prerequisites,
               language: versionData.language,
               starter_code: versionData.starterCode,
               test_cases: versionData.testCases,
               updated_at: new Date().toISOString(),
          })
          .eq('id', lessonId)
          .select()
          .single();

     if (error) {
          console.error('Error restoring lesson version:', error);
          throw new Error(`Failed to restore version: ${error.message}`);
     }

     // Optionally add change notes to the version that was just created
     if (changeNotes) {
          const currentVersion = await getCurrentLessonVersion(lessonId);
          await supabase
               .from('lesson_versions')
               .update({ change_notes: changeNotes })
               .eq('lesson_id', lessonId)
               .eq('version', currentVersion - 1); // The version that was just saved
     }

     return mapDatabaseToLesson(data);
}

/**
 * Compares two versions of a lesson
 * Returns the differences between the versions
 * 
 * @param lessonId - The lesson ID
 * @param version1 - First version number
 * @param version2 - Second version number
 * @returns Object describing the differences
 */
export async function compareLessonVersions(
     lessonId: string,
     version1: number,
     version2: number
): Promise<{
     version1: LessonVersion | null;
     version2: LessonVersion | null;
     differences: {
          field: string;
          version1Value: any;
          version2Value: any;
     }[];
}> {
     const [v1, v2] = await Promise.all([
          getLessonVersion(lessonId, version1),
          getLessonVersion(lessonId, version2),
     ]);

     if (!v1 || !v2) {
          return {
               version1: v1,
               version2: v2,
               differences: [],
          };
     }

     const differences: { field: string; version1Value: any; version2Value: any }[] = [];

     // Compare fields
     const fieldsToCompare = [
          'title',
          'description',
          'content',
          'orderIndex',
          'estimatedDuration',
          'difficultyLevel',
          'prerequisites',
          'language',
          'starterCode',
          'testCases',
     ];

     for (const field of fieldsToCompare) {
          const val1 = (v1 as any)[field];
          const val2 = (v2 as any)[field];

          if (JSON.stringify(val1) !== JSON.stringify(val2)) {
               differences.push({
                    field,
                    version1Value: val1,
                    version2Value: val2,
               });
          }
     }

     return {
          version1: v1,
          version2: v2,
          differences,
     };
}

/**
 * Maps database row to LessonVersion type
 */
function mapDatabaseToVersion(data: any): LessonVersion {
     return {
          id: data.id,
          lessonId: data.lesson_id,
          version: data.version,
          title: data.title,
          description: data.description,
          content: data.content,
          orderIndex: data.order_index,
          estimatedDuration: data.estimated_duration,
          difficultyLevel: data.difficulty_level,
          prerequisites: data.prerequisites || [],
          language: data.language,
          starterCode: data.starter_code,
          testCases: data.test_cases,
          createdAt: data.created_at,
          createdBy: data.created_by,
          changeNotes: data.change_notes,
     };
}

/**
 * Maps database row to Lesson type
 */
function mapDatabaseToLesson(data: any): Lesson {
     return {
          id: data.id,
          roadmapId: data.roadmap_id,
          title: data.title,
          description: data.description,
          content: data.content,
          orderIndex: data.order_index,
          estimatedDuration: data.estimated_duration,
          difficultyLevel: data.difficulty_level,
          prerequisites: data.prerequisites || [],
          language: data.language,
          starterCode: data.starter_code,
          testCases: data.test_cases,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
     };
}
