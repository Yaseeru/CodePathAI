/**
 * API Error Handling Utilities
 * Provides user-friendly error messages and graceful degradation
 */

export interface ApiError {
     message: string;
     userMessage: string;
     code?: string;
     statusCode?: number;
     retryable: boolean;
     action?: string;
}

/**
 * Map API errors to user-friendly messages
 */
export function mapErrorToUserMessage(error: unknown): ApiError {
     // Network errors
     if (error instanceof TypeError && error.message.includes('fetch')) {
          return {
               message: error.message,
               userMessage: 'Unable to connect to the server. Please check your internet connection.',
               retryable: true,
               action: 'Check your connection and try again',
          };
     }

     // HTTP errors
     if (error instanceof Error) {
          const message = error.message;

          // Parse HTTP status from error message
          const statusMatch = message.match(/HTTP (\d+)/);
          const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined;

          // Timeout errors
          if (message.includes('timeout') || statusCode === 408) {
               return {
                    message,
                    userMessage: 'The request took too long to complete.',
                    statusCode,
                    retryable: true,
                    action: 'Please try again',
               };
          }

          // Rate limit errors
          if (statusCode === 429) {
               return {
                    message,
                    userMessage: 'Too many requests. Please wait a moment before trying again.',
                    statusCode,
                    retryable: true,
                    action: 'Wait a few seconds and try again',
               };
          }

          // Server errors
          if (statusCode && statusCode >= 500) {
               return {
                    message,
                    userMessage: 'Our servers are experiencing issues. Please try again in a moment.',
                    statusCode,
                    retryable: true,
                    action: 'Try again in a few moments',
               };
          }

          // Authentication errors
          if (statusCode === 401) {
               return {
                    message,
                    userMessage: 'Your session has expired. Please log in again.',
                    statusCode,
                    retryable: false,
                    action: 'Log in again',
               };
          }

          // Authorization errors
          if (statusCode === 403) {
               return {
                    message,
                    userMessage: "You don't have permission to perform this action.",
                    statusCode,
                    retryable: false,
                    action: 'Contact support if you believe this is an error',
               };
          }

          // Not found errors
          if (statusCode === 404) {
               return {
                    message,
                    userMessage: 'The requested resource was not found.',
                    statusCode,
                    retryable: false,
                    action: 'Go back and try again',
               };
          }

          // Validation errors
          if (statusCode === 400) {
               return {
                    message,
                    userMessage: 'The information provided is invalid. Please check your input.',
                    statusCode,
                    retryable: false,
                    action: 'Review your input and try again',
               };
          }

          // Generic error
          return {
               message,
               userMessage: 'An unexpected error occurred. Please try again.',
               statusCode,
               retryable: true,
               action: 'Try again',
          };
     }

     // Unknown error
     return {
          message: String(error),
          userMessage: 'An unexpected error occurred. Please try again.',
          retryable: true,
          action: 'Try again',
     };
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: ApiError): string {
     if (error.action) {
          return `${error.userMessage} ${error.action}.`;
     }
     return error.userMessage;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
     const apiError = mapErrorToUserMessage(error);
     return apiError.retryable;
}

/**
 * Get retry delay based on attempt number
 */
export function getRetryDelay(attempt: number): number {
     // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
     return Math.min(1000 * Math.pow(2, attempt), 10000);
}
