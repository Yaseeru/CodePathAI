/**
 * Fetch with Retry Utility
 * Implements exponential backoff for API requests
 */

interface RetryOptions {
     maxRetries?: number;
     initialDelay?: number;
     maxDelay?: number;
     backoffMultiplier?: number;
     retryableStatuses?: number[];
     onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
     maxRetries: 3,
     initialDelay: 1000, // 1 second
     maxDelay: 10000, // 10 seconds
     backoffMultiplier: 2,
     retryableStatuses: [408, 429, 500, 502, 503, 504],
     onRetry: () => { },
};

/**
 * Check if an error is a network error
 */
function isNetworkError(error: unknown): boolean {
     if (error instanceof TypeError) {
          return error.message.includes('fetch') || error.message.includes('network');
     }
     return false;
}

/**
 * Check if a status code is retryable
 */
function isRetryableStatus(status: number, retryableStatuses: number[]): boolean {
     return retryableStatuses.includes(status);
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, initialDelay: number, maxDelay: number, backoffMultiplier: number): number {
     const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
     return Math.min(delay, maxDelay);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
     return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry and exponential backoff
 */
export async function fetchWithRetry(
     url: string,
     init?: RequestInit,
     options?: RetryOptions
): Promise<Response> {
     const opts = { ...DEFAULT_OPTIONS, ...options };
     let lastError: Error | null = null;

     for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
          try {
               const response = await fetch(url, init);

               // If response is successful or not retryable, return it
               if (response.ok || !isRetryableStatus(response.status, opts.retryableStatuses)) {
                    return response;
               }

               // Clone response for error handling
               const errorBody = await response.clone().text();
               lastError = new Error(
                    `HTTP ${response.status}: ${response.statusText}. ${errorBody}`
               );

               // If we've exhausted retries, throw
               if (attempt === opts.maxRetries) {
                    throw lastError;
               }

               // Calculate delay and retry
               const delay = calculateDelay(attempt, opts.initialDelay, opts.maxDelay, opts.backoffMultiplier);
               opts.onRetry(attempt + 1, lastError);
               await sleep(delay);

          } catch (error) {
               // Network errors are always retryable
               if (isNetworkError(error)) {
                    lastError = error as Error;

                    if (attempt === opts.maxRetries) {
                         throw new Error(`Network error after ${opts.maxRetries} retries: ${lastError.message}`);
                    }

                    const delay = calculateDelay(attempt, opts.initialDelay, opts.maxDelay, opts.backoffMultiplier);
                    opts.onRetry(attempt + 1, lastError);
                    await sleep(delay);
                    continue;
               }

               // Non-retryable errors are thrown immediately
               throw error;
          }
     }

     // Should never reach here, but TypeScript needs it
     throw lastError || new Error('Unknown error occurred');
}

/**
 * Fetch JSON with retry
 */
export async function fetchJsonWithRetry<T = unknown>(
     url: string,
     init?: RequestInit,
     options?: RetryOptions
): Promise<T> {
     const response = await fetchWithRetry(url, init, options);

     if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
     }

     return response.json();
}
