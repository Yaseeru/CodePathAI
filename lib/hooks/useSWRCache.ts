/**
 * SWR Caching Hooks
 * Client-side data caching with automatic revalidation
 */

import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
     const res = await fetch(url);
     if (!res.ok) {
          const error = new Error('An error occurred while fetching the data.');
          throw error;
     }
     return res.json();
};

// Default SWR configuration
const defaultConfig = {
     revalidateOnFocus: false,
     revalidateOnReconnect: true,
     dedupingInterval: 60000, // 1 minute
};

/**
 * Hook for fetching user progress with caching
 * Cache duration: 5 minutes
 */
export function useProgress() {
     const { data, error, mutate, isLoading } = useSWR(
          '/api/progress',
          fetcher,
          {
               ...defaultConfig,
               refreshInterval: 300000, // 5 minutes
          }
     );

     return {
          progress: data,
          isLoading,
          isError: error,
          mutate,
     };
}

/**
 * Hook for fetching roadmap data with caching
 * Cache duration: 1 hour (roadmap changes infrequently)
 */
export function useRoadmap() {
     const { data, error, mutate, isLoading } = useSWR(
          '/api/roadmap',
          fetcher,
          {
               ...defaultConfig,
               refreshInterval: 3600000, // 1 hour
          }
     );

     return {
          roadmap: data,
          isLoading,
          isError: error,
          mutate,
     };
}

/**
 * Hook for fetching lesson data with caching
 * Cache duration: Static (long TTL, only revalidate on mount)
 */
export function useLesson(lessonId: string | null) {
     const { data, error, mutate, isLoading } = useSWR(
          lessonId ? `/api/lessons/${lessonId}` : null,
          fetcher,
          {
               ...defaultConfig,
               revalidateOnMount: true,
               refreshInterval: 0, // No auto-refresh, lesson content is static
          }
     );

     return {
          lesson: data,
          isLoading,
          isError: error,
          mutate,
     };
}

/**
 * Hook for fetching project data with caching
 * Cache duration: Static (long TTL)
 */
export function useProject(projectId: string | null) {
     const { data, error, mutate, isLoading } = useSWR(
          projectId ? `/api/projects/${projectId}` : null,
          fetcher,
          {
               ...defaultConfig,
               revalidateOnMount: true,
               refreshInterval: 0, // No auto-refresh, project content is static
          }
     );

     return {
          project: data,
          isLoading,
          isError: error,
          mutate,
     };
}

/**
 * Hook for fetching analytics data with caching
 * Cache duration: 10 minutes
 */
export function useAnalytics(endpoint: string) {
     const { data, error, mutate, isLoading } = useSWR(
          `/api/analytics/${endpoint}`,
          fetcher,
          {
               ...defaultConfig,
               refreshInterval: 600000, // 10 minutes
          }
     );

     return {
          data,
          isLoading,
          isError: error,
          mutate,
     };
}
