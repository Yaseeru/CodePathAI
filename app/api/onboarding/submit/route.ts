import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUser } from '@/lib/supabase';
import { z } from 'zod';
import { trackServerEvent, ServerAnalyticsEvents } from '@/lib/analytics/server-analytics';

// Validation schema for onboarding submission
const onboardingSchema = z.object({
     learningGoal: z.string()
          .min(20, 'Learning goal must be at least 20 characters')
          .max(500, 'Learning goal must not exceed 500 characters'),
     timeCommitment: z.number()
          .int('Time commitment must be a whole number')
          .min(1, 'Time commitment must be at least 1 hour per week')
          .max(168, 'Time commitment cannot exceed 168 hours per week'),
     experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
          errorMap: () => ({ message: 'Experience level must be beginner, intermediate, or advanced' }),
     }),
});

export async function POST(request: NextRequest) {
     try {
          // Get authenticated user
          const user = await getUser();
          if (!user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          const body = await request.json();

          // Validate input
          const validationResult = onboardingSchema.safeParse(body);
          if (!validationResult.success) {
               return NextResponse.json(
                    { error: validationResult.error.errors[0].message },
                    { status: 400 }
               );
          }

          const { learningGoal, timeCommitment, experienceLevel } = validationResult.data;
          const supabase = createServerClient();

          // Update user profile with onboarding data
          const { error: updateError } = await supabase
               .from('user_profiles')
               .update({
                    learning_goal: learningGoal,
                    time_commitment: timeCommitment,
                    experience_level: experienceLevel,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
               } as any)
               .eq('id', user.id as any);

          if (updateError) {
               console.error('Onboarding update error:', updateError);
               return NextResponse.json(
                    { error: 'Failed to save onboarding data' },
                    { status: 500 }
               );
          }

          // Fetch updated profile
          const { data: profile, error: fetchError } = await supabase
               .from('user_profiles')
               .select('id, name, email, learning_goal, time_commitment, experience_level, onboarding_completed')
               .eq('id', user.id as any)
               .single();

          if (fetchError || !profile) {
               console.error('Profile fetch error:', fetchError);
               return NextResponse.json(
                    { error: 'Failed to retrieve updated profile' },
                    { status: 500 }
               );
          }

          // Type assertion after null check
          const profileData = profile as {
               id: string;
               name: string;
               email: string;
               learning_goal: string | null;
               time_commitment: number | null;
               experience_level: string | null;
               onboarding_completed: boolean;
          };

          // Track onboarding completion event
          await trackServerEvent({
               user_id: user.id,
               event_type: ServerAnalyticsEvents.ONBOARDING_COMPLETED,
               event_data: {
                    learning_goal: learningGoal,
                    time_commitment: timeCommitment,
                    experience_level: experienceLevel,
                    completion_date: new Date().toISOString(),
               },
          });

          return NextResponse.json(
               {
                    success: true,
                    profile: {
                         id: profileData.id,
                         name: profileData.name,
                         email: profileData.email,
                         learningGoal: profileData.learning_goal,
                         timeCommitment: profileData.time_commitment,
                         experienceLevel: profileData.experience_level,
                         onboardingCompleted: profileData.onboarding_completed,
                    },
               },
               { status: 200 }
          );
     } catch (error) {
          console.error('Unexpected onboarding error:', error);
          return NextResponse.json(
               { error: 'An unexpected error occurred' },
               { status: 500 }
          );
     }
}
