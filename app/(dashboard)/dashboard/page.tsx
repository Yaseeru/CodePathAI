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
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                    <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 lg:p-10 border border-gray-200">
                         {/* Responsive heading */}
                         <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                              Welcome back, {profile?.name || 'Learner'}!
                         </h1>

                         {profile?.learning_goal && (
                              <p className="text-base sm:text-lg text-gray-600 mb-8">
                                   Your goal: {profile.learning_goal}
                              </p>
                         )}

                         {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
                              <div className="bg-blue-50 rounded-xl p-6 lg:p-8 border border-blue-100 hover:shadow-md transition-all">
                                   <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3">
                                        Continue Learning
                                   </h3>
                                   <p className="text-blue-700 mb-6 leading-relaxed">
                                        Pick up where you left off
                                   </p>
                                   <Link
                                        href="/roadmap"
                                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all min-h-[44px] flex items-center justify-center font-medium shadow-sm hover:shadow"
                                   >
                                        View Roadmap
                                   </Link>
                              </div>

                              <div className="bg-green-50 rounded-xl p-6 lg:p-8 border border-green-100 hover:shadow-md transition-all">
                                   <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3">
                                        Your Progress
                                   </h3>
                                   <p className="text-green-700 mb-6 leading-relaxed">
                                        Track your learning journey
                                   </p>
                                   <Link
                                        href="/progress"
                                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all min-h-[44px] flex items-center justify-center font-medium shadow-sm hover:shadow"
                                   >
                                        View Progress
                                   </Link>
                              </div>

                              <div className="bg-purple-50 rounded-xl p-6 lg:p-8 border border-purple-100 hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
                                   <h3 className="text-lg sm:text-xl font-semibold text-purple-900 mb-3">
                                        AI Mentor
                                   </h3>
                                   <p className="text-purple-700 mb-6 leading-relaxed">
                                        Get help from your AI mentor
                                   </p>
                                   <Link
                                        href="/chat"
                                        className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all min-h-[44px] flex items-center justify-center font-medium shadow-sm hover:shadow"
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
