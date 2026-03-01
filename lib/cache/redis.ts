/**
 * Redis Caching Utility
 * Server-side caching for expensive queries
 * 
 * Note: This is a placeholder implementation. In production, you would:
 * 1. Install @upstash/redis or ioredis
 * 2. Set up Redis instance (Upstash, Redis Cloud, or self-hosted)
 * 3. Add REDIS_URL to environment variables
 */

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
     ROADMAP: 3600, // 1 hour
     LESSON: 86400, // 24 hours (static content)
     PROGRESS: 300, // 5 minutes
     ANALYTICS: 600, // 10 minutes
} as const;

// In-memory cache fallback (for development)
const memoryCache = new Map<string, { value: any; expires: number }>();

/**
 * Get cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
     // Check in-memory cache
     const cached = memoryCache.get(key);
     if (cached && cached.expires > Date.now()) {
          return cached.value as T;
     }

     // Remove expired entry
     if (cached) {
          memoryCache.delete(key);
     }

     return null;
}

/**
 * Set cached value with TTL
 */
export async function setCached(
     key: string,
     value: any,
     ttl: number
): Promise<void> {
     const expires = Date.now() + ttl * 1000;
     memoryCache.set(key, { value, expires });

     // Clean up expired entries periodically
     if (memoryCache.size > 1000) {
          const now = Date.now();
          for (const [k, v] of memoryCache.entries()) {
               if (v.expires <= now) {
                    memoryCache.delete(k);
               }
          }
     }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
     memoryCache.delete(key);
}

/**
 * Delete all cached values matching a pattern
 */
export async function deleteCachedPattern(pattern: string): Promise<void> {
     const regex = new RegExp(pattern.replace('*', '.*'));
     for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
               memoryCache.delete(key);
          }
     }
}

/**
 * Cache wrapper for expensive operations
 */
export async function withCache<T>(
     key: string,
     ttl: number,
     fn: () => Promise<T>
): Promise<T> {
     // Try to get from cache
     const cached = await getCached<T>(key);
     if (cached !== null) {
          return cached;
     }

     // Execute function and cache result
     const result = await fn();
     await setCached(key, result, ttl);
     return result;
}

/**
 * Generate cache key for roadmap
 */
export function roadmapCacheKey(userId: string): string {
     return `roadmap:${userId}`;
}

/**
 * Generate cache key for lesson
 */
export function lessonCacheKey(lessonId: string): string {
     return `lesson:${lessonId}`;
}

/**
 * Generate cache key for progress
 */
export function progressCacheKey(userId: string): string {
     return `progress:${userId}`;
}

/**
 * Invalidate user-specific caches
 */
export async function invalidateUserCache(userId: string): Promise<void> {
     await deleteCachedPattern(`*:${userId}`);
}
