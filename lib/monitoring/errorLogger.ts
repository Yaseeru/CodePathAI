/**
 * Comprehensive Error Logging System
 * Provides structured error logging with context and breadcrumbs
 */

import { logError as sentryLogError, addBreadcrumb } from './sentry';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
     feature: string;
     userId?: string;
     userEmail?: string;
     severity?: ErrorSeverity;
     extra?: Record<string, unknown>;
}

/**
 * Log an error with full context
 */
export function logError(error: Error, context: ErrorContext): void {
     // Add breadcrumb before logging error
     addBreadcrumb(
          `Error in ${context.feature}`,
          'error',
          {
               errorMessage: error.message,
               errorStack: error.stack,
               ...context.extra,
          }
     );

     // Log to Sentry
     sentryLogError(error, context);

     // Log to console in development
     if (process.env.NODE_ENV === 'development') {
          console.error(`[${context.feature}] Error:`, error);
          console.error('Context:', context);
     }
}

/**
 * Log an API error
 */
export function logApiError(
     error: Error,
     endpoint: string,
     method: string,
     statusCode?: number,
     userId?: string
): void {
     logError(error, {
          feature: 'api',
          userId,
          severity: statusCode && statusCode >= 500 ? 'high' : 'medium',
          extra: {
               endpoint,
               method,
               statusCode,
          },
     });
}

/**
 * Log an authentication error
 */
export function logAuthError(error: Error, action: string, userId?: string): void {
     logError(error, {
          feature: 'authentication',
          userId,
          severity: 'high',
          extra: {
               action,
          },
     });
}

/**
 * Log an AI service error
 */
export function logAiError(
     error: Error,
     service: 'claude' | 'piston',
     operation: string,
     userId?: string
): void {
     logError(error, {
          feature: 'ai-service',
          userId,
          severity: 'high',
          extra: {
               service,
               operation,
          },
     });
}

/**
 * Log a database error
 */
export function logDatabaseError(
     error: Error,
     table: string,
     operation: string,
     userId?: string
): void {
     logError(error, {
          feature: 'database',
          userId,
          severity: 'critical',
          extra: {
               table,
               operation,
          },
     });
}

/**
 * Log a validation error
 */
export function logValidationError(
     error: Error,
     formName: string,
     fields: string[],
     userId?: string
): void {
     logError(error, {
          feature: 'validation',
          userId,
          severity: 'low',
          extra: {
               formName,
               fields,
          },
     });
}

/**
 * Log a code execution error
 */
export function logCodeExecutionError(
     error: Error,
     language: string,
     lessonId?: string,
     userId?: string
): void {
     logError(error, {
          feature: 'code-execution',
          userId,
          severity: 'medium',
          extra: {
               language,
               lessonId,
          },
     });
}

/**
 * Log a roadmap generation error
 */
export function logRoadmapError(
     error: Error,
     goal: string,
     userId?: string
): void {
     logError(error, {
          feature: 'roadmap-generation',
          userId,
          severity: 'high',
          extra: {
               goal: goal.substring(0, 100), // Truncate for privacy
          },
     });
}

/**
 * Track error breadcrumb
 */
export function trackErrorBreadcrumb(
     message: string,
     category: string,
     data?: Record<string, unknown>
): void {
     addBreadcrumb(message, category, data);
}

/**
 * Log performance issue
 */
export function logPerformanceIssue(
     operation: string,
     duration: number,
     threshold: number,
     userId?: string
): void {
     if (duration > threshold) {
          logError(
               new Error(`Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`),
               {
                    feature: 'performance',
                    userId,
                    severity: 'medium',
                    extra: {
                         operation,
                         duration,
                         threshold,
                    },
               }
          );
     }
}
