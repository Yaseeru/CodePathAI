/**
 * Query Performance Monitoring
 * Track and log slow database queries for optimization
 */

import * as Sentry from '@sentry/nextjs';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
     FAST: 100,
     ACCEPTABLE: 500,
     SLOW: 1000,
     CRITICAL: 3000,
} as const;

interface QueryMetrics {
     queryName: string;
     duration: number;
     success: boolean;
     error?: string;
     metadata?: Record<string, any>;
}

/**
 * Monitor query performance and log slow queries
 */
export async function monitorQuery<T>(
     queryName: string,
     queryFn: () => Promise<T>,
     metadata?: Record<string, any>
): Promise<T> {
     const startTime = performance.now();
     let success = true;
     let error: string | undefined;

     try {
          const result = await queryFn();
          return result;
     } catch (err) {
          success = false;
          error = err instanceof Error ? err.message : 'Unknown error';
          throw err;
     } finally {
          const duration = performance.now() - startTime;

          // Log metrics
          logQueryMetrics({
               queryName,
               duration,
               success,
               error,
               metadata,
          });

          // Alert on slow queries
          if (duration > THRESHOLDS.SLOW) {
               logSlowQuery(queryName, duration, metadata);
          }

          // Send to Sentry for critical queries
          if (duration > THRESHOLDS.CRITICAL) {
               Sentry.captureMessage(`Critical slow query: ${queryName}`, {
                    level: 'warning',
                    extra: {
                         duration,
                         metadata,
                    },
               });
          }
     }
}

/**
 * Log query metrics to console (in development) or analytics service
 */
function logQueryMetrics(metrics: QueryMetrics) {
     if (process.env.NODE_ENV === 'development') {
          const level = getLogLevel(metrics.duration);
          const emoji = getPerformanceEmoji(metrics.duration);

          console.log(
               `${emoji} Query: ${metrics.queryName} | ${metrics.duration.toFixed(2)}ms | ${metrics.success ? '✓' : '✗'
               }`
          );

          if (metrics.error) {
               console.error(`  Error: ${metrics.error}`);
          }

          if (metrics.metadata) {
               console.log(`  Metadata:`, metrics.metadata);
          }
     }

     // In production, send to analytics service
     if (process.env.NODE_ENV === 'production') {
          // TODO: Send to PostHog or other analytics service
          // posthog.capture('query_performance', metrics);
     }
}

/**
 * Log slow query warning
 */
function logSlowQuery(
     queryName: string,
     duration: number,
     metadata?: Record<string, any>
) {
     console.warn(
          `⚠️  SLOW QUERY DETECTED: ${queryName} took ${duration.toFixed(2)}ms`,
          metadata
     );

     // In production, alert monitoring service
     if (process.env.NODE_ENV === 'production') {
          Sentry.captureMessage(`Slow query: ${queryName}`, {
               level: 'warning',
               extra: {
                    duration,
                    metadata,
               },
          });
     }
}

/**
 * Get log level based on duration
 */
function getLogLevel(duration: number): 'info' | 'warn' | 'error' {
     if (duration < THRESHOLDS.ACCEPTABLE) return 'info';
     if (duration < THRESHOLDS.SLOW) return 'warn';
     return 'error';
}

/**
 * Get emoji based on performance
 */
function getPerformanceEmoji(duration: number): string {
     if (duration < THRESHOLDS.FAST) return '⚡';
     if (duration < THRESHOLDS.ACCEPTABLE) return '✓';
     if (duration < THRESHOLDS.SLOW) return '⚠️';
     return '🐌';
}

/**
 * Batch query monitor for multiple queries
 */
export async function monitorBatchQueries<T>(
     batchName: string,
     queries: Array<{ name: string; fn: () => Promise<any> }>
): Promise<T[]> {
     const startTime = performance.now();

     const results = await Promise.all(
          queries.map(({ name, fn }) => monitorQuery(name, fn))
     );

     const totalDuration = performance.now() - startTime;

     console.log(
          `📦 Batch: ${batchName} | ${queries.length} queries | ${totalDuration.toFixed(
               2
          )}ms total`
     );

     return results;
}

/**
 * Query performance statistics
 */
export class QueryStats {
     private stats: Map<string, number[]> = new Map();

     record(queryName: string, duration: number) {
          if (!this.stats.has(queryName)) {
               this.stats.set(queryName, []);
          }
          this.stats.get(queryName)!.push(duration);
     }

     getStats(queryName: string) {
          const durations = this.stats.get(queryName) || [];
          if (durations.length === 0) {
               return null;
          }

          const sorted = [...durations].sort((a, b) => a - b);
          const sum = durations.reduce((a, b) => a + b, 0);

          return {
               count: durations.length,
               avg: sum / durations.length,
               min: sorted[0],
               max: sorted[sorted.length - 1],
               p50: sorted[Math.floor(sorted.length * 0.5)],
               p95: sorted[Math.floor(sorted.length * 0.95)],
               p99: sorted[Math.floor(sorted.length * 0.99)],
          };
     }

     getAllStats() {
          const allStats: Record<string, any> = {};
          for (const [queryName] of this.stats) {
               allStats[queryName] = this.getStats(queryName);
          }
          return allStats;
     }

     reset() {
          this.stats.clear();
     }
}

// Global query stats instance
export const globalQueryStats = new QueryStats();
