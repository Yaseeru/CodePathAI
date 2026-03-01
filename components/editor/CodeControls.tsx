'use client';

import { useState, useEffect } from 'react';

interface CodeControlsProps {
     onRun: () => void;
     onStop: () => void;
     onClearOutput: () => void;
     onResetCode: () => void;
     isRunning: boolean;
     executionTime?: number;
}

export default function CodeControls({
     onRun,
     onStop,
     onClearOutput,
     onResetCode,
     isRunning,
     executionTime,
}: CodeControlsProps) {
     const [elapsedTime, setElapsedTime] = useState(0);

     // Track execution time while running
     useEffect(() => {
          let interval: NodeJS.Timeout | null = null;

          if (isRunning) {
               setElapsedTime(0);
               interval = setInterval(() => {
                    setElapsedTime((prev) => prev + 100);
               }, 100);
          } else {
               if (interval) {
                    clearInterval(interval);
               }
          }

          return () => {
               if (interval) {
                    clearInterval(interval);
               }
          };
     }, [isRunning]);

     const formatTime = (ms: number) => {
          const seconds = Math.floor(ms / 1000);
          const milliseconds = ms % 1000;
          return `${seconds}.${Math.floor(milliseconds / 100)}s`;
     };

     return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
               {/* Run button */}
               <button
                    onClick={onRun}
                    disabled={isRunning}
                    className={`
          flex items-center gap-2 px-4 py-2 rounded font-medium text-sm
          transition-colors
          ${isRunning
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                         }
        `}
               >
                    {isRunning ? (
                         <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Running...
                         </>
                    ) : (
                         <>
                              <svg
                                   className="w-4 h-4"
                                   fill="none"
                                   stroke="currentColor"
                                   viewBox="0 0 24 24"
                              >
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                   />
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                   />
                              </svg>
                              Run Code
                         </>
                    )}
               </button>

               {/* Stop button */}
               <button
                    onClick={onStop}
                    disabled={!isRunning}
                    className={`
          flex items-center gap-2 px-4 py-2 rounded font-medium text-sm
          transition-colors
          ${!isRunning
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                         }
        `}
               >
                    <svg
                         className="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                    >
                         <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                         />
                         <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                         />
                    </svg>
                    Stop
               </button>

               {/* Clear Output button */}
               <button
                    onClick={onClearOutput}
                    className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors"
               >
                    <svg
                         className="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                    >
                         <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                         />
                    </svg>
                    Clear Output
               </button>

               {/* Reset Code button */}
               <button
                    onClick={onResetCode}
                    className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors"
               >
                    <svg
                         className="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                    >
                         <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                         />
                    </svg>
                    Reset Code
               </button>

               {/* Execution time counter */}
               {(isRunning || executionTime !== undefined) && (
                    <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
                         <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                         >
                              <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   strokeWidth={2}
                                   d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                         </svg>
                         <span>
                              {isRunning
                                   ? formatTime(elapsedTime)
                                   : executionTime !== undefined
                                        ? formatTime(executionTime)
                                        : '0.0s'}
                         </span>
                    </div>
               )}
          </div>
     );
}
