import { requireAuth, requireOnboarding } from '@/lib/auth/utils';
import { createServerClient } from '@/lib/supabase';
import RoadmapClient from '@/components/roadmap/RoadmapClient';

export default async function RoadmapPage() {
     const user = await requireAuth();
     await requireOnboarding(user.id);

     const supabase = createServerClient();

     // Fetch user's active roadmap
     const { data: roadmaps } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

     const activeRoadmap = roadmaps?.[0] || null;

     // If no roadmap exists, show the generation UI
     if (!activeRoadmap) {
          return (
               <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center border border-gray-200">
                              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                   <span className="text-4xl">🗺️</span>
                              </div>
                              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                   Create Your Learning Roadmap
                              </h1>
                              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                   Let's build a personalized learning path based on your goals.
                                   Our AI will create a custom roadmap with lessons and projects tailored just for you.
                              </p>
                              <RoadmapClient hasRoadmap={false} />
                         </div>
                    </div>
               </div>
          );
     }

     // Fetch lessons for the roadmap
     const { data: lessons } = await supabase
          .from('lessons')
          .select('*')
          .eq('roadmap_id', activeRoadmap.id)
          .order('order_index', { ascending: true });

     // Fetch lesson progress
     const { data: progress } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id);

     return (
          <div className="min-h-screen bg-gray-50 py-8">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                         <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                              Your Learning Roadmap
                         </h1>
                         <p className="text-lg text-gray-600">
                              {activeRoadmap.description || activeRoadmap.goal}
                         </p>
                    </div>

                    <RoadmapClient
                         hasRoadmap={true}
                         roadmap={activeRoadmap}
                         lessons={lessons || []}
                         progress={progress || []}
                    />
               </div>
          </div>
     );
}
