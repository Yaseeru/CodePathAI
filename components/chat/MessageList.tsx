'use client';

/**
 * MessageList Component
 * Displays chat messages with user/AI differentiation, timestamps, and code highlighting
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Message {
     id: string;
     role: 'user' | 'assistant';
     content: string;
     createdAt: string;
}

interface MessageListProps {
     messages: Message[];
     isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
     const formatTimestamp = (timestamp: string) => {
          const date = new Date(timestamp);
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

          if (diffInSeconds < 60) {
               return 'Just now';
          } else if (diffInSeconds < 3600) {
               const minutes = Math.floor(diffInSeconds / 60);
               return `${minutes}m ago`;
          } else if (diffInSeconds < 86400) {
               const hours = Math.floor(diffInSeconds / 3600);
               return `${hours}h ago`;
          } else {
               return date.toLocaleDateString();
          }
     };

     const renderContent = (content: string, role: 'user' | 'assistant') => {
          if (role === 'user') {
               // User messages are plain text
               return <p className="whitespace-pre-wrap">{content}</p>;
          }

          // AI messages support markdown
          try {
               const html = marked.parse(content, {
                    breaks: true,
                    gfm: true,
               });
               const sanitized = DOMPurify.sanitize(html as string);

               return (
                    <div
                         className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
                         dangerouslySetInnerHTML={{ __html: sanitized }}
                    />
               );
          } catch (error) {
               console.error('Markdown parsing error:', error);
               return <p className="whitespace-pre-wrap">{content}</p>;
          }
     };

     return (
          <div className="space-y-4">
               {messages.map((message) => (
                    <div
                         key={message.id}
                         className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                         <div
                              className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                   }`}
                         >
                              {/* Message content */}
                              <div className={message.role === 'user' ? 'text-white' : 'text-gray-900'}>
                                   {renderContent(message.content, message.role)}
                              </div>

                              {/* Timestamp */}
                              <div
                                   className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                                        }`}
                              >
                                   {formatTimestamp(message.createdAt)}
                              </div>
                         </div>
                    </div>
               ))}

               {/* Typing indicator */}
               {isLoading && (
                    <div className="flex justify-start">
                         <div className="bg-gray-100 rounded-lg p-4">
                              <div className="flex space-x-2">
                                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                   <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '0.1s' }}
                                   />
                                   <div
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '0.2s' }}
                                   />
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
