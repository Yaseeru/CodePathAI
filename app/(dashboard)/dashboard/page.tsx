import { requireAuth, requireOnboarding } from '@/lib/auth/utils';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';

/**
 * Dashboard page
 * Main landing page for authenticated users who have completed onboarding
 * Fully responsive: mobile (375px+), tablet (768px+), desktop (1280px+)
 */
export default async function DashboardPage() {
     // Ensure user is authenticated and has completed onboarding
     const user = await requireAuth();
     await requireOnboarding(user.id);

     // Fetch user profile
     const supabase = createServerClient();
     const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, learning_goal')
          .eq('id', user.id)
          .single();

     return (
          <div className="min-h-screen bg-gray-50">
               {/* Responsive container with proper padding */}
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                         {/* Responsive heading */}
                         <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                              Welcome back, {profile?.name || 'Learner'}!
                         </h1>

                         {profile?.learning_goal && (
                              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                                   Your goal: {profile.learning_goal}
                              </p>
                         )}

                         {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                              <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                                   <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                                        Continue Learning
                                   </h3>
                                   <p className="text-blue-700 text-sm mb-4">
                                        Pick up where you left off
                                   </p>
                                   <Link
                                        href="/roadmap"
                                        className="inline-block bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors min-h-[44px] flex items-center justify-center text-sm sm:text-base"
                                   >
                                        View Roadmap
                                   </Link>
                              </div>

                              <div className="bg-green-50 rounded-lg p-4 sm:p-6">
                                   <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">
                                        Your Progress
                                   </h3>
                                   <p className="text-green-700 text-sm mb-4">
                                        Track your learning journey
                                   </p>
                                   <Link
                                        href="/progress"
                                        className="inline-block bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors min-h-[44px] flex items-center justify-center text-sm sm:text-base"
                                   >
                                        View Progress
                                   </Link>
                              </div>

                              <div className="bg-purple-50 rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                                   <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-2">
                                        AI Mentor
                                   </h3>
                                   <p className="text-purple-700 text-sm mb-4">
                                        Get help from your AI mentor
                                   </p>
                                   <Link
                                        href="/chat"
                                        className="inline-block bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors min-h-[44px] flex items-center justify-center text-sm sm:text-base"
                                   >
                                        Start Chat
                                   </Link>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
