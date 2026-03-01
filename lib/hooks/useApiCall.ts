/**
 * Custom hook for API calls with error handling and retry logic
 */

import { useState, useCallback } from 'react';
import { fetchWithRetry } from '@/lib/api/fetchWithRetry';
import { mapErrorToUserMessage, ApiError } from '@/lib/api/errorHandling';
import { logError } from '@/lib/monitoring/sentry';

interface UseApiCallOptions {
     maxRetries?: number;
     onSuccess?: () => void;
     onError?: (error: ApiError) => void;
}

interface UseApiCallResult<T> {
     data: T | null;
     error: ApiError | null;
     loading: boolean;
     execute: (url: string, init?: RequestInit) => Promise<T | null>;
     retry: () => Promise<T | null>;
     reset: () => void;
}

export function useApiCall<T = unknown>(options: UseApiCallOptions = {}): UseApiCallResult<T> {
     const [data, setData] = useState<T | null>(null);
     const [error, setError] = useState<ApiError | null>(null);
     const [loading, setLoading] = useState(false);
     const [lastRequest, setLastRequest] = useState<{ url: string; init?: RequestInit } | null>(null);

     const execute = useCallback(async (url: string, init?: RequestInit): Promise<T | null> => {
          setLoading(true);
          setError(null);
          setLastRequest({ url, init });

          try {
               const response = await fetchWithRetry(url, init, {
                    maxRetries: options.maxRetries ?? 3,
                    onRetry: (attempt, error) => {
                         console.log(`Retry attempt ${attempt}:`, error.message);
                    },
               });

               if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
               }

               const result = await response.json() as T;
               setData(result);
               setLoading(false);

               if (options.onSuccess) {
                    options.onSuccess();
               }

               return result;
          } catch (err) {
               const apiError = mapErrorToUserMessage(err);
               setError(apiError);
               setLoading(false);

               // Log error to Sentry
               logError(err as Error, {
                    feature: 'api-call',
                    extra: {
                         url,
                         method: init?.method || 'GET',
                         statusCode: apiError.statusCode,
                    },
               });

               if (options.onError) {
                    options.onError(apiError);
               }

               return null;
          }
     }, [options]);

     const retry = useCallback(async (): Promise<T | null> => {
          if (!lastRequest) {
               return null;
          }
          return execute(lastRequest.url, lastRequest.init);
     }, [lastRequest, execute]);

     const reset = useCallback(() => {
          setData(null);
          setError(null);
          setLoading(false);
          setLastRequest(null);
     }, []);

     return {
          data,
          error,
          loading,
          execute,
          retry,
          reset,
     };
}
