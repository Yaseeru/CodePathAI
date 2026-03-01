/**
 * API Response Streaming Utilities
 * Helpers for streaming responses and Server-Sent Events
 */

/**
 * Create a Server-Sent Events stream
 */
export function createSSEStream<T>(
     generator: AsyncGenerator<T, void, unknown>,
     options: {
          onData?: (data: T) => any;
          onError?: (error: Error) => void;
          onComplete?: () => void;
     } = {}
): ReadableStream {
     const encoder = new TextEncoder();

     return new ReadableStream({
          async start(controller) {
               try {
                    for await (const data of generator) {
                         const processedData = options.onData ? options.onData(data) : data;
                         const message = `data: ${JSON.stringify(processedData)}\n\n`;
                         controller.enqueue(encoder.encode(message));
                    }

                    if (options.onComplete) {
                         options.onComplete();
                    }

                    // Send completion signal
                    controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
                    controller.close();
               } catch (error) {
                    console.error('SSE Stream error:', error);

                    if (options.onError && error instanceof Error) {
                         options.onError(error);
                    }

                    // Send error to client
                    const errorMessage = `data: ${JSON.stringify({
                         error: error instanceof Error ? error.message : 'Unknown error',
                    })}\n\n`;
                    controller.enqueue(encoder.encode(errorMessage));
                    controller.close();
               }
          },
     });
}

/**
 * Create a streaming response with proper headers
 */
export function createStreamingResponse(
     stream: ReadableStream,
     options: {
          headers?: Record<string, string>;
     } = {}
): Response {
     return new Response(stream, {
          headers: {
               'Content-Type': 'text/event-stream',
               'Cache-Control': 'no-cache, no-transform',
               Connection: 'keep-alive',
               'X-Accel-Buffering': 'no', // Disable nginx buffering
               ...options.headers,
          },
     });
}

/**
 * Stream JSON data in chunks
 */
export async function* streamJSON<T>(
     data: T[],
     chunkSize: number = 10
): AsyncGenerator<T[], void, unknown> {
     for (let i = 0; i < data.length; i += chunkSize) {
          yield data.slice(i, i + chunkSize);
          // Small delay to prevent overwhelming the client
          await new Promise((resolve) => setTimeout(resolve, 10));
     }
}

/**
 * Stream large text responses in chunks
 */
export async function* streamText(
     text: string,
     chunkSize: number = 100
): AsyncGenerator<string, void, unknown> {
     for (let i = 0; i < text.length; i += chunkSize) {
          yield text.slice(i, i + chunkSize);
          // Small delay for smooth streaming
          await new Promise((resolve) => setTimeout(resolve, 50));
     }
}

/**
 * Create a progress stream for long-running operations
 */
export class ProgressStream {
     private controller: ReadableStreamDefaultController | null = null;
     private encoder = new TextEncoder();

     createStream(): ReadableStream {
          return new ReadableStream({
               start: (controller) => {
                    this.controller = controller;
               },
          });
     }

     sendProgress(progress: number, message?: string) {
          if (!this.controller) return;

          const data = {
               type: 'progress',
               progress,
               message,
          };

          this.controller.enqueue(
               this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
     }

     sendData(data: any) {
          if (!this.controller) return;

          const message = {
               type: 'data',
               data,
          };

          this.controller.enqueue(
               this.encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
     }

     sendError(error: string) {
          if (!this.controller) return;

          const message = {
               type: 'error',
               error,
          };

          this.controller.enqueue(
               this.encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
     }

     complete() {
          if (!this.controller) return;

          this.controller.enqueue(
               this.encoder.encode('data: {"type": "complete"}\n\n')
          );
          this.controller.close();
     }
}

/**
 * Client-side SSE consumer
 */
export class SSEClient {
     private eventSource: EventSource | null = null;
     private handlers: Map<string, (data: any) => void> = new Map();

     connect(url: string) {
          this.eventSource = new EventSource(url);

          this.eventSource.onmessage = (event) => {
               try {
                    const data = JSON.parse(event.data);
                    const handler = this.handlers.get(data.type || 'message');
                    if (handler) {
                         handler(data);
                    }
               } catch (error) {
                    console.error('Failed to parse SSE message:', error);
               }
          };

          this.eventSource.onerror = (error) => {
               console.error('SSE connection error:', error);
               const errorHandler = this.handlers.get('error');
               if (errorHandler) {
                    errorHandler(error);
               }
          };
     }

     on(event: string, handler: (data: any) => void) {
          this.handlers.set(event, handler);
     }

     disconnect() {
          if (this.eventSource) {
               this.eventSource.close();
               this.eventSource = null;
          }
     }
}

/**
 * Stream large API responses with backpressure handling
 */
export async function* streamWithBackpressure<T>(
     items: T[],
     processItem: (item: T) => Promise<any>,
     options: {
          concurrency?: number;
          delayMs?: number;
     } = {}
): AsyncGenerator<any, void, unknown> {
     const { concurrency = 5, delayMs = 100 } = options;
     const queue: Promise<any>[] = [];

     for (const item of items) {
          // Add to queue
          const promise = processItem(item);
          queue.push(promise);

          // Process when queue reaches concurrency limit
          if (queue.length >= concurrency) {
               const result = await Promise.race(queue);
               yield result;

               // Remove completed promise
               const index = queue.findIndex((p) => p === promise);
               if (index !== -1) {
                    queue.splice(index, 1);
               }

               // Add delay to prevent overwhelming
               await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
     }

     // Process remaining items
     while (queue.length > 0) {
          const result = await Promise.race(queue);
          yield result;

          const index = queue.findIndex((p) => p === result);
          if (index !== -1) {
               queue.splice(index, 1);
          }
     }
}

/**
 * Create a heartbeat stream to keep connection alive
 */
export function createHeartbeatStream(intervalMs: number = 30000): ReadableStream {
     const encoder = new TextEncoder();

     return new ReadableStream({
          start(controller) {
               const interval = setInterval(() => {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
               }, intervalMs);

               // Cleanup on close
               return () => clearInterval(interval);
          },
     });
}
