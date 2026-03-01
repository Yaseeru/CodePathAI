'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import StatsCard from './StatsCard';
import GoalPivotModal from './GoalPivotModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dynamic import for StreakCalendar (visualization component)
const StreakCalendar = dynamic(() => import('./StreakCalendar'), {
     loading: () => (
          <div className="h-40 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
     ),
});

interface ProgressData {
     completedLessons: number;
     totalLessons: number;
     completedProjects: number;
     totalProjects: number;
     roadmapCompletionPercentage: number;
     totalTime: {
          minutes: number;
          formatted: string;
          hours: number;
          minutesRemainder: number;
     };
     currentStreak: number;
     longestStreak: number;
     difficultyLevel: number;
     lastActivityDate: string | null;
     recentActivity: Array<{
          activity_date: string;
          lessons_completed: number;
          time_spent: number;
          messages_sent: number;
          code_executions: number;
     }>;
}

interface ProgressDashboardProps {
     learningGoal: string;
     userName: string;
}

/**
 * ProgressDashboard component
 * Main progress overview displaying all user metrics and achievements
 */
export default function ProgressDashboard({
     learningGoal,
     userName,
}: ProgressDashboardProps) {
     const [progressData, setProgressData] = useState<ProgressData | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [isGoalPivotModalOpen, setIsGoalPivotModalOpen] = useState(false);
     const router = useRouter();

     useEffect(() => {
          fetchProgressData();
     }, []);

     const fetchProgressData = async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/progress');

               if (!response.ok) {
                    throw new Error('Failed to fetch progress data');
               }

               const data = await response.json();
               setProgressData(data);
          } catch (err) {
               console.error('Error fetching progress:', err);
               setError('Failed to load progress data');
          } finally {
               setLoading(false);
          }
     };

     const handleGoalPivot = async (newGoal: string) => {
          const response = await fetch('/api/roadmap/pivot', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify({ newGoal }),
          });

          if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || 'Failed to change goal');
          }

          // Refresh the page to show new roadmap
          router.refresh();
     };

     if (loading) {
          return (
               <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                         <p className="text-gray-600">Loading your progress...</p>
                    </div>
               </div>
          );
     }

     if (error || !progressData) {
          return (
               <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                         <p className="text-red-600 mb-4">{error || 'Failed to load progress'}</p>
                         <button
                              onClick={fetchProgressData}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                         >
                              Retry
                         </button>
                    </div>
               </div>
          );
     }

     // Transform recent activity data for StreakCalendar
     const activityData = progressData.recentActivity.map((activity) => ({
          date: activity.activity_date,
          lessonsCompleted: activity.lessons_completed,
          timeSpent: activity.time_spent,
          messagesSent: activity.messages_sent,
          codeExecutions: activity.code_executions,
     }));

     return (
          <div className="min-h-screen bg-gray-50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              Your Learning Progress
                         </h1>
                         <div className="flex items-center justify-between">
                              <div>
                                   <p className="text-lg text-gray-600 mb-1">
                                        <span className="font-semibold">Goal:</span> {learningGoal}
                                   </p>
                                   <p className="text-sm text-gray-500">
                                        Keep up the great work, {userName}!
                                   </p>
                              </div>
                              <div className="flex gap-3">
                                   <Link
                                        href="/roadmap"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                   >
                                        Continue Learning
                                   </Link>
                                   <button
                                        onClick={() => setIsGoalPivotModalOpen(true)}
                                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
                                   >
                                        Change Goal
                                   </button>
                              </div>
                         </div>
                    </div>

                    {/* Roadmap Completion Progress Bar */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                         <div className="flex items-center justify-between mb-2">
                              <h2 className="text-xl font-semibold text-gray-900">
                                   Roadmap Progress
                              </h2>
                              <span className="text-2xl font-bold text-blue-600">
                                   {progressData.roadmapCompletionPercentage}%
                              </span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                              <div
                                   className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                                   style={{ width: `${progressData.roadmapCompletionPercentage}%` }}
                              ></div>
                         </div>
                         <p className="text-sm text-gray-600">
                              {progressData.completedLessons} of {progressData.totalLessons} lessons completed
                         </p>
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                         <StatsCard
                              title="Lessons Completed"
                              value={progressData.completedLessons}
                              icon={
                                   <svg
                                        className="w-6 h-6"
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
                              }
                              colorTheme="blue"
                         />

                         <StatsCard
                              title="Projects Completed"
                              value={progressData.completedProjects}
                              icon={
                                   <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                   >
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                   </svg>
                              }
                              colorTheme="green"
                         />

                         <StatsCard
                              title="Total Learning Time"
                              value={progressData.totalTime.formatted}
                              icon={
                                   <svg
                                        className="w-6 h-6"
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
                              }
                              colorTheme="purple"
                         />

                         <StatsCard
                              title="Current Streak"
                              value={`${progressData.currentStreak} days`}
                              icon={
                                   <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                   >
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                                        />
                                   </svg>
                              }
                              colorTheme="orange"
                         />
                    </div>

                    {/* Activity Calendar and Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* Streak Calendar */}
                         <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                   Activity Calendar
                              </h2>
                              <p className="text-sm text-gray-600 mb-4">
                                   Your learning activity over the last 90 days
                              </p>
                              <StreakCalendar activityData={activityData} />
                         </div>

                         {/* Recent Activity Feed */}
                         <div className="bg-white rounded-lg shadow-sm p-6">
                              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                   Recent Activity
                              </h2>
                              <div className="space-y-4">
                                   {progressData.recentActivity.length > 0 ? (
                                        progressData.recentActivity.slice(0, 7).map((activity) => (
                                             <div
                                                  key={activity.activity_date}
                                                  className="border-l-4 border-blue-500 pl-4 py-2"
                                             >
                                                  <p className="text-sm font-semibold text-gray-900">
                                                       {new Date(activity.activity_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                       })}
                                                  </p>
                                                  <p className="text-xs text-gray-600">
                                                       {activity.lessons_completed} lessons • {activity.time_spent} min
                                                  </p>
                                             </div>
                                        ))
                                   ) : (
                                        <p className="text-sm text-gray-500 italic">
                                             No recent activity. Start learning to see your progress here!
                                        </p>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                         <div className="flex items-center justify-between mb-4">
                              <h2 className="text-xl font-semibold text-gray-900">
                                   Additional Stats
                              </h2>
                              <Link
                                   href="/progress/history"
                                   className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                              >
                                   View History
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
                                             d="M9 5l7 7-7 7"
                                        />
                                   </svg>
                              </Link>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                   <p className="text-sm text-gray-600 mb-1">Longest Streak</p>
                                   <p className="text-2xl font-bold text-gray-900">
                                        {progressData.longestStreak} days
                                   </p>
                              </div>
                              <div>
                                   <p className="text-sm text-gray-600 mb-1">Difficulty Level</p>
                                   <p className="text-2xl font-bold text-gray-900">
                                        Level {progressData.difficultyLevel}
                                   </p>
                              </div>
                              <div>
                                   <p className="text-sm text-gray-600 mb-1">Last Activity</p>
                                   <p className="text-2xl font-bold text-gray-900">
                                        {progressData.lastActivityDate
                                             ? new Date(progressData.lastActivityDate).toLocaleDateString()
                                             : 'Never'}
                                   </p>
                              </div>
                         </div>
                    </div>

                    {/* Goal Pivot Modal */}
                    <GoalPivotModal
                         isOpen={isGoalPivotModalOpen}
                         onClose={() => setIsGoalPivotModalOpen(false)}
                         currentGoal={learningGoal}
                         currentProgress={{
                              completedLessons: progressData.completedLessons,
                              completedProjects: progressData.completedProjects,
                              totalTime: progressData.totalTime.formatted,
                         }}
                         onConfirm={handleGoalPivot}
                    />
               </div>
          </div>
     );
}
