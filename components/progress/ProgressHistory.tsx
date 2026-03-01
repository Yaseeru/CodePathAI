'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RoadmapHistory {
     id: string;
     title: string;
     description: string;
     goal: string;
     status: 'active' | 'archived' | 'completed';
     created_at: string;
     updated_at: string;
     totalLessons: number;
     completedLessons: number;
     completionPercentage: number;
     totalProjects: number;
     completedProjects: number;
}

/**
 * ProgressHistory component
 * Displays archived roadmaps and timeline of goal changes
 */
export default function ProgressHistory() {
     const [roadmaps, setRoadmaps] = useState<RoadmapHistory[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null);

     useEffect(() => {
          fetchHistory();
     }, []);

     const fetchHistory = async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/roadmap/history');

               if (!response.ok) {
                    throw new Error('Failed to fetch history');
               }

               const data = await response.json();
               setRoadmaps(data.roadmaps);
          } catch (err) {
               console.error('Error fetching history:', err);
               setError('Failed to load your progress history');
          } finally {
               setLoading(false);
          }
     };

     const toggleExpand = (roadmapId: string) => {
          setExpandedRoadmap(expandedRoadmap === roadmapId ? null : roadmapId);
     };

     if (loading) {
          return (
               <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                         <p className="text-gray-600">Loading your history...</p>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                         <p className="text-red-600 mb-4">{error}</p>
                         <button
                              onClick={fetchHistory}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                         >
                              Retry
                         </button>
                    </div>
               </div>
          );
     }

     const activeRoadmaps = roadmaps.filter((r) => r.status === 'active');
     const archivedRoadmaps = roadmaps.filter((r) => r.status === 'archived');

     return (
          <div className="min-h-screen bg-gray-50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6">
                         <Link
                              href="/progress"
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
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
                                        d="M15 19l-7-7 7-7"
                                   />
                              </svg>
                              Back to Progress
                         </Link>
                         <h1 className="text-3xl font-bold text-gray-900">Your Learning Journey</h1>
                         <p className="text-gray-600 mt-2">
                              View your current and past learning goals
                         </p>
                    </div>

                    {/* Active Roadmap */}
                    {activeRoadmaps.length > 0 && (
                         <div className="mb-8">
                              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Goal</h2>
                              {activeRoadmaps.map((roadmap) => (
                                   <div
                                        key={roadmap.id}
                                        className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6"
                                   >
                                        <div className="flex items-start justify-between mb-4">
                                             <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-2">
                                                       <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                            Active
                                                       </span>
                                                       <span className="text-sm text-gray-500">
                                                            Started {new Date(roadmap.created_at).toLocaleDateString()}
                                                       </span>
                                                  </div>
                                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                       {roadmap.goal}
                                                  </h3>
                                                  <p className="text-gray-600">{roadmap.description}</p>
                                             </div>
                                        </div>

                                        {/* Progress Stats */}
                                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                             <div className="text-center">
                                                  <p className="text-2xl font-bold text-blue-600">
                                                       {roadmap.completionPercentage}%
                                                  </p>
                                                  <p className="text-sm text-gray-600">Complete</p>
                                             </div>
                                             <div className="text-center">
                                                  <p className="text-2xl font-bold text-gray-900">
                                                       {roadmap.completedLessons}/{roadmap.totalLessons}
                                                  </p>
                                                  <p className="text-sm text-gray-600">Lessons</p>
                                             </div>
                                             <div className="text-center">
                                                  <p className="text-2xl font-bold text-gray-900">
                                                       {roadmap.completedProjects}/{roadmap.totalProjects}
                                                  </p>
                                                  <p className="text-sm text-gray-600">Projects</p>
                                             </div>
                                        </div>

                                        <div className="mt-4">
                                             <Link
                                                  href="/roadmap"
                                                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                             >
                                                  Continue Learning
                                             </Link>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    )}

                    {/* Archived Roadmaps Timeline */}
                    {archivedRoadmaps.length > 0 && (
                         <div>
                              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                   Past Goals ({archivedRoadmaps.length})
                              </h2>
                              <div className="space-y-4">
                                   {archivedRoadmaps.map((roadmap, index) => (
                                        <div
                                             key={roadmap.id}
                                             className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                                        >
                                             <div className="flex items-start justify-between">
                                                  <div className="flex-1">
                                                       <div className="flex items-center gap-2 mb-2">
                                                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                                                 Archived
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                 {new Date(roadmap.created_at).toLocaleDateString()} -{' '}
                                                                 {new Date(roadmap.updated_at).toLocaleDateString()}
                                                            </span>
                                                       </div>
                                                       <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                            {roadmap.goal}
                                                       </h3>
                                                       {expandedRoadmap === roadmap.id && (
                                                            <p className="text-gray-600 mb-4">{roadmap.description}</p>
                                                       )}
                                                  </div>
                                                  <button
                                                       onClick={() => toggleExpand(roadmap.id)}
                                                       className="text-gray-400 hover:text-gray-600 ml-4"
                                                  >
                                                       <svg
                                                            className={`w-6 h-6 transform transition-transform ${expandedRoadmap === roadmap.id ? 'rotate-180' : ''
                                                                 }`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                       >
                                                            <path
                                                                 strokeLinecap="round"
                                                                 strokeLinejoin="round"
                                                                 strokeWidth={2}
                                                                 d="M19 9l-7 7-7-7"
                                                            />
                                                       </svg>
                                                  </button>
                                             </div>

                                             {/* Progress Stats */}
                                             <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                                  <div className="text-center">
                                                       <p className="text-2xl font-bold text-gray-900">
                                                            {roadmap.completionPercentage}%
                                                       </p>
                                                       <p className="text-sm text-gray-600">Complete</p>
                                                  </div>
                                                  <div className="text-center">
                                                       <p className="text-2xl font-bold text-gray-900">
                                                            {roadmap.completedLessons}/{roadmap.totalLessons}
                                                       </p>
                                                       <p className="text-sm text-gray-600">Lessons</p>
                                                  </div>
                                                  <div className="text-center">
                                                       <p className="text-2xl font-bold text-gray-900">
                                                            {roadmap.completedProjects}/{roadmap.totalProjects}
                                                       </p>
                                                       <p className="text-sm text-gray-600">Projects</p>
                                                  </div>
                                             </div>

                                             {/* Expanded Details */}
                                             {expandedRoadmap === roadmap.id && (
                                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                                       <div className="bg-gray-50 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                                 What You Accomplished
                                                            </h4>
                                                            <ul className="text-sm text-gray-700 space-y-1">
                                                                 <li>
                                                                      ✓ Completed {roadmap.completedLessons} out of{' '}
                                                                      {roadmap.totalLessons} lessons
                                                                 </li>
                                                                 <li>
                                                                      ✓ Built {roadmap.completedProjects} out of{' '}
                                                                      {roadmap.totalProjects} projects
                                                                 </li>
                                                                 <li>
                                                                      ✓ Achieved {roadmap.completionPercentage}% completion
                                                                 </li>
                                                            </ul>
                                                       </div>
                                                  </div>
                                             )}
                                        </div>
                                   ))}
                              </div>
                         </div>
                    )}

                    {/* Empty State */}
                    {archivedRoadmaps.length === 0 && activeRoadmaps.length === 0 && (
                         <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                              <svg
                                   className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                   fill="none"
                                   stroke="currentColor"
                                   viewBox="0 0 24 24"
                              >
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                   />
                              </svg>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning History Yet</h3>
                              <p className="text-gray-600 mb-4">
                                   Start your learning journey to see your progress here
                              </p>
                              <Link
                                   href="/onboarding"
                                   className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                   Get Started
                              </Link>
                         </div>
                    )}
               </div>
          </div>
     );
}
