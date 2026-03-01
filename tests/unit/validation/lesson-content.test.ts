/**
 * Unit tests for lesson content validation
 */

import { describe, it, expect } from 'vitest';
import { validateLessonContent, validateLesson, assertValidLessonContent, assertValidLesson } from '@/lib/validation/lesson-content';
import type { LessonContent } from '@/lib/types';

describe('Lesson Content Validation', () => {
     describe('validateLessonContent', () => {
          it('should validate valid lesson content', () => {
               const validContent: LessonContent = {
                    sections: [
                         {
                              type: 'text',
                              content: 'Introduction to variables',
                         },
                         {
                              type: 'code',
                              content: 'const x = 42;',
                              language: 'javascript',
                         },
                    ],
                    learningObjectives: [
                         'Understand variable declaration',
                         'Learn const keyword',
                    ],
                    exercises: [
                         {
                              id: 'ex1',
                              prompt: 'Declare a variable',
                              hints: ['Use const or let'],
                         },
                    ],
               };

               const result = validateLessonContent(validContent);
               expect(result.valid).toBe(true);
               if (result.valid) {
                    expect(result.data).toEqual(validContent);
               }
          });

          it('should reject content without sections', () => {
               const invalidContent = {
                    sections: [],
                    learningObjectives: ['Learn something'],
                    exercises: [{ id: 'ex1', prompt: 'Do something', hints: [] }],
               };

               const result = validateLessonContent(invalidContent);
               expect(result.valid).toBe(false);
               if (!result.valid) {
                    expect(result.errors.sections).toBeDefined();
               }
          });

          it('should reject content without learning objectives', () => {
               const invalidContent = {
                    sections: [{ type: 'text', content: 'Test' }],
                    learningObjectives: [],
                    exercises: [{ id: 'ex1', prompt: 'Do something', hints: [] }],
               };

               const result = validateLessonContent(invalidContent);
               expect(result.valid).toBe(false);
               if (!result.valid) {
                    expect(result.errors.learningObjectives).toBeDefined();
               }
          });

          it('should reject content without exercises', () => {
               const invalidContent = {
                    sections: [{ type: 'text', content: 'Test' }],
                    learningObjectives: ['Learn something'],
                    exercises: [],
               };

               const result = validateLessonContent(invalidContent);
               expect(result.valid).toBe(false);
               if (!result.valid) {
                    expect(result.errors.exercises).toBeDefined();
               }
          });

          it('should reject invalid section type', () => {
               const invalidContent = {
                    sections: [{ type: 'invalid', content: 'Test' }],
                    learningObjectives: ['Learn something'],
                    exercises: [{ id: 'ex1', prompt: 'Do something', hints: [] }],
               };

               const result = validateLessonContent(invalidContent);
               expect(result.valid).toBe(false);
          });

          it('should reject empty section content', () => {
               const invalidContent = {
                    sections: [{ type: 'text', content: '' }],
                    learningObjectives: ['Learn something'],
                    exercises: [{ id: 'ex1', prompt: 'Do something', hints: [] }],
               };

               const result = validateLessonContent(invalidContent);
               expect(result.valid).toBe(false);
          });

          it('should reject exercise without prompt', () => {
               const invalidContent = {
                    sections: [{ type: 'text', content: 'Test' }],
                    learningObjectives: ['Learn something'],
                    exercises: [{ id: 'ex1', prompt: '', hints: [] }],
               };

               const result = validateLessonContent(invalidContent);
               expect(result.valid).toBe(false);
          });
     });

     describe('validateLesson', () => {
          it('should validate complete lesson data', () => {
               const validLesson = {
                    roadmapId: '123e4567-e89b-12d3-a456-426614174000',
                    title: 'Introduction to Variables',
                    description: 'Learn about variables in JavaScript',
                    content: {
                         sections: [{ type: 'text', content: 'Test' }],
                         learningObjectives: ['Learn variables'],
                         exercises: [{ id: 'ex1', prompt: 'Declare a variable', hints: [] }],
                    },
                    orderIndex: 0,
                    estimatedDuration: 15,
                    difficultyLevel: 1,
                    prerequisites: [],
                    language: 'javascript',
                    starterCode: 'const x = 0;',
                    testCases: [
                         {
                              input: 5,
                              expectedOutput: 10,
                              description: 'Should double the input',
                         },
                    ],
               };

               const result = validateLesson(validLesson);
               expect(result.valid).toBe(true);
          });

          it('should reject lesson with invalid roadmap ID', () => {
               const invalidLesson = {
                    roadmapId: 'invalid-uuid',
                    title: 'Test',
                    description: 'Test',
                    content: {
                         sections: [{ type: 'text', content: 'Test' }],
                         learningObjectives: ['Learn'],
                         exercises: [{ id: 'ex1', prompt: 'Do', hints: [] }],
                    },
                    orderIndex: 0,
                    estimatedDuration: 15,
                    language: 'javascript',
               };

               const result = validateLesson(invalidLesson);
               expect(result.valid).toBe(false);
          });

          it('should reject lesson with duration less than 5 minutes', () => {
               const invalidLesson = {
                    roadmapId: '123e4567-e89b-12d3-a456-426614174000',
                    title: 'Test',
                    description: 'Test',
                    content: {
                         sections: [{ type: 'text', content: 'Test' }],
                         learningObjectives: ['Learn'],
                         exercises: [{ id: 'ex1', prompt: 'Do', hints: [] }],
                    },
                    orderIndex: 0,
                    estimatedDuration: 3,
                    language: 'javascript',
               };

               const result = validateLesson(invalidLesson);
               expect(result.valid).toBe(false);
          });

          it('should reject lesson with invalid language', () => {
               const invalidLesson = {
                    roadmapId: '123e4567-e89b-12d3-a456-426614174000',
                    title: 'Test',
                    description: 'Test',
                    content: {
                         sections: [{ type: 'text', content: 'Test' }],
                         learningObjectives: ['Learn'],
                         exercises: [{ id: 'ex1', prompt: 'Do', hints: [] }],
                    },
                    orderIndex: 0,
                    estimatedDuration: 15,
                    language: 'ruby',
               };

               const result = validateLesson(invalidLesson);
               expect(result.valid).toBe(false);
          });
     });

     describe('assertValidLessonContent', () => {
          it('should not throw for valid content', () => {
               const validContent = {
                    sections: [{ type: 'text', content: 'Test' }],
                    learningObjectives: ['Learn'],
                    exercises: [{ id: 'ex1', prompt: 'Do', hints: [] }],
               };

               expect(() => assertValidLessonContent(validContent)).not.toThrow();
          });

          it('should throw for invalid content', () => {
               const invalidContent = {
                    sections: [],
                    learningObjectives: [],
                    exercises: [],
               };

               expect(() => assertValidLessonContent(invalidContent)).toThrow();
          });
     });

     describe('assertValidLesson', () => {
          it('should not throw for valid lesson', () => {
               const validLesson = {
                    roadmapId: '123e4567-e89b-12d3-a456-426614174000',
                    title: 'Test',
                    description: 'Test',
                    content: {
                         sections: [{ type: 'text', content: 'Test' }],
                         learningObjectives: ['Learn'],
                         exercises: [{ id: 'ex1', prompt: 'Do', hints: [] }],
                    },
                    orderIndex: 0,
                    estimatedDuration: 15,
                    language: 'javascript',
               };

               expect(() => assertValidLesson(validLesson)).not.toThrow();
          });

          it('should throw for invalid lesson', () => {
               const invalidLesson = {
                    roadmapId: 'invalid',
                    title: '',
                    description: '',
                    content: {},
                    orderIndex: -1,
                    estimatedDuration: 0,
                    language: 'invalid',
               };

               expect(() => assertValidLesson(invalidLesson)).toThrow();
          });
     });
});
