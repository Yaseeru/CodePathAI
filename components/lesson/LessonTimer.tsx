'use client';

import { useState, useEffect, useRef } from 'react';

interface LessonTimerProps {
     startTime: Date;
     targetDuration: number; // in minutes
     onPause?: () => void;
     onResume?: () => void;
}

export default function LessonTimer({
     startTime,
     targetDuration,
     onPause,
     onResume,
}: LessonTimerProps) {
     const [elapsedTime, setElapsedTime] = useState(0);
     const [isPaused, setIsPaused] = useState(false);
     const intervalRef = useRef<NodeJS.Timeout | null>(null);
     const pausedTimeRef = useRef(0);
     const lastPauseTimeRef = useRef<number | null>(null);

     useEffect(() => {
          const updateTimer = () => {
               if (!isPaused) {
                    const now = Date.now();
                    const start = new Date(startTime).getTime();
                    const elapsed = Math.floor((now - start - pausedTimeRef.current) / 1000);
                    setElapsedTime(elapsed);
               }
          };

          // Update immediately
          updateTimer();

          // Then update every second
          intervalRef.current = setInterval(updateTimer, 1000);

          return () => {
               if (intervalRef.current) {
                    clearInterval(intervalRef.current);
               }
          };
     }, [startTime, isPaused]);

     const handlePauseResume = () => {
          if (isPaused) {
               // Resume
               if (lastPauseTimeRef.current) {
                    pausedTimeRef.current += Date.now() - lastPauseTimeRef.current;
                    lastPauseTimeRef.current = null;
               }
               setIsPaused(false);
               onResume?.();
          } else {
               // Pause
               lastPauseTimeRef.current = Date.now();
               setIsPaused(true);
               onPause?.();
          }
     };

     const formatTime = (seconds: number): string => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
     };

     const getProgressPercentage = (): number => {
          const targetSeconds = targetDuration * 60;
          return Math.min((elapsedTime / targetSeconds) * 100, 100);
     };

     const getColorClass = (): string => {
          const minutes = elapsedTime / 60;
          if (minutes < 15) return 'text-green-600';
          if (minutes < 20) return 'text-yellow-600';
          return 'text-red-600';
     };

     const getProgressBarColor = (): string => {
          const minutes = elapsedTime / 60;
          if (minutes < 15) return 'bg-green-500';
          if (minutes < 20) return 'bg-yellow-500';
          return 'bg-red-500';
     };

     return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
               <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                         <svg
                              className={`w-5 h-5 ${getColorClass()}`}
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
                         <span className="text-sm font-medium text-gray-700">
                              Session Time
                         </span>
                    </div>
                    <button
                         onClick={handlePauseResume}
                         className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                         {isPaused ? (
                              <span className="flex items-center gap-1">
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
                                   Resume
                              </span>
                         ) : (
                              <span className="flex items-center gap-1">
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
                                             d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                   </svg>
                                   Pause
                              </span>
                         )}
                    </button>
               </div>

               {/* Timer Display */}
               <div className={`text-3xl font-bold mb-3 ${getColorClass()}`}>
                    {formatTime(elapsedTime)}
               </div>

               {/* Progress Bar */}
               <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                         className={`absolute top-0 left-0 h-full ${getProgressBarColor()} transition-all duration-300`}
                         style={{ width: `${getProgressPercentage()}%` }}
                    />
               </div>

               {/* Target Time */}
               <div className="mt-2 text-xs text-gray-500">
                    Target: {targetDuration} minutes
               </div>

               {/* Paused Indicator */}
               {isPaused && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
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
                                   d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                         </svg>
                         Timer Paused
                    </div>
               )}
          </div>
     );
}
