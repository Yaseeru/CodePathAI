import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

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

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with isValid and strength score (0-4)
 */
export function validatePasswordStrength(password: string): {
     isValid: boolean;
     strength: number;
     feedback: string[];
} {
     const feedback: string[] = [];
     let strength = 0;

     // Check length
     if (password.length < 8) {
          feedback.push('Password must be at least 8 characters');
          return { isValid: false, strength: 0, feedback };
     }

     // Check for lowercase
     if (/[a-z]/.test(password)) {
          strength++;
     } else {
          feedback.push('Add lowercase letters');
     }

     // Check for uppercase
     if (/[A-Z]/.test(password)) {
          strength++;
     } else {
          feedback.push('Add uppercase letters');
     }

     // Check for numbers
     if (/\d/.test(password)) {
          strength++;
     } else {
          feedback.push('Add numbers');
     }

     // Check for special characters
     if (/[^A-Za-z0-9]/.test(password)) {
          strength++;
     } else {
          feedback.push('Add special characters');
     }

     return {
          isValid: strength >= 3,
          strength,
          feedback: feedback.length > 0 ? feedback : ['Strong password'],
     };
}
