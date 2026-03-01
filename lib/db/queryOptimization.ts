/**
 * Database Query Optimization Utilities
 * Helpers for efficient database queries with pagination and field selection
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Pagination options
 */
export interface PaginationOptions {
     page?: number;
     pageSize?: number;
     offset?: number;
     limit?: number;
}

/**
 * Query result with pagination metadata
 */
export interface PaginatedResult<T> {
     data: T[];
     pagination: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
     };
}

/**
 * Calculate pagination parameters
 */
export function calculatePagination(options: PaginationOptions = {}) {
     const page = options.page || 1;
     const pageSize = options.pageSize || 50;
     const offset = options.offset !== undefined ? options.offset : (page - 1) * pageSize;
     const limit = options.limit || pageSize;

     return { page, pageSize, offset, limit };
}

/**
 * Fetch paginated results with metadata
 */
export async function fetchPaginated<T>(
     query: any,
     options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
     const { page, pageSize, offset, limit } = calculatePagination(options);

     // Get total count
     const { count } = await query.select('*', { count: 'exact', head: true });
     const total = count || 0;

     // Get paginated data
     const { data, error } = await query.range(offset, offset + limit - 1);

     if (error) {
          throw error;
     }

     const totalPages = Math.ceil(total / pageSize);

     return {
          data: data || [],
          pagination: {
               page,
               pageSize,
               total,
               totalPages,
               hasNext: page < totalPages,
               hasPrev: page > 1,
          },
     };
}

/**
 * Optimized query for lesson progress with user filtering
 * Uses composite index: idx_lesson_progress_user_status
 */
export async function fetchUserLessonProgress(
     supabase: SupabaseClient,
     userId: string,
     status?: 'not_started' | 'in_progress' | 'completed',
     options: PaginationOptions = {}
) {
     let query = supabase
          .from('lesson_progress')
          .select('id, lesson_id, status, started_at, completed_at, completion_time')
          .eq('user_id', userId);

     if (status) {
          query = query.eq('status', status);
     }

     query = query.order('updated_at', { ascending: false });

     return fetchPaginated(query, options);
}

/**
 * Optimized query for messages with conversation filtering
 * Uses composite index: idx_messages_conversation_created
 */
export async function fetchConversationMessages(
     supabase: SupabaseClient,
     conversationId: string,
     options: PaginationOptions = {}
) {
     const query = supabase
          .from('messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false });

     return fetchPaginated(query, options);
}

/**
 * Optimized query for daily activity with date range
 * Uses composite index: idx_daily_activity_user_date
 */
export async function fetchUserActivity(
     supabase: SupabaseClient,
     userId: string,
     startDate: string,
     endDate: string
) {
     const { data, error } = await supabase
          .from('daily_activity')
          .select('activity_date, lessons_completed, time_spent, messages_sent, code_executions')
          .eq('user_id', userId)
          .gte('activity_date', startDate)
          .lte('activity_date', endDate)
          .order('activity_date', { ascending: false });

     if (error) {
          throw error;
     }

     return data || [];
}

/**
 * Optimized query for roadmap lessons with progress
 * Uses joins with proper indexing
 */
export async function fetchRoadmapWithProgress(
     supabase: SupabaseClient,
     userId: string,
     roadmapId: string
) {
     const { data, error } = await supabase
          .from('lessons')
          .select(`
      id,
      title,
      description,
      order_index,
      estimated_duration,
      difficulty_level,
      language,
      lesson_progress!inner(
        status,
        completed_at,
        completion_time
      )
    `)
          .eq('roadmap_id', roadmapId)
          .eq('lesson_progress.user_id', userId)
          .order('order_index', { ascending: true });

     if (error) {
          throw error;
     }

     return data || [];
}

/**
 * Optimized query for latest code save
 * Uses composite index: idx_code_saves_user_lesson
 */
export async function fetchLatestCodeSave(
     supabase: SupabaseClient,
     userId: string,
     lessonId?: string,
     projectId?: string
) {
     let query = supabase
          .from('code_saves')
          .select('code, language, saved_at')
          .eq('user_id', userId);

     if (lessonId) {
          query = query.eq('lesson_id', lessonId);
     }

     if (projectId) {
          query = query.eq('project_id', projectId);
     }

     const { data, error } = await query
          .order('saved_at', { ascending: false })
          .limit(1)
          .single();

     if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is acceptable
          throw error;
     }

     return data;
}

/**
 * Optimized query for user's active roadmap
 * Uses composite index: idx_roadmaps_user_status
 */
export async function fetchActiveRoadmap(
     supabase: SupabaseClient,
     userId: string
) {
     const { data, error } = await supabase
          .from('roadmaps')
          .select('id, title, description, goal, created_at')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

     if (error && error.code !== 'PGRST116') {
          throw error;
     }

     return data;
}

/**
 * Batch fetch lessons by IDs (for efficient prerequisite loading)
 */
export async function fetchLessonsByIds(
     supabase: SupabaseClient,
     lessonIds: string[]
) {
     if (lessonIds.length === 0) {
          return [];
     }

     const { data, error } = await supabase
          .from('lessons')
          .select('id, title, order_index, difficulty_level')
          .in('id', lessonIds);

     if (error) {
          throw error;
     }

     return data || [];
}

/**
 * Count query with caching hint
 */
export async function countWithCache(
     query: any,
     cacheKey: string
): Promise<number> {
     const { count, error } = await query.select('*', { count: 'exact', head: true });

     if (error) {
          throw error;
     }

     return count || 0;
}
