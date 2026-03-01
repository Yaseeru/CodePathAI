'use client';

import React from 'react';
import { Lesson, Project, LessonProgress } from '@/lib/types';
import LessonCard from './LessonCard';
import ProjectMilestone from './ProjectMilestone';

interface RoadmapViewProps {
     roadmap: {
          id: string;
          title: string;
          description: string;
     };
     lessons: Lesson[];
     projects: Project[];
     lessonProgress: LessonProgress[];
     currentLessonId: string | null;
     onLessonClick: (lessonId: string) => void;
}

type RoadmapItem =
     | { type: 'lesson'; data: Lesson; status: 'completed' | 'current' | 'locked' }
     | { type: 'project'; data: Project; status: 'completed' | 'current' | 'locked' };

export default function RoadmapView({
     roadmap,
     lessons,
     projects,
     lessonProgress,
     currentLessonId,
     onLessonClick,
}: RoadmapViewProps) {
     // Create a map of lesson progress for quick lookup
     const progressMap = new Map(
          lessonProgress.map((progress) => [progress.lessonId, progress])
     );

     // Determine lesson status
     const getLessonStatus = (lesson: Lesson): 'completed' | 'current' | 'locked' => {
          const progress = progressMap.get(lesson.id);

          if (progress?.status === 'completed') {
               return 'completed';
          }

          if (lesson.id === currentLessonId) {
               return 'current';
          }

          // Check if prerequisites are met
          const prerequisitesMet = lesson.prerequisites.every((prereqId) => {
               const prereqProgress = progressMap.get(prereqId);
               return prereqProgress?.status === 'completed';
          });

          // If no prerequisites or all met, lesson is unlocked
          if (lesson.prerequisites.length === 0 || prerequisitesMet) {
               return 'current';
          }

          return 'locked';
     };

     // Determine project status
     const getProjectStatus = (project: Project): 'completed' | 'current' | 'locked' => {
          // Check if unlock lesson is completed
          if (project.unlockAfterLesson) {
               const unlockProgress = progressMap.get(project.unlockAfterLesson);
               if (unlockProgress?.status !== 'completed') {
                    return 'locked';
               }
          }

          // For now, we'll consider projects as current if unlocked
          // In a full implementation, you'd check project_submissions table
          return 'current';
     };

     // Merge lessons and projects into a single ordered array
     const roadmapItems: RoadmapItem[] = [];

     // Add all lessons
     lessons.forEach((lesson) => {
          roadmapItems.push({
               type: 'lesson',
               data: lesson,
               status: getLessonStatus(lesson),
          });
     });

     // Add all projects
     projects.forEach((project) => {
          roadmapItems.push({
               type: 'project',
               data: project,
               status: getProjectStatus(project),
          });
     });

     // Sort by order_index
     roadmapItems.sort((a, b) => a.data.orderIndex - b.data.orderIndex);

     return (
          <div className="w-full max-w-4xl mx-auto p-6">
               {/* Roadmap Header */}
               <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                         {roadmap.title}
                    </h1>
                    <p className="text-gray-600">{roadmap.description}</p>
               </div>

               {/* Vertical Timeline */}
               <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

                    {/* Roadmap Items */}
                    <div className="space-y-6">
                         {roadmapItems.map((item, index) => (
                              <div key={`${item.type}-${item.data.id}`} className="relative">
                                   {item.type === 'lesson' ? (
                                        <LessonCard
                                             lesson={item.data as Lesson}
                                             status={item.status}
                                             onClick={() => {
                                                  if (item.status !== 'locked') {
                                                       onLessonClick(item.data.id);
                                                  }
                                             }}
                                        />
                                   ) : (
                                        <ProjectMilestone
                                             project={item.data as Project}
                                             status={item.status}
                                        />
                                   )}
                              </div>
                         ))}
                    </div>
               </div>
          </div>
     );
}
