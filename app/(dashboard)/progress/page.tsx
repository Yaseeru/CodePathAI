import { requireAuth, requireOnboarding } from '@/lib/auth/utils';
import { createServerClient } from '@/lib/supabase';
import ProgressDashboard from '@/components/progress/ProgressDashboard';

/**
 * Progress page
 * Displays the user's learning progress dashboard
 */
export default async function ProgressPage() {
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
          <ProgressDashboard
               learningGoal={profile?.learning_goal || 'Not set'}
               userName={profile?.name || 'Learner'}
          />
     );
}
