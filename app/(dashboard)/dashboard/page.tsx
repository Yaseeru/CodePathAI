import { requireAuth, requireOnboarding } from '@/lib/auth/utils';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';

/**
 * Dashboard page
 * Main landing page for authenticated users who have completed onboarding
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
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              Welcome back, {profile?.name || 'Learner'}!
                         </h1>

                         {profile?.learning_goal && (
                              <p className="text-lg text-gray-600 mb-6">
                                   Your goal: {profile.learning_goal}
                              </p>
                         )}

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                              <div className="bg-blue-50 rounded-lg p-6">
                                   <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                        Continue Learning
                                   </h3>
                                   <p className="text-blue-700 text-sm mb-4">
                                        Pick up where you left off
                                   </p>
                                   <Link
                                        href="/roadmap"
                                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                   >
                                        View Roadmap
                                   </Link>
                              </div>

                              <div className="bg-green-50 rounded-lg p-6">
                                   <h3 className="text-lg font-semibold text-green-900 mb-2">
                                        Your Progress
                                   </h3>
                                   <p className="text-green-700 text-sm mb-4">
                                        Track your learning journey
                                   </p>
                                   <Link
                                        href="/progress"
                                        className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                   >
                                        View Progress
                                   </Link>
                              </div>

                              <div className="bg-purple-50 rounded-lg p-6">
                                   <h3 className="text-lg font-semibold text-purple-900 mb-2">
                                        AI Mentor
                                   </h3>
                                   <p className="text-purple-700 text-sm mb-4">
                                        Get help from your AI mentor
                                   </p>
                                   <Link
                                        href="/chat"
                                        className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
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
