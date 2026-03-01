'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Lesson {
     id: string;
     title: string;
     description: string;
     order_index: number;
     estimated_duration: number;
     difficulty_level: number;
}

interface Progress {
     lesson_id: string;
     status: string;
     completed_at: string | null;
}

interface RoadmapClientProps {
     hasRoadmap: boolean;
     roadmap?: any;
     lessons?: Lesson[];
     progress?: Progress[];
}

export default function RoadmapClient({ hasRoadmap, roadmap, lessons = [], progress = [] }: RoadmapClientProps) {
     const router = useRouter();
     const [generating, setGenerating] = useState(false);
     const [error, setError] = useState('');

     const handleGenerateRoadmap = async () => {
          setGenerating(true);
          setError('');

          try {
               const response = await fetch('/api/ai/generate-roadmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
               });

               if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to generate roadmap');
               }

               // Refresh the page to show the new roadmap
               router.refresh();
          } catch (err: any) {
               setError(err.message);
          } finally {
               setGenerating(false);
          }
     };

     if (!hasRoadmap) {
          return (
               <div>
                    {error && (
                         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                              {error}
                         </div>
                    )}
                    <button
                         onClick={handleGenerateRoadmap}
                         disabled={generating}
                         className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                         {generating ? 'Generating Your Roadmap...' : 'Generate My Roadmap'}
                    </button>
                    {generating && (
                         <p className="mt-4 text-sm text-gray-600">
                              This may take 30-60 seconds. Please wait...
                         </p>
                    )}
               </div>
          );
     }

     const progressMap = new Map(progress.map(p => [p.lesson_id, p]));

     return (
          <div className="space-y-6">
               {lessons.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                         <p className="text-gray-600">No lessons available yet. Your roadmap is being prepared.</p>
                    </div>
               ) : (
                    <div className="grid gap-6">
                         {lessons.map((lesson, index) => {
                              const lessonProgress = progressMap.get(lesson.id);
                              const isCompleted = lessonProgress?.status === 'completed';
                              const isInProgress = lessonProgress?.status === 'in_progress';

                              return (
                                   <div
                                        key={lesson.id}
                                        className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => router.push(`/lesson/${lesson.id}`)}
                                   >
                                        <div className="flex items-start gap-4">
                                             <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isCompleted ? 'bg-green-100 text-green-600' :
                                                       isInProgress ? 'bg-blue-100 text-blue-600' :
                                                            'bg-gray-100 text-gray-600'
                                                  }`}>
                                                  {isCompleted ? '✓' : index + 1}
                                             </div>
                                             <div className="flex-1">
                                                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                       {lesson.title}
                                                  </h3>
                                                  <p className="text-gray-600 mb-3 leading-relaxed">
                                                       {lesson.description}
                                                  </p>
                                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                                       <span>⏱️ {lesson.estimated_duration} min</span>
                                                       <span>📊 Level {lesson.difficulty_level}</span>
                                                       {isCompleted && (
                                                            <span className="text-green-600 font-medium">✓ Completed</span>
                                                       )}
                                                       {isInProgress && (
                                                            <span className="text-blue-600 font-medium">In Progress</span>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              );
                         })}
                    </div>
               )}
          </div>
     );
}
