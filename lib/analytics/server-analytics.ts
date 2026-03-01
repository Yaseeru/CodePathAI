/**
 * Server-Side Analytics
 * Tracks events to the database for analytics queries
 */

import { createServerClient } from '@/lib/supabase';

export interface AnalyticsEvent {
     user_id?: string;
     event_type: string;
     event_data?: Record<string, unknown>;
}

/**
 * Track an analytics event to the database
 */
export async function trackServerEvent(event: AnalyticsEvent): Promise<void> {
     try {
          const supabase = createServerClient();

          const { error } = await supabase
               .from('user_events')
               .insert({
                    user_id: event.user_id || null,
                    event_type: event.event_type,
                    event_data: event.event_data || {},
               });

          if (error) {
               console.error('Failed to track analytics event:', error);
          }
     } catch (error) {
          console.error('Error tracking analytics event:', error);
     }
}

/**
 * Analytics Event Types
 */
export const ServerAnalyticsEvents = {
     // User events
     USER_REGISTERED: 'user_registered',
     USER_LOGIN: 'user_login',

     // Onboarding events
     ONBOARDING_COMPLETED: 'onboarding_completed',

     // Lesson events
     LESSON_STARTED: 'lesson_started',
     LESSON_COMPLETED: 'lesson_completed',

     // Code events
     CODE_EXECUTED: 'code_executed',

     // Chat events
     CHAT_MESSAGE_SENT: 'chat_message_sent',

     // Project events
     PROJECT_SUBMITTED: 'project_submitted',

     // Roadmap events
     ROADMAP_GENERATED: 'roadmap_generated',
     GOAL_PIVOTED: 'goal_pivoted',
} as const;
