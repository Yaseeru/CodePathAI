/**
 * Client-side hook for consuming streaming API responses
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface StreamingOptions {
     onChunk?: (chunk: string) => void;
     onComplete?: (fullResponse: string) => void;
     onError?: (error: Error) => void;
}

interface StreamingState {
     isStreaming: boolean;
     response: string;
     error: Error | null;
}

/**
 * Hook for consuming streaming responses from API
 */
export function useStreamingResponse() {
     const [state, setState] = useState<StreamingState>({
          isStreaming: false,
          response: '',
          error: null,
     });

     const abortControllerRef = useRef<AbortController | null>(null);

     const startStreaming = useCallback(
          async (url: string, body: any, options: StreamingOptions = {}) => {
               // Reset state
               setState({
                    isStreaming: true,
                    response: '',
                    error: null,
               });

               // Create abort controller for cancellation
               abortControllerRef.current = new AbortController();

               try {
                    const response = await fetch(url, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json',
                         },
                         body: JSON.stringify(body),
                         signal: abortControllerRef.current.signal,
                    });

                    if (!response.ok) {
                         throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const reader = response.body?.getReader();
                    if (!reader) {
                         throw new Error('Response body is not readable');
                    }

                    const decoder = new TextDecoder();
                    let fullResponse = '';

                    while (true) {
                         const { done, value } = await reader.read();

                         if (done) {
                              break;
                         }

                         const chunk = decoder.decode(value, { stream: true });
                         const lines = chunk.split('\n');

                         for (const line of lines) {
                              if (line.startsWith('data: ')) {
                                   try {
                                        const data = JSON.parse(line.slice(6));

                                        if (data.error) {
                                             throw new Error(data.error);
                                        }

                                        if (data.chunk) {
                                             fullResponse += data.chunk;
                                             setState((prev) => ({
                                                  ...prev,
                                                  response: fullResponse,
                                             }));

                                             if (options.onChunk) {
                                                  options.onChunk(data.chunk);
                                             }
                                        }

                                        if (data.done) {
                                             setState({
                                                  isStreaming: false,
                                                  response: fullResponse,
                                                  error: null,
                                             });

                                             if (options.onComplete) {
                                                  options.onComplete(fullResponse);
                                             }
                                        }
                                   } catch (parseError) {
                                        console.error('Failed to parse SSE data:', parseError);
                                   }
                              }
                         }
                    }
               } catch (error) {
                    const err = error instanceof Error ? error : new Error('Unknown error');

                    setState({
                         isStreaming: false,
                         response: '',
                         error: err,
                    });

                    if (options.onError) {
                         options.onError(err);
                    }
               }
          },
          []
     );

     const stopStreaming = useCallback(() => {
          if (abortControllerRef.current) {
               abortControllerRef.current.abort();
               abortControllerRef.current = null;
          }

          setState((prev) => ({
               ...prev,
               isStreaming: false,
          }));
     }, []);

     // Cleanup on unmount
     useEffect(() => {
          return () => {
               if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
               }
          };
     }, []);

     return {
          ...state,
          startStreaming,
          stopStreaming,
     };
}

/**
 * Hook for Server-Sent Events
 */
export function useSSE(url: string | null) {
     const [data, setData] = useState<any>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isConnected, setIsConnected] = useState(false);
     const eventSourceRef = useRef<EventSource | null>(null);

     useEffect(() => {
          if (!url) return;

          const eventSource = new EventSource(url);
          eventSourceRef.current = eventSource;

          eventSource.onopen = () => {
               setIsConnected(true);
               setError(null);
          };

          eventSource.onmessage = (event) => {
               try {
                    const parsedData = JSON.parse(event.data);
                    setData(parsedData);
               } catch (err) {
                    console.error('Failed to parse SSE data:', err);
               }
          };

          eventSource.onerror = (err) => {
               setIsConnected(false);
               setError(new Error('SSE connection error'));
               eventSource.close();
          };

          return () => {
               eventSource.close();
               setIsConnected(false);
          };
     }, [url]);

     const disconnect = useCallback(() => {
          if (eventSourceRef.current) {
               eventSourceRef.current.close();
               eventSourceRef.current = null;
               setIsConnected(false);
          }
     }, []);

     return {
          data,
          error,
          isConnected,
          disconnect,
     };
}

/**
 * Hook for progress tracking with streaming
 */
export function useProgressStream() {
     const [progress, setProgress] = useState(0);
     const [message, setMessage] = useState('');
     const [isComplete, setIsComplete] = useState(false);
     const [error, setError] = useState<Error | null>(null);

     const startProgress = useCallback(async (url: string, body: any) => {
          setProgress(0);
          setMessage('');
          setIsComplete(false);
          setError(null);

          try {
               const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
               });

               if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
               }

               const reader = response.body?.getReader();
               if (!reader) {
                    throw new Error('Response body is not readable');
               }

               const decoder = new TextDecoder();

               while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                         break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                         if (line.startsWith('data: ')) {
                              try {
                                   const data = JSON.parse(line.slice(6));

                                   if (data.type === 'progress') {
                                        setProgress(data.progress);
                                        if (data.message) {
                                             setMessage(data.message);
                                        }
                                   } else if (data.type === 'complete') {
                                        setIsComplete(true);
                                        setProgress(100);
                                   } else if (data.type === 'error') {
                                        throw new Error(data.error);
                                   }
                              } catch (parseError) {
                                   console.error('Failed to parse progress data:', parseError);
                              }
                         }
                    }
               }
          } catch (err) {
               const error = err instanceof Error ? err : new Error('Unknown error');
               setError(error);
          }
     }, []);

     return {
          progress,
          message,
          isComplete,
          error,
          startProgress,
     };
}
