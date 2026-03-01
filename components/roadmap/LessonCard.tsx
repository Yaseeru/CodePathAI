'use client';

import React from 'react';
import { Lesson } from '@/lib/types';
import { CheckCircle, Circle, Lock, Clock, BarChart3 } from 'lucide-react';

interface LessonCardProps {
     lesson: Lesson;
     status: 'completed' | 'current' | 'locked';
     onClick: () => void;
}

export default function LessonCard({ lesson, status, onClick }: LessonCardProps) {
     // Determine styling based on status
     const getStatusStyles = () => {
          switch (status) {
               case 'completed':
                    return {
                         container: 'bg-green-50 border-green-200 cursor-pointer hover:bg-green-100',
                         icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                         title: 'text-gray-900',
                         description: 'text-gray-600',
                    };
               case 'current':
                    return {
                         container: 'bg-blue-50 border-blue-300 cursor-pointer hover:bg-blue-100 ring-2 ring-blue-400',
                         icon: <Circle className="w-6 h-6 text-blue-600" />,
                         title: 'text-gray-900 font-semibold',
                         description: 'text-gray-700',
                    };
               case 'locked':
                    return {
                         container: 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60',
                         icon: <Lock className="w-6 h-6 text-gray-400" />,
                         title: 'text-gray-500',
                         description: 'text-gray-400',
                    };
          }
     };

     const styles = getStatusStyles();

     // Format duration (minutes to readable format)
     const formatDuration = (minutes: number): string => {
          if (minutes < 60) {
               return `${minutes} min`;
          }
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
     };

     // Get difficulty label
     const getDifficultyLabel = (level: number): string => {
          if (level <= 2) return 'Beginner';
          if (level <= 4) return 'Intermediate';
          return 'Advanced';
     };

     const getDifficultyColor = (level: number): string => {
          if (level <= 2) return 'text-green-600 bg-green-100';
          if (level <= 4) return 'text-yellow-600 bg-yellow-100';
          return 'text-red-600 bg-red-100';
     };

     return (
          <div
               className={`relative ml-16 p-4 border-2 rounded-lg transition-all ${styles.container}`}
               onClick={onClick}
               role="button"
               tabIndex={status === 'locked' ? -1 : 0}
               onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         onClick();
                    }
               }}
          >
               {/* Status Icon (positioned on the timeline) */}
               <div className="absolute -left-[52px] top-1/2 -translate-y-1/2 bg-white rounded-full p-1">
                    {styles.icon}
               </div>

               {/* Lesson Content */}
               <div className="space-y-2">
                    {/* Title */}
                    <h3 className={`text-lg font-medium ${styles.title}`}>
                         {lesson.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm ${styles.description} line-clamp-2`}>
                         {lesson.description}
                    </p>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 text-sm">
                         {/* Duration */}
                         <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(lesson.estimatedDuration)}</span>
                         </div>

                         {/* Difficulty */}
                         <div className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4 text-gray-600" />
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficultyLevel)}`}>
                                   {getDifficultyLabel(lesson.difficultyLevel)}
                              </span>
                         </div>

                         {/* Language */}
                         <div className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                              {lesson.language}
                         </div>
                    </div>

                    {/* Prerequisites Indicator */}
                    {lesson.prerequisites.length > 0 && status === 'locked' && (
                         <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                              <Lock className="w-3 h-3" />
                              <span>Complete {lesson.prerequisites.length} prerequisite{lesson.prerequisites.length > 1 ? 's' : ''} to unlock</span>
                         </div>
                    )}
               </div>
          </div>
     );
}
