'use client';

import { useRouter } from 'next/navigation';
import OnboardingFlow from './OnboardingFlow';

interface OnboardingData {
     goal: string;
     timeCommitment: number | null;
     experienceLevel: string | null;
}

export default function OnboardingFlowWrapper() {
     const router = useRouter();

     const handleComplete = async (data: OnboardingData) => {
          try {
               // Map the field names to match the API expectations
               const payload = {
                    learningGoal: data.goal,
                    timeCommitment: data.timeCommitment,
                    experienceLevel: data.experienceLevel,
               };

               const response = await fetch('/api/onboarding/submit', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
               });

               if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to submit onboarding');
               }

               // Redirect to dashboard after successful onboarding
               router.push('/dashboard');
          } catch (error) {
               console.error('Onboarding submission error:', error);
               throw error;
          }
     };

     return <OnboardingFlow onComplete={handleComplete} />;
}
