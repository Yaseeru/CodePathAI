/**
 * Re-engagement Email Sender
 * Handles sending re-engagement emails to inactive users with proper frequency enforcement
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';
import { resendEmailService, type ReengagementEmailData } from '@/lib/email/resend';
import type { InactiveUser } from './inactivity-detector';

export interface EmailSendResult {
     userId: string;
     success: boolean;
     emailId?: string;
     error?: string;
}

export class ReengagementEmailSender {
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
      * Get user's progress data for email personalization
      */
     private async getUserProgressData(userId: string): Promise<{
          lessonsCompleted: number;
          currentStreak: number;
          nextLessonId: string | null;
          nextLessonTitle: string | null;
     }> {
          try {
               // Get user progress
               const { data: progress, error: progressError } = await this.supabase
                    .from('user_progress')
                    .select('total_lessons_completed, current_streak, current_lesson_id')
                    .eq('user_id', userId)
                    .single();

               if (progressError || !progress) {
                    console.error('Error fetching user progress:', progressError);
                    return {
                         lessonsCompleted: 0,
                         currentStreak: 0,
                         nextLessonId: null,
                         nextLessonTitle: null,
                    };
               }

               // Get next lesson details
               let nextLessonTitle = null;
               if (progress.current_lesson_id) {
                    const { data: lesson, error: lessonError } = await this.supabase
                         .from('lessons')
                         .select('title')
                         .eq('id', progress.current_lesson_id)
                         .single();

                    if (!lessonError && lesson) {
                         nextLessonTitle = lesson.title;
                    }
               }

               return {
                    lessonsCompleted: progress.total_lessons_completed,
                    currentStreak: progress.current_streak,
                    nextLessonId: progress.current_lesson_id,
                    nextLessonTitle,
               };
          } catch (error) {
               console.error('Error in getUserProgressData:', error);
               return {
                    lessonsCompleted: 0,
                    currentStreak: 0,
                    nextLessonId: null,
                    nextLessonTitle: null,
               };
          }
     }

     /**
      * Send re-engagement email to a single user
      */
     async sendEmail(user: InactiveUser): Promise<EmailSendResult> {
          try {
               // Get user's progress data
               const progressData = await this.getUserProgressData(user.userId);

               // If no next lesson, skip sending email
               if (!progressData.nextLessonId || !progressData.nextLessonTitle) {
                    return {
                         userId: user.userId,
                         success: false,
                         error: 'No next lesson available',
                    };
               }

               // Build next lesson URL
               const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
               const nextLessonUrl = `${baseUrl}/lesson/${progressData.nextLessonId}`;

               // Prepare email data
               const emailData: ReengagementEmailData = {
                    to: user.email,
                    userName: user.name,
                    learningGoal: user.learningGoal,
                    lessonsCompleted: progressData.lessonsCompleted,
                    currentStreak: progressData.currentStreak,
                    nextLessonTitle: progressData.nextLessonTitle,
                    nextLessonUrl,
               };

               // Send email via Resend
               const result = await resendEmailService.sendReengagementEmail(emailData);

               if (!result.success) {
                    return {
                         userId: user.userId,
                         success: false,
                         error: 'Failed to send email via Resend',
                    };
               }

               // Track email in database
               await this.trackSentEmail(user.userId, result.id);

               // Update last email sent timestamp in user profile
               await this.updateLastEmailSentTimestamp(user.userId);

               return {
                    userId: user.userId,
                    success: true,
                    emailId: result.id,
               };
          } catch (error) {
               console.error(`Error sending email to user ${user.userId}:`, error);
               return {
                    userId: user.userId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
               };
          }
     }

     /**
      * Track sent email in database
      */
     private async trackSentEmail(userId: string, emailId: string): Promise<void> {
          try {
               const { error } = await this.supabase.from('email_tracking').insert({
                    user_id: userId,
                    email_type: 'reengagement',
                    email_id: emailId,
                    sent_at: new Date().toISOString(),
               });

               if (error) {
                    console.error('Error tracking email:', error);
               }
          } catch (error) {
               console.error('Error in trackSentEmail:', error);
          }
     }

     /**
      * Update last email sent timestamp in user profile
      */
     private async updateLastEmailSentTimestamp(userId: string): Promise<void> {
          try {
               const { error } = await this.supabase
                    .from('user_profiles')
                    .update({
                         last_reengagement_email_sent_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

               if (error) {
                    console.error('Error updating last email sent timestamp:', error);
               }
          } catch (error) {
               console.error('Error in updateLastEmailSentTimestamp:', error);
          }
     }

     /**
      * Send re-engagement emails to multiple users
      */
     async sendReengagementEmails(users: InactiveUser[]): Promise<EmailSendResult[]> {
          const results: EmailSendResult[] = [];

          for (const user of users) {
               const result = await this.sendEmail(user);
               results.push(result);

               // Add a small delay between emails to avoid rate limiting
               await new Promise((resolve) => setTimeout(resolve, 100));
          }

          return results;
     }

     /**
      * Update email tracking when email is opened
      */
     async trackEmailOpened(emailId: string): Promise<void> {
          try {
               const { error } = await this.supabase
                    .from('email_tracking')
                    .update({
                         opened: true,
                         opened_at: new Date().toISOString(),
                    })
                    .eq('email_id', emailId);

               if (error) {
                    console.error('Error tracking email open:', error);
               }
          } catch (error) {
               console.error('Error in trackEmailOpened:', error);
          }
     }

     /**
      * Update email tracking when email link is clicked
      */
     async trackEmailClicked(emailId: string): Promise<void> {
          try {
               const { error } = await this.supabase
                    .from('email_tracking')
                    .update({
                         clicked: true,
                         clicked_at: new Date().toISOString(),
                    })
                    .eq('email_id', emailId);

               if (error) {
                    console.error('Error tracking email click:', error);
               }
          } catch (error) {
               console.error('Error in trackEmailClicked:', error);
          }
     }
}

// Export singleton instance
export const reengagementEmailSender = new ReengagementEmailSender();
