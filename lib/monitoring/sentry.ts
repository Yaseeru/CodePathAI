/**
 * Sentry Error Tracking Configuration
 * Handles error tracking and monitoring
 */

import * as Sentry from '@sentry/nextjs';

export function initSentry() {
     const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

     if (!dsn) {
          console.warn('Sentry DSN not configured. Error tracking is disabled.');
          return;
     }

     Sentry.init({
          dsn,
          environment: process.env.NODE_ENV || 'development',

          // Performance monitoring
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

          // Session replay
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,

          // Ignore common errors
          ignoreErrors: [
               'ResizeObserver loop limit exceeded',
               'Non-Error promise rejection captured',
               'Network request failed',
          ],

          // Filter sensitive data
          beforeSend(event, hint) {
               // Remove sensitive data from event
               if (event.request) {
                    delete event.request.cookies;
                    delete event.request.headers;
               }

               return event;
          },
     });
}

/**
 * Log an error to Sentry with context
 */
export function logError(
     error: Error,
     context?: {
          feature?: string;
          userId?: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          extra?: Record<string, unknown>;
     }
) {
     // Map severity to Sentry level
     const levelMap = {
          low: 'info' as const,
          medium: 'warning' as const,
          high: 'error' as const,
          critical: 'fatal' as const,
     };

     Sentry.captureException(error, {
          level: context?.severity ? levelMap[context.severity] : 'error',
          tags: {
               feature: context?.feature || 'unknown',
               severity: context?.severity || 'medium',
          },
          user: context?.userId ? { id: context.userId } : undefined,
          extra: context?.extra,
     });
}

/**
 * Log a message to Sentry
 */
export function logMessage(
     message: string,
     level: 'info' | 'warning' | 'error' = 'info',
     context?: Record<string, unknown>
) {
     Sentry.captureMessage(message, {
          level,
          extra: context,
     });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, name?: string) {
     Sentry.setUser({
          id: userId,
          email,
          username: name,
     });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
     Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
     message: string,
     category: string,
     data?: Record<string, unknown>
) {
     Sentry.addBreadcrumb({
          message,
          category,
          data,
          level: 'info',
     });
}
