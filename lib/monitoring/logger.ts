/**
 * Error Logging Utility
 * Centralized error logging with Sentry integration
 */

import { logError as sentryLogError, logMessage as sentryLogMessage } from './sentry';

export interface LogContext {
     feature?: string;
     userId?: string;
     action?: string;
     metadata?: Record<string, unknown>;
}

/**
 * Log an error with context
 */
export function logError(error: Error | unknown, context?: LogContext): void {
     const errorObj = error instanceof Error ? error : new Error(String(error));

     // Log to console in development
     if (process.env.NODE_ENV === 'development') {
          console.error('[Error]', errorObj, context);
     }

     // Log to Sentry
     sentryLogError(errorObj, {
          feature: context?.feature,
          userId: context?.userId,
          extra: {
               action: context?.action,
               ...context?.metadata,
          },
     });
}

/**
 * Log a warning message
 */
export function logWarning(message: string, context?: LogContext): void {
     if (process.env.NODE_ENV === 'development') {
          console.warn('[Warning]', message, context);
     }

     sentryLogMessage(message, 'warning', {
          feature: context?.feature,
          userId: context?.userId,
          action: context?.action,
          ...context?.metadata,
     });
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: LogContext): void {
     if (process.env.NODE_ENV === 'development') {
          console.info('[Info]', message, context);
     }

     sentryLogMessage(message, 'info', {
          feature: context?.feature,
          userId: context?.userId,
          action: context?.action,
          ...context?.metadata,
     });
}

/**
 * Log API errors with standardized format
 */
export function logApiError(
     endpoint: string,
     error: Error | unknown,
     statusCode?: number,
     userId?: string
): void {
     logError(error, {
          feature: 'api',
          userId,
          action: endpoint,
          metadata: {
               statusCode,
               endpoint,
          },
     });
}

/**
 * Log database errors
 */
export function logDatabaseError(
     operation: string,
     error: Error | unknown,
     table?: string,
     userId?: string
): void {
     logError(error, {
          feature: 'database',
          userId,
          action: operation,
          metadata: {
               table,
               operation,
          },
     });
}

/**
 * Log external service errors (Claude, Piston, Resend)
 */
export function logExternalServiceError(
     service: 'claude' | 'piston' | 'resend',
     error: Error | unknown,
     operation?: string,
     userId?: string
): void {
     logError(error, {
          feature: `external-service-${service}`,
          userId,
          action: operation,
          metadata: {
               service,
               operation,
          },
     });
}
