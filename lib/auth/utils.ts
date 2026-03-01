import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

// Re-export client-safe utilities for convenience
export { validatePasswordStrength } from './client-utils';

/**
 * Requires authentication for a page
 * Redirects to login if not authenticated
 * @returns User object if authenticated
 */
export async function requireAuth() {
     const supabase = createServerClient();

     const { data: { user }, error } = await supabase.auth.getUser();

     if (error || !user) {
          redirect('/login');
     }

     return user;
}

/**
 * Checks if user has completed onboarding
 * Redirects to onboarding if not completed
 * @param userId - User ID to check
 */
export async function requireOnboarding(userId: string) {
     const supabase = createServerClient();

     const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', userId)
          .single();

     if (error || !profile) {
          redirect('/login');
     }

     if (!profile.onboarding_completed) {
          redirect('/onboarding');
     }
}

/**
 * Gets the current user profile
 * @returns User profile or null if not found
 */
export async function getUserProfile(userId: string) {
     const supabase = createServerClient();

     const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

     if (error) {
          console.error('Error fetching user profile:', error);
          return null;
     }

     return profile;
}


