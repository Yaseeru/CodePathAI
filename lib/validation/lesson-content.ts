/**
 * Lesson Content Validation Utilities
 * Validates JSONB lesson content structure on insert/update
 */

import { lessonContentSchema, lessonSchema } from './schemas';
import type { LessonContent, Lesson } from '@/lib/types';

/**
 * Validates lesson content structure
 * Ensures required fields (sections, learningObjectives, exercises)
 * Validates array types and nested structures
 * 
 * @param content - The lesson content to validate
 * @returns Validation result with parsed data or errors
 */
export function validateLessonContent(content: unknown) {
     const result = lessonContentSchema.safeParse(content);

     if (!result.success) {
          return {
               valid: false,
               errors: result.error.flatten().fieldErrors,
               message: 'Invalid lesson content structure',
          };
     }

     return {
          valid: true,
          data: result.data as LessonContent,
     };
}

/**
 * Validates complete lesson data including content
 * 
 * @param lesson - The lesson data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateLesson(lesson: unknown) {
     const result = lessonSchema.safeParse(lesson);

     if (!result.success) {
          return {
               valid: false,
               errors: result.error.flatten().fieldErrors,
               message: 'Invalid lesson data',
          };
     }

     return {
          valid: true,
          data: result.data,
     };
}

/**
 * Validates lesson content before database insert/update
 * Throws an error if validation fails
 * 
 * @param content - The lesson content to validate
 * @throws Error if validation fails
 */
export function assertValidLessonContent(content: unknown): asserts content is LessonContent {
     const result = validateLessonContent(content);

     if (!result.valid) {
          throw new Error(`Lesson content validation failed: ${JSON.stringify(result.errors)}`);
     }
}

/**
 * Validates lesson data before database insert/update
 * Throws an error if validation fails
 * 
 * @param lesson - The lesson data to validate
 * @throws Error if validation fails
 */
export function assertValidLesson(lesson: unknown): asserts lesson is Partial<Lesson> {
     const result = validateLesson(lesson);

     if (!result.valid) {
          throw new Error(`Lesson validation failed: ${JSON.stringify(result.errors)}`);
     }
}
