'use client';

/**
 * ChatInterface Component
 * Main chat container with message history, typing indicators, and context display
 */

import { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface Message {
     id: string;
     role: 'user' | 'assistant';
     content: string;
     createdAt: string;
}

interface ChatInterfaceProps {
     lessonId?: string;
     lessonTitle?: string;
     initialMessages?: Message[];
     conversationId?: string;
}

export function ChatInterface({
     lessonId,
     lessonTitle,
     initialMessages = [],
     conversationId: initialConversationId,
}: ChatInterfaceProps) {
     const [messages, setMessages] = useState<Message[]>(initialMessages);
     const [isLoading, setIsLoading] = useState(false);
     const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
     const [error, setError] = useState<string | null>(null);
     const messagesEndRef = useRef<HTMLDivElement>(null);

     // Auto-scroll to latest message
     useEffect(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
     }, [messages]);

     const handleSendMessage = async (content: string) => {
          if (!content.trim()) return;

          // Add user message to UI immediately
          const userMessage: Message = {
               id: `temp-${Date.now()}`,
               role: 'user',
               content,
               createdAt: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, userMessage]);
          setIsLoading(true);
          setError(null);

          try {
               // Send message to API
               const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         message: content,
                         lessonId,
                         conversationId,
                    }),
               });

               if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to send message');
               }

               // Handle streaming response
               const reader = response.body?.getReader();
               const decoder = new TextDecoder();
               let assistantMessage = '';
               let assistantMessageId = `temp-assistant-${Date.now()}`;

               if (reader) {
                    while (true) {
                         const { done, value } = await reader.read();
                         if (done) break;

                         const chunk = decoder.decode(value);
                         const lines = chunk.split('\n');

                         for (const line of lines) {
                              if (line.startsWith('data: ')) {
                                   try {
                                        const data = JSON.parse(line.slice(6));

                                        if (data.chunk) {
                                             assistantMessage += data.chunk;

                                             // Update assistant message in real-time
                                             setMessages((prev) => {
                                                  const existing = prev.find((m) => m.id === assistantMessageId);
                                                  if (existing) {
                                                       return prev.map((m) =>
                                                            m.id === assistantMessageId
                                                                 ? { ...m, content: assistantMessage }
                                                                 : m
                                                       );
                                                  } else {
                                                       return [
                                                            ...prev,
                                                            {
                                                                 id: assistantMessageId,
                                                                 role: 'assistant' as const,
                                                                 content: assistantMessage,
                                                                 createdAt: new Date().toISOString(),
                                                            },
                                                       ];
                                                  }
                                             });
                                        }

                                        if (data.done && data.conversationId) {
                                             setConversationId(data.conversationId);
                                        }

                                        if (data.error) {
                                             throw new Error(data.error);
                                        }
                                   } catch (e) {
                                        // Skip invalid JSON
                                        continue;
                                   }
                              }
                         }
                    }
               }
          } catch (err) {
               console.error('Chat error:', err);
               setError(err instanceof Error ? err.message : 'Failed to send message');

               // Remove the temporary user message on error
               setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          } finally {
               setIsLoading(false);
          }
     };

     const quickActions = [
          'Explain this concept',
          'Help me debug',
          'Show me an example',
          'What should I learn next?',
     ];

     return (
          <div className="flex flex-col h-full bg-white rounded-lg shadow-lg" role="region" aria-label="AI Mentor Chat">
               {/* Header with context badge */}
               <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900" id="chat-title">AI Mentor</h2>
                    {lessonTitle && (
                         <div className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full" role="status" aria-label={`Current lesson: ${lessonTitle}`}>
                              {lessonTitle}
                         </div>
                    )}
               </div>

               {/* Messages area */}
               <div
                    className="flex-1 overflow-y-auto p-4"
                    role="log"
                    aria-live="polite"
                    aria-atomic="false"
                    aria-labelledby="chat-title"
               >
                    {messages.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-full text-center">
                              <div className="mb-4">
                                   <svg
                                        className="w-16 h-16 text-gray-300 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                   >
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                        />
                                   </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                   Ask your AI mentor for help
                              </h3>
                              <p className="text-gray-500 mb-6 max-w-md">
                                   Get personalized guidance, explanations, and support as you learn.
                              </p>

                              {/* Quick action buttons */}
                              <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Quick action suggestions">
                                   {quickActions.map((action) => (
                                        <button
                                             key={action}
                                             onClick={() => handleSendMessage(action)}
                                             className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                             disabled={isLoading}
                                             aria-label={`Send message: ${action}`}
                                        >
                                             {action}
                                        </button>
                                   ))}
                              </div>
                         </div>
                    ) : (
                         <>
                              <MessageList messages={messages} isLoading={isLoading} />
                              <div ref={messagesEndRef} />
                         </>
                    )}
               </div>

               {/* Error display */}
               {error && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-200" role="alert" aria-live="assertive">
                         <p className="text-sm text-red-600">{error}</p>
                    </div>
               )}

               {/* Input area */}
               <div className="border-t border-gray-200 p-4" role="form" aria-label="Send message to AI mentor">
                    <MessageInput onSend={handleSendMessage} disabled={isLoading} />
               </div>
          </div>
     );
}
