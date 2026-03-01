/**
 * API Response Helpers
 * Standardized response formatting for API routes
 */

import { NextResponse } from 'next/server';
import { logError } from '@/lib/monitoring/sentry';
import { ZodError } from 'zod';

/**
 * Success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
     return NextResponse.json(data, { status });
}

/**
 * Error response with user-friendly message
 */
export function errorResponse(
     error: unknown,
     context?: {
          feature?: string;
          userId?: string;
          extra?: Record<string, unknown>;
     }
): NextResponse {
     // Validation errors (Zod)
     if (error instanceof ZodError) {
          const fieldErrors = error.errors.map(err => ({
               field: err.path.join('.'),
               message: err.message,
          }));

          return NextResponse.json(
               {
                    error: 'Validation failed',
                    details: fieldErrors,
               },
               { status: 400 }
          );
     }

     // Known error types
     if (error instanceof Error) {
          const message = error.message;

          // Authentication errors
          if (message.includes('unauthorized') || message.includes('not authenticated')) {
               return NextResponse.json(
                    { error: 'Authentication required. Please log in.' },
                    { status: 401 }
               );
          }

          // Authorization errors
          if (message.includes('forbidden') || message.includes('not authorized')) {
               return NextResponse.json(
                    { error: 'You do not have permission to perform this action.' },
                    { status: 403 }
               );
          }

          // Not found errors
          if (message.includes('not found')) {
               return NextResponse.json(
                    { error: 'The requested resource was not found.' },
                    { status: 404 }
               );
          }

          // Rate limit errors
          if (message.includes('rate limit')) {
               return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    { status: 429 }
               );
          }

          // Log error to Sentry
          logError(error, context);

          // Generic error
          return NextResponse.json(
               {
                    error: 'An unexpected error occurred. Please try again.',
                    message: process.env.NODE_ENV === 'development' ? message : undefined,
               },
               { status: 500 }
          );
     }

     // Unknown error
     logError(new Error(String(error)), context);

     return NextResponse.json(
          { error: 'An unexpected error occurred. Please try again.' },
          { status: 500 }
     );
}

/**
 * Validation error response
 */
export function validationErrorResponse(message: string, details?: unknown): NextResponse {
     return NextResponse.json(
          {
               error: message,
               details,
          },
          { status: 400 }
     );
}

/**
 * Not found response
 */
export function notFoundResponse(resource: string): NextResponse {
     return NextResponse.json(
          { error: `${resource} not found.` },
          { status: 404 }
     );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = 'Authentication required.'): NextResponse {
     return NextResponse.json(
          { error: message },
          { status: 401 }
     );
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'You do not have permission to perform this action.'): NextResponse {
     return NextResponse.json(
          { error: message },
          { status: 403 }
     );
}
