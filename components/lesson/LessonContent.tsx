'use client';

import { marked } from 'marked';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LessonSection {
     type: 'text' | 'code' | 'image' | 'video';
     content: string;
     language?: string;
     alt?: string; // Alt text for images
}

interface Exercise {
     id: string;
     prompt: string;
     starterCode?: string;
     solution?: string;
     hints: string[];
}

interface LessonContentData {
     sections: LessonSection[];
     learningObjectives: string[];
     exercises: Exercise[];
}

interface Lesson {
     id: string;
     title: string;
     description: string;
     content: LessonContentData;
     language: string;
     starterCode: string | null;
}

interface LessonContentProps {
     lesson: Lesson;
}

export default function LessonContent({ lesson }: LessonContentProps) {
     const [renderedSections, setRenderedSections] = useState<string[]>([]);

     useEffect(() => {
          // Render markdown for text sections
          const renderSections = async () => {
               const rendered = await Promise.all(
                    lesson.content.sections.map(async (section) => {
                         if (section.type === 'text') {
                              return await marked(section.content);
                         }
                         return section.content;
                    })
               );
               setRenderedSections(rendered);
          };

          renderSections();
     }, [lesson.content.sections]);

     return (
          <div className="h-full overflow-y-auto bg-white">
               <div className="max-w-4xl mx-auto p-6">
                    {/* Lesson Header */}
                    <div className="mb-8">
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              {lesson.title}
                         </h1>
                         <p className="text-lg text-gray-600">{lesson.description}</p>
                    </div>

                    {/* Learning Objectives */}
                    {lesson.content.learningObjectives.length > 0 && (
                         <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                   Learning Objectives
                              </h2>
                              <ul className="space-y-2">
                                   {lesson.content.learningObjectives.map((objective, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                             <svg
                                                  className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                             >
                                                  <path
                                                       strokeLinecap="round"
                                                       strokeLinejoin="round"
                                                       strokeWidth={2}
                                                       d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                  />
                                             </svg>
                                             <span className="text-gray-700">{objective}</span>
                                        </li>
                                   ))}
                              </ul>
                         </div>
                    )}

                    {/* Lesson Content Sections */}
                    <div className="space-y-6 mb-8">
                         {lesson.content.sections.map((section, index) => (
                              <div key={index}>
                                   {section.type === 'text' && (
                                        <div
                                             className="prose prose-lg max-w-none"
                                             dangerouslySetInnerHTML={{
                                                  __html: renderedSections[index] || '',
                                             }}
                                        />
                                   )}

                                   {section.type === 'code' && (
                                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                                             <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400">
                                                  {section.language || lesson.language}
                                             </div>
                                             <pre className="p-4 overflow-x-auto">
                                                  <code className="text-sm text-gray-100">
                                                       {section.content}
                                                  </code>
                                             </pre>
                                        </div>
                                   )}

                                   {section.type === 'image' && (
                                        <div className="relative w-full h-96 rounded-lg overflow-hidden">
                                             <Image
                                                  src={section.content}
                                                  alt={section.alt || `Illustration for ${lesson.title}`}
                                                  fill
                                                  className="object-contain"
                                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                             />
                                        </div>
                                   )}

                                   {section.type === 'video' && (
                                        <div className="aspect-video rounded-lg overflow-hidden">
                                             <iframe
                                                  src={section.content}
                                                  className="w-full h-full"
                                                  allowFullScreen
                                                  title="Lesson video"
                                             />
                                        </div>
                                   )}
                              </div>
                         ))}
                    </div>

                    {/* Exercises */}
                    {lesson.content.exercises.length > 0 && (
                         <div className="space-y-6">
                              <h2 className="text-2xl font-bold text-gray-900">Exercises</h2>
                              {lesson.content.exercises.map((exercise, index) => (
                                   <div
                                        key={exercise.id}
                                        className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                                   >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                             Exercise {index + 1}
                                        </h3>
                                        <p className="text-gray-700 mb-4">{exercise.prompt}</p>

                                        {exercise.starterCode && (
                                             <div className="mb-4">
                                                  <div className="text-sm font-medium text-gray-700 mb-2">
                                                       Starter Code:
                                                  </div>
                                                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                                                       <pre className="p-4 overflow-x-auto">
                                                            <code className="text-sm text-gray-100">
                                                                 {exercise.starterCode}
                                                            </code>
                                                       </pre>
                                                  </div>
                                             </div>
                                        )}

                                        {exercise.hints.length > 0 && (
                                             <details className="mt-4">
                                                  <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                                                       Show Hints ({exercise.hints.length})
                                                  </summary>
                                                  <ul className="mt-2 space-y-2 pl-4">
                                                       {exercise.hints.map((hint, hintIndex) => (
                                                            <li
                                                                 key={hintIndex}
                                                                 className="text-sm text-gray-600 list-disc"
                                                            >
                                                                 {hint}
                                                            </li>
                                                       ))}
                                                  </ul>
                                             </details>
                                        )}
                                   </div>
                              ))}
                         </div>
                    )}
               </div>
          </div>
     );
}
