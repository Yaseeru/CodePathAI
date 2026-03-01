import { requireAuth } from '@/lib/auth/utils';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

/**
 * Onboarding page
 * Displays the multi-step onboarding flow for new users
 */
export default async function OnboardingPage() {
     // Ensure user is authenticated
     await requireAuth();

     return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
               <OnboardingFlow />
          </div>
     );
}
