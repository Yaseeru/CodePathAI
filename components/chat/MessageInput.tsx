'use client';

/**
 * MessageInput Component
 * Multi-line text input with character counter and code detection
 */

import { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
     onSend: (message: string) => void;
     disabled: boolean;
}

const MAX_LENGTH = 2000;

export function MessageInput({ onSend, disabled }: MessageInputProps) {
     const [value, setValue] = useState('');
     const textareaRef = useRef<HTMLTextAreaElement>(null);

     const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
          // Send on Enter (without Shift)
          if (e.key === 'Enter' && !e.shiftKey) {
               e.preventDefault();
               handleSend();
          }
     };

     const handleSend = () => {
          if (!value.trim() || disabled) return;

          onSend(value.trim());
          setValue('');

          // Reset textarea height
          if (textareaRef.current) {
               textareaRef.current.style.height = 'auto';
          }
     };

     const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const newValue = e.target.value;

          // Enforce max length
          if (newValue.length <= MAX_LENGTH) {
               setValue(newValue);

               // Auto-resize textarea
               e.target.style.height = 'auto';
               e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
          }
     };

     const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
          const pastedText = e.clipboardData.getData('text');

          // Detect if pasted content looks like code
          const codePatterns = [
               /^(function|const|let|var|class|import|export)\s/m,
               /^(def|class|import|from)\s/m,
               /^<[a-z]+.*>/m,
               /[{}\[\]();]/,
          ];

          const looksLikeCode = codePatterns.some((pattern) => pattern.test(pastedText));

          if (looksLikeCode && pastedText.split('\n').length > 2) {
               // Format as code block
               e.preventDefault();
               const formattedCode = `\`\`\`\n${pastedText}\n\`\`\``;
               const newValue = value + formattedCode;

               if (newValue.length <= MAX_LENGTH) {
                    setValue(newValue);
               }
          }
     };

     const remainingChars = MAX_LENGTH - value.length;
     const isNearLimit = remainingChars < 100;

     return (
          <div className="space-y-2">
               <div className="relative">
                    <textarea
                         ref={textareaRef}
                         value={value}
                         onChange={handleChange}
                         onKeyDown={handleKeyDown}
                         onPaste={handlePaste}
                         disabled={disabled}
                         placeholder="Ask your AI mentor anything... (Shift+Enter for new line)"
                         className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                         rows={1}
                         style={{ minHeight: '52px', maxHeight: '200px' }}
                    />

                    {/* Send button */}
                    <button
                         onClick={handleSend}
                         disabled={disabled || !value.trim()}
                         className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                         aria-label="Send message"
                    >
                         <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                         >
                              <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   strokeWidth={2}
                                   d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                              />
                         </svg>
                    </button>
               </div>

               {/* Character counter */}
               <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                         Shift+Enter for new line, Enter to send
                    </span>
                    {isNearLimit && (
                         <span className={remainingChars < 0 ? 'text-red-600' : 'text-orange-600'}>
                              {remainingChars} characters remaining
                         </span>
                    )}
               </div>
          </div>
     );
}
