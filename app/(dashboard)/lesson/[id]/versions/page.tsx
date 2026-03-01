/**
 * Lesson Version History Page
 * Displays version history for a specific lesson
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import LessonVersionHistory from '@/components/lesson/LessonVersionHistory';

export const metadata: Metadata = {
     title: 'Lesson Version History | CodePath AI',
     description: 'View and manage lesson version history',
};

interface PageProps {
     params: {
          id: string;
     };
}

export default async function LessonVersionHistoryPage({ params }: PageProps) {
     const supabase = createClient();

     // Check authentication
     const { data: { user }, error: authError } = await supabase.auth.getUser();

     if (authError || !user) {
          redirect('/login');
     }

     // Fetch lesson details to display context
     const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('id, title, description, version')
          .eq('id', params.id)
          .single();

     if (lessonError || !lesson) {
          return (
               <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
                         <h1 className="text-xl font-semibold text-red-600 mb-2">Lesson Not Found</h1>
                         <p className="text-gray-600 mb-4">
                              The lesson you're looking for doesn't exist or you don't have permission to view it.
                         </p>
                         <a
                              href="/dashboard"
                              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                         >
                              Back to Dashboard
                         </a>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-gray-50">
               <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                         <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
                              <span>/</span>
                              <a href={`/lesson/${lesson.id}`} className="hover:text-blue-600">Lesson</a>
                              <span>/</span>
                              <span className="text-gray-900">Version History</span>
                         </div>

                         <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              {lesson.title}
                         </h1>

                         {lesson.description && (
                              <p className="text-gray-600">{lesson.description}</p>
                         )}

                         <div className="mt-4 flex items-center gap-4">
                              <span className="text-sm text-gray-500">
                                   Current Version: <span className="font-semibold text-gray-900">{lesson.version}</span>
                              </span>
                              <a
                                   href={`/lesson/${lesson.id}`}
                                   className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                   Back to Lesson
                              </a>
                         </div>
                    </div>

                    {/* Version History Component */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                         <LessonVersionHistory
                              lessonId={lesson.id}
                              onVersionRestore={() => {
                                   // Refresh the page after restore
                                   window.location.reload();
                              }}
                         />
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                         <h3 className="font-semibold text-blue-900 mb-2">About Version History</h3>
                         <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Each time lesson content is updated, the previous version is automatically saved</li>
                              <li>• You can view any previous version to see what changed</li>
                              <li>• Restoring a version creates a new version with the old content</li>
                              <li>• All version history is preserved and cannot be deleted</li>
                         </ul>
                    </div>
               </div>
          </div>
     );
}
