/**
 * Unit tests for lesson versioning service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
     getLessonVersionHistory,
     getLessonVersion,
     getCurrentLessonVersion,
     compareLessonVersions,
} from '@/lib/services/lesson-versioning';
import * as supabase from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
     createClient: vi.fn(),
}));

describe('Lesson Versioning Service', () => {
     let mockSupabase: any;

     beforeEach(() => {
          vi.clearAllMocks();

          // Create mock Supabase client
          mockSupabase = {
               from: vi.fn().mockReturnThis(),
               select: vi.fn().mockReturnThis(),
               eq: vi.fn().mockReturnThis(),
               order: vi.fn().mockReturnThis(),
               single: vi.fn(),
               update: vi.fn().mockReturnThis(),
          };

          vi.mocked(supabase.createClient).mockReturnValue(mockSupabase);
     });

     describe('getLessonVersionHistory', () => {
          it('should fetch version history for a lesson', async () => {
               const mockDbVersions = [
                    {
                         id: 'v2',
                         lesson_id: 'lesson1',
                         version: 2,
                         title: 'Updated Title',
                         description: 'Updated description',
                         content: { sections: [] },
                         order_index: 1,
                         estimated_duration: 15,
                         difficulty_level: 1,
                         prerequisites: [],
                         language: 'javascript',
                         starter_code: null,
                         test_cases: null,
                         created_at: '2024-01-02T00:00:00Z',
                         created_by: null,
                         change_notes: null,
                    },
                    {
                         id: 'v1',
                         lesson_id: 'lesson1',
                         version: 1,
                         title: 'Original Title',
                         description: 'Original description',
                         content: { sections: [] },
                         order_index: 1,
                         estimated_duration: 15,
                         difficulty_level: 1,
                         prerequisites: [],
                         language: 'javascript',
                         starter_code: null,
                         test_cases: null,
                         created_at: '2024-01-01T00:00:00Z',
                         created_by: null,
                         change_notes: null,
                    },
               ];

               const expectedVersions = [
                    {
                         id: 'v2',
                         lessonId: 'lesson1',
                         version: 2,
                         title: 'Updated Title',
                         description: 'Updated description',
                         content: { sections: [] },
                         orderIndex: 1,
                         estimatedDuration: 15,
                         difficultyLevel: 1,
                         prerequisites: [],
                         language: 'javascript',
                         starterCode: null,
                         testCases: null,
                         createdAt: '2024-01-02T00:00:00Z',
                         createdBy: null,
                         changeNotes: null,
                    },
                    {
                         id: 'v1',
                         lessonId: 'lesson1',
                         version: 1,
                         title: 'Original Title',
                         description: 'Original description',
                         content: { sections: [] },
                         orderIndex: 1,
                         estimatedDuration: 15,
                         difficultyLevel: 1,
                         prerequisites: [],
                         language: 'javascript',
                         starterCode: null,
                         testCases: null,
                         createdAt: '2024-01-01T00:00:00Z',
                         createdBy: null,
                         changeNotes: null,
                    },
               ];

               mockSupabase.order.mockResolvedValue({
                    data: mockDbVersions,
                    error: null,
               });

               const result = await getLessonVersionHistory('lesson1');

               expect(result).toEqual(expectedVersions);
               expect(mockSupabase.from).toHaveBeenCalledWith('lesson_versions');
               expect(mockSupabase.eq).toHaveBeenCalledWith('lesson_id', 'lesson1');
               expect(mockSupabase.order).toHaveBeenCalledWith('version', { ascending: false });
          });

          it('should throw error when fetch fails', async () => {
               mockSupabase.order.mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' },
               });

               await expect(getLessonVersionHistory('lesson1')).rejects.toThrow(
                    'Failed to fetch version history: Database error'
               );
          });
     });

     describe('getLessonVersion', () => {
          it('should fetch a specific version', async () => {
               const mockDbVersion = {
                    id: 'v1',
                    lesson_id: 'lesson1',
                    version: 1,
                    title: 'Test Lesson',
                    description: 'Test description',
                    content: { sections: [] },
                    order_index: 1,
                    estimated_duration: 15,
                    difficulty_level: 1,
                    prerequisites: [],
                    language: 'javascript',
                    starter_code: null,
                    test_cases: null,
                    created_at: '2024-01-01T00:00:00Z',
                    created_by: null,
                    change_notes: null,
               };

               const expectedVersion = {
                    id: 'v1',
                    lessonId: 'lesson1',
                    version: 1,
                    title: 'Test Lesson',
                    description: 'Test description',
                    content: { sections: [] },
                    orderIndex: 1,
                    estimatedDuration: 15,
                    difficultyLevel: 1,
                    prerequisites: [],
                    language: 'javascript',
                    starterCode: null,
                    testCases: null,
                    createdAt: '2024-01-01T00:00:00Z',
                    createdBy: null,
                    changeNotes: null,
               };

               mockSupabase.single.mockResolvedValue({
                    data: mockDbVersion,
                    error: null,
               });

               const result = await getLessonVersion('lesson1', 1);

               expect(result).toEqual(expectedVersion);
               expect(mockSupabase.eq).toHaveBeenCalledWith('lesson_id', 'lesson1');
               expect(mockSupabase.eq).toHaveBeenCalledWith('version', 1);
          });

          it('should return null when version not found', async () => {
               mockSupabase.single.mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' },
               });

               const result = await getLessonVersion('lesson1', 999);

               expect(result).toBeNull();
          });
     });

     describe('getCurrentLessonVersion', () => {
          it('should fetch current version number', async () => {
               mockSupabase.single.mockResolvedValue({
                    data: { version: 3 },
                    error: null,
               });

               const result = await getCurrentLessonVersion('lesson1');

               expect(result).toBe(3);
               expect(mockSupabase.from).toHaveBeenCalledWith('lessons');
               expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'lesson1');
          });
     });

     describe('compareLessonVersions', () => {
          it('should compare two versions', async () => {
               const dbVersion1 = {
                    id: 'v1',
                    lesson_id: 'lesson1',
                    version: 1,
                    title: 'Original Title',
                    description: 'Original description',
                    content: { sections: [] },
                    order_index: 1,
                    estimated_duration: 15,
                    difficulty_level: 1,
                    prerequisites: [],
                    language: 'javascript',
                    starter_code: null,
                    test_cases: null,
                    created_at: '2024-01-01T00:00:00Z',
                    created_by: null,
                    change_notes: null,
               };

               const dbVersion2 = {
                    ...dbVersion1,
                    id: 'v2',
                    version: 2,
                    title: 'Updated Title',
                    estimated_duration: 20,
                    created_at: '2024-01-02T00:00:00Z',
               };

               const expectedVersion1 = {
                    id: 'v1',
                    lessonId: 'lesson1',
                    version: 1,
                    title: 'Original Title',
                    description: 'Original description',
                    content: { sections: [] },
                    orderIndex: 1,
                    estimatedDuration: 15,
                    difficultyLevel: 1,
                    prerequisites: [],
                    language: 'javascript',
                    starterCode: null,
                    testCases: null,
                    createdAt: '2024-01-01T00:00:00Z',
                    createdBy: null,
                    changeNotes: null,
               };

               const expectedVersion2 = {
                    ...expectedVersion1,
                    id: 'v2',
                    version: 2,
                    title: 'Updated Title',
                    estimatedDuration: 20,
                    createdAt: '2024-01-02T00:00:00Z',
               };

               mockSupabase.single
                    .mockResolvedValueOnce({ data: dbVersion1, error: null })
                    .mockResolvedValueOnce({ data: dbVersion2, error: null });

               const result = await compareLessonVersions('lesson1', 1, 2);

               expect(result.version1).toEqual(expectedVersion1);
               expect(result.version2).toEqual(expectedVersion2);
               expect(result.differences).toHaveLength(2);
               expect(result.differences).toContainEqual({
                    field: 'title',
                    version1Value: 'Original Title',
                    version2Value: 'Updated Title',
               });
               expect(result.differences).toContainEqual({
                    field: 'estimatedDuration',
                    version1Value: 15,
                    version2Value: 20,
               });
          });
     });
});