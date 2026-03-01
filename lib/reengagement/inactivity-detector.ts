/**
 * Inactivity Detection Service
 * Identifies users who have been inactive for 3+ days and are eligible for re-engagement emails
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export interface InactiveUser {
     userId: string;
     name: string;
     email: string;
     learningGoal: string;
     lastActivityDate: string;
     daysSinceActivity: number;
     lastEmailSentAt: string | null;
}

export class InactivityDetector {
     private supabase;

     constructor() {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseUrl || !supabaseKey) {
               throw new Error('Supabase credentials not configured');
          }

          this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
     }

     /**
      * Find users who have been inactive for 3+ days
      * Filters out users who opted out of emails
      */
     async findInactiveUsers(): Promise<InactiveUser[]> {
          try {
               // Calculate the date 3 days ago
               const threeDaysAgo = new Date();
               threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
               const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

               // Query for inactive users
               const { data: inactiveUsers, error } = await this.supabase
                    .from('user_progress')
                    .select(`
                         user_id,
                         last_activity_date,
                         user_profiles!inner (
                              name,
                              email,
                              learning_goal,
                              reengagement_emails_enabled,
                              last_reengagement_email_sent_at
                         )
                    `)
                    .lt('last_activity_date', threeDaysAgoStr)
                    .not('last_activity_date', 'is', null);

               if (error) {
                    console.error('Error fetching inactive users:', error);
                    return [];
               }

               if (!inactiveUsers || inactiveUsers.length === 0) {
                    return [];
               }

               // Filter and transform results
               const eligibleUsers: InactiveUser[] = [];

               for (const user of inactiveUsers) {
                    const profile = Array.isArray(user.user_profiles)
                         ? user.user_profiles[0]
                         : user.user_profiles;

                    // Skip if user opted out of emails
                    if (!profile?.reengagement_emails_enabled) {
                         continue;
                    }

                    // Skip if user has no learning goal (incomplete onboarding)
                    if (!profile?.learning_goal) {
                         continue;
                    }

                    // Calculate days since last activity
                    const lastActivityDate = new Date(user.last_activity_date || '');
                    const today = new Date();
                    const daysSinceActivity = Math.floor(
                         (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    eligibleUsers.push({
                         userId: user.user_id,
                         name: profile.name,
                         email: profile.email,
                         learningGoal: profile.learning_goal,
                         lastActivityDate: user.last_activity_date || '',
                         daysSinceActivity,
                         lastEmailSentAt: profile.last_reengagement_email_sent_at || null,
                    });
               }

               return eligibleUsers;
          } catch (error) {
               console.error('Error in findInactiveUsers:', error);
               return [];
          }
     }

     /**
      * Check if a user is eligible to receive a re-engagement email
      * Enforces 3-day minimum between emails
      */
     canSendEmail(user: InactiveUser): boolean {
          // If no email has been sent before, user is eligible
          if (!user.lastEmailSentAt) {
               return true;
          }

          // Check if at least 3 days have passed since last email
          const lastEmailDate = new Date(user.lastEmailSentAt);
          const now = new Date();
          const daysSinceLastEmail = Math.floor(
               (now.getTime() - lastEmailDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return daysSinceLastEmail >= 3;
     }

     /**
      * Get users eligible for re-engagement emails
      * Combines inactivity check with email frequency enforcement
      */
     async getEligibleUsers(): Promise<InactiveUser[]> {
          const inactiveUsers = await this.findInactiveUsers();
          return inactiveUsers.filter((user) => this.canSendEmail(user));
     }
}

// Export singleton instance
export const inactivityDetector = new InactivityDetector();
