/**
 * Claude API Service
 * Handles all interactions with the Claude AI API including chat, streaming, and context enrichment
 */

import { AIContext, Message } from '@/lib/types/ai';

interface ClaudeMessage {
     role: 'user' | 'assistant';
     content: string;
}

interface ClaudeRequest {
     model: string;
     messages: ClaudeMessage[];
     max_tokens: number;
     temperature: number;
     stream: boolean;
     system?: string;
}

interface ClaudeResponse {
     id: string;
     type: string;
     role: string;
     content: Array<{ type: string; text: string }>;
     model: string;
     stop_reason: string;
     usage: {
          input_tokens: number;
          output_tokens: number;
     };
}

interface ClaudeStreamEvent {
     type: string;
     index?: number;
     delta?: {
          type: string;
          text?: string;
     };
     content_block?: {
          type: string;
          text: string;
     };
     message?: ClaudeResponse;
}

export class ClaudeService {
     private readonly apiKey: string;
     private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
     private readonly model = 'claude-sonnet-4-20250514';
     private readonly maxRetries = 3;
     private readonly baseDelay = 1000; // 1 second

     constructor() {
          const apiKey = process.env.CLAUDE_API_KEY;
          if (!apiKey) {
               throw new Error('CLAUDE_API_KEY environment variable is not set');
          }
          this.apiKey = apiKey;
     }

     /**
      * Send a chat message with context enrichment and get a complete response
      */
     async chat(userMessage: string, context: AIContext): Promise<string> {
          const enrichedPrompt = this.buildEnrichedPrompt(userMessage, context);
          const messages = this.buildMessages(enrichedPrompt, context.conversationHistory);

          const response = await this.makeRequest({
               model: this.model,
               messages,
               max_tokens: 1024,
               temperature: 0.7,
               stream: false,
               system: this.buildSystemPrompt(context),
          });

          return response.content[0].text;
     }

     /**
      * Generate a roadmap with structured JSON response
      */
     async generateRoadmap(systemPrompt: string): Promise<unknown> {
          const response = await this.makeRequest({
               model: this.model,
               messages: [
                    {
                         role: 'user',
                         content: 'Generate the roadmap based on the requirements in the system prompt.',
                    },
               ],
               max_tokens: 4096,
               temperature: 0.7,
               stream: false,
               system: systemPrompt,
          });

          // Parse JSON from response
          const content = response.content[0].text;
          try {
               return JSON.parse(content);
          } catch (error) {
               throw new Error(`Failed to parse roadmap JSON: ${error}`);
          }
     }

     /**
      * Stream a chat response in real-time with context enrichment
      */
     async *streamChat(
          userMessage: string,
          context: AIContext
     ): AsyncGenerator<string, void, unknown> {
          const enrichedPrompt = this.buildEnrichedPrompt(userMessage, context);
          const messages = this.buildMessages(enrichedPrompt, context.conversationHistory);

          const response = await fetch(this.apiUrl, {
               method: 'POST',
               headers: this.getHeaders(),
               body: JSON.stringify({
                    model: this.model,
                    messages,
                    max_tokens: 1024,
                    temperature: 0.7,
                    stream: true,
                    system: this.buildSystemPrompt(context),
               }),
          });

          if (!response.ok) {
               throw await this.handleErrorResponse(response);
          }

          const reader = response.body?.getReader();
          if (!reader) {
               throw new Error('Response body is not readable');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          try {
               while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                         if (line.startsWith('data: ')) {
                              const data = line.slice(6);
                              if (data === '[DONE]') continue;

                              try {
                                   const event: ClaudeStreamEvent = JSON.parse(data);
                                   if (event.type === 'content_block_delta' && event.delta?.text) {
                                        yield event.delta.text;
                                   }
                              } catch (e) {
                                   // Skip invalid JSON
                                   continue;
                              }
                         }
                    }
               }
          } finally {
               reader.releaseLock();
          }
     }

     /**
      * Make a request to Claude API with retry logic and exponential backoff
      */
     private async makeRequest(
          request: ClaudeRequest,
          retryCount = 0
     ): Promise<ClaudeResponse> {
          try {
               const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(request),
               });

               if (!response.ok) {
                    const error = await this.handleErrorResponse(response);

                    // Retry on rate limits, timeouts, and service outages
                    if (
                         (response.status === 429 || response.status >= 500) &&
                         retryCount < this.maxRetries
                    ) {
                         const delay = this.calculateBackoff(retryCount);
                         await this.sleep(delay);
                         return this.makeRequest(request, retryCount + 1);
                    }

                    throw error;
               }

               return await response.json();
          } catch (error) {
               // Retry on network errors
               if (retryCount < this.maxRetries && this.isRetryableError(error)) {
                    const delay = this.calculateBackoff(retryCount);
                    await this.sleep(delay);
                    return this.makeRequest(request, retryCount + 1);
               }

               throw error;
          }
     }

     /**
      * Build enriched prompt with context
      */
     private buildEnrichedPrompt(userMessage: string, context: AIContext): string {
          let prompt = userMessage;

          // Add current lesson context if available
          if (context.currentLesson) {
               prompt = `[Current Lesson: ${context.currentLesson.title}]\n\n${prompt}`;
          }

          return prompt;
     }

     /**
      * Build system prompt with user context
      */
     private buildSystemPrompt(context: AIContext): string {
          const { userProfile, currentLesson, recentProgress, difficultyLevel } = context;

          return `You are an AI coding mentor for CodePath AI, a personalized learning platform. Your role is to:

1. Guide learners toward their specific goals (not generic programming knowledge)
2. Provide encouragement and maintain a supportive, patient tone
3. Explain concepts clearly with practical examples
4. Break down complex topics into digestible pieces
5. Ask clarifying questions when needed
6. Celebrate progress and milestones

Current learner context:
- Name: ${userProfile.name}
- Goal: ${userProfile.learningGoal || 'Not specified'}
- Experience: ${userProfile.experienceLevel || 'beginner'}
- Progress: ${recentProgress.length} lessons completed
- Difficulty Level: ${difficultyLevel}/5
${currentLesson ? `- Current lesson: ${currentLesson.title}` : ''}

Guidelines:
- Keep responses concise (2-3 paragraphs max unless explaining complex concepts)
- Use code examples when helpful
- Reference the learner's goal to maintain motivation
- Adapt difficulty based on their experience level
- If they're stuck, provide hints before solutions`;
     }

     /**
      * Build messages array from conversation history
      */
     private buildMessages(
          userMessage: string,
          conversationHistory: Message[]
     ): ClaudeMessage[] {
          const messages: ClaudeMessage[] = [];

          // Add recent conversation history (last 10 messages)
          const recentHistory = conversationHistory.slice(-10);
          for (const msg of recentHistory) {
               messages.push({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
               });
          }

          // Add current user message
          messages.push({
               role: 'user',
               content: userMessage,
          });

          return messages;
     }

     /**
      * Get request headers
      */
     private getHeaders(): Record<string, string> {
          return {
               'Content-Type': 'application/json',
               'x-api-key': this.apiKey,
               'anthropic-version': '2023-06-01',
          };
     }

     /**
      * Handle error responses from Claude API
      */
     private async handleErrorResponse(response: Response): Promise<Error> {
          let errorMessage = `Claude API error: ${response.status} ${response.statusText}`;

          try {
               const errorData = await response.json();
               if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
               }
          } catch {
               // Use default error message if JSON parsing fails
          }

          // Add specific error types
          if (response.status === 429) {
               return new Error(`Rate limit exceeded: ${errorMessage}`);
          } else if (response.status >= 500) {
               return new Error(`Service outage: ${errorMessage}`);
          } else if (response.status === 408 || response.status === 504) {
               return new Error(`Request timeout: ${errorMessage}`);
          }

          return new Error(errorMessage);
     }

     /**
      * Check if error is retryable
      */
     private isRetryableError(error: unknown): boolean {
          if (error instanceof TypeError && error.message.includes('fetch')) {
               return true; // Network errors
          }
          return false;
     }

     /**
      * Calculate exponential backoff delay
      */
     private calculateBackoff(retryCount: number): number {
          return this.baseDelay * Math.pow(2, retryCount);
     }

     /**
      * Sleep utility
      */
     private sleep(ms: number): Promise<void> {
          return new Promise((resolve) => setTimeout(resolve, ms));
     }
}

// Export singleton instance
export const claudeService = new ClaudeService();
