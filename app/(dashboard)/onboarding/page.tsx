import { requireAuth } from '@/lib/auth/utils';
import OnboardingFlowWrapper from '@/components/onboarding/OnboardingFlowWrapper';
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

/**
 * Onboarding page
 * Displays the multi-step onboarding flow for new users
 */
export default async function OnboardingPage() {
     // Ensure user is authenticated
     const user = await requireAuth();

     // Get user profile to check if onboarding is already completed
     const supabase = createServerClient();
     const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

     // If onboarding is already completed, redirect to dashboard
     if (profile?.onboarding_completed) {
          redirect('/dashboard');
     }

     return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
               <OnboardingFlowWrapper />
          </div>
     );
}
