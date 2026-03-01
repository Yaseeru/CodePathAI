/**
 * AI Chat API Endpoint
 * Handles streaming chat responses with context enrichment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { claudeService } from '@/lib/ai/claude';
import { aiContextBuilder } from '@/lib/ai/context-builder';
import { promptTemplateService } from '@/lib/ai/prompt-templates';
import { z } from 'zod';
import { trackServerEvent, ServerAnalyticsEvents } from '@/lib/analytics/server-analytics';
import { checkRateLimit, getClientIdentifier, RateLimitConfigs } from '@/lib/rate-limit';

// Request validation schema
const chatRequestSchema = z.object({
     message: z.string().min(1).max(2000),
     lessonId: z.string().uuid().optional(),
     conversationId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
     try {
          // Get authenticated user
          const supabase = createServerClient();
          const {
               data: { user },
               error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Apply rate limiting
          const identifier = getClientIdentifier(req, user.id);
          const rateLimit = checkRateLimit(identifier, RateLimitConfigs.AI);

          if (!rateLimit.allowed) {
               const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
               return NextResponse.json(
                    { error: 'Too many requests. Please try again later.', retryAfter },
                    {
                         status: 429,
                         headers: {
                              'Retry-After': retryAfter.toString(),
                              'X-RateLimit-Limit': RateLimitConfigs.AI.maxRequests.toString(),
                              'X-RateLimit-Remaining': '0',
                              'X-RateLimit-Reset': rateLimit.resetTime.toString(),
                         }
                    }
               );
          }

          // Parse and validate request body
          const body = await req.json();
          const validation = chatRequestSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validation.error },
                    { status: 400 }
               );
          }

          const { message, lessonId, conversationId } = validation.data;

          // Build AI context
          const context = await aiContextBuilder.buildAIContext(user.id, {
               lessonId,
               conversationId,
          });

          // Get or create conversation
          let activeConversationId = conversationId;
          if (!activeConversationId) {
               const { data: newConversation, error: convError } = await supabase
                    .from('conversations')
                    .insert({
                         user_id: user.id,
                         lesson_id: lessonId || null,
                         title: message.substring(0, 50), // First 50 chars as title
                    })
                    .select()
                    .single();

               if (convError || !newConversation) {
                    throw new Error('Failed to create conversation');
               }

               activeConversationId = newConversation.id;
          }

          // Save user message to database
          const { error: userMessageError } = await supabase.from('messages').insert({
               conversation_id: activeConversationId,
               role: 'user',
               content: message,
               context_snapshot: context,
          });

          if (userMessageError) {
               throw new Error('Failed to save user message');
          }

          // Track chat message event
          await trackServerEvent({
               user_id: user.id,
               event_type: ServerAnalyticsEvents.CHAT_MESSAGE_SENT,
               event_data: {
                    conversation_id: activeConversationId,
                    lesson_id: lessonId,
                    message_length: message.length,
               },
          });

          // Create streaming response
          const encoder = new TextEncoder();
          let fullResponse = '';

          const stream = new ReadableStream({
               async start(controller) {
                    try {
                         // Stream response from Claude
                         for await (const chunk of claudeService.streamChat(message, context)) {
                              fullResponse += chunk;
                              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
                         }

                         // Send done signal
                         controller.enqueue(
                              encoder.encode(
                                   `data: ${JSON.stringify({ done: true, conversationId: activeConversationId })}\n\n`
                              )
                         );

                         // Save assistant message to database
                         await supabase.from('messages').insert({
                              conversation_id: activeConversationId,
                              role: 'assistant',
                              content: fullResponse,
                              context_snapshot: context,
                         });

                         controller.close();
                    } catch (error) {
                         console.error('Streaming error:', error);
                         controller.enqueue(
                              encoder.encode(
                                   `data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`
                              )
                         );
                         controller.close();
                    }
               },
          });

          return new Response(stream, {
               headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
               },
          });
     } catch (error) {
          console.error('Chat API error:', error);

          // Handle rate limit errors
          if (error instanceof Error && error.message.includes('Rate limit')) {
               return NextResponse.json(
                    { error: 'Too many requests. Please try again in a moment.' },
                    { status: 429 }
               );
          }

          // Handle service outage errors
          if (error instanceof Error && error.message.includes('Service outage')) {
               return NextResponse.json(
                    { error: 'AI service is temporarily unavailable. Please try again later.' },
                    { status: 503 }
               );
          }

          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}
