/**
 * PostHog Analytics Configuration
 * Handles product analytics and feature flags with privacy compliance
 */

import posthog from 'posthog-js';

let isInitialized = false;

export function initPostHog() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('PostHog API key not configured. Analytics is disabled.');
    return;
  }

  if (typeof window === 'undefined' || isInitialized) {
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
      }
    },
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    // Privacy-compliant settings
    respect_dnt: true, // Respect Do Not Track
    disable_session_recording: true, // No session recordings for privacy
    disable_surveys: false, // Allow NPS surveys
    persistence: 'localStorage', // Use localStorage for persistence
    sanitize_properties: (properties) => {
      // Remove any PII from properties
      const sanitized = { ...properties };
      const piiKeys = ['email', 'phone', 'address', 'ip', 'name'];
      piiKeys.forEach(key => {
        if (key in sanitized) {
          delete sanitized[key];
        }
      });
      return sanitized;
    },
  });

  isInitialized = true;
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  posthog.capture(eventName, properties);
}

export function trackPageView(path: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  posthog.capture('$pageview', { $current_url: path, ...properties });
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (!isInitialized) return;
  posthog.reset();
}

export function isFeatureEnabled(flagKey: string): boolean {
  if (!isInitialized) return false;
  return posthog.isFeatureEnabled(flagKey) || false;
}

/**
 * Analytics Event Types
 * Centralized event names for consistency
 */
export const AnalyticsEvents = {
  // User events
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Onboarding events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',

  // Lesson events
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  LESSON_PAUSED: 'lesson_paused',
  LESSON_RESUMED: 'lesson_resumed',

  // Code events
  CODE_EXECUTED: 'code_executed',
  CODE_SAVED: 'code_saved',
  CODE_ERROR: 'code_error',

  // Chat events
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_MESSAGE_RECEIVED: 'chat_message_received',

  // Project events
  PROJECT_STARTED: 'project_started',
  PROJECT_SUBMITTED: 'project_submitted',
  PROJECT_COMPLETED: 'project_completed',

  // Roadmap events
  ROADMAP_GENERATED: 'roadmap_generated',
  GOAL_PIVOTED: 'goal_pivoted',

  // Difficulty events
  DIFFICULTY_ADJUSTED: 'difficulty_adjusted',

  // NPS events
  NPS_SURVEY_SHOWN: 'nps_survey_shown',
  NPS_SURVEY_COMPLETED: 'nps_survey_completed',
  NPS_SURVEY_DISMISSED: 'nps_survey_dismissed',
} as const;

/**
 * Track user registration
 */
export function trackUserRegistration(userId: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.USER_REGISTERED, {
    user_id: userId,
    ...properties,
  });
}

/**
 * Track onboarding completion
 */
export function trackOnboardingCompleted(userId: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
    user_id: userId,
    ...properties,
  });
}

/**
 * Track lesson start
 */
export function trackLessonStarted(lessonId: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.LESSON_STARTED, {
    lesson_id: lessonId,
    ...properties,
  });
}

/**
 * Track lesson completion
 */
export function trackLessonCompleted(lessonId: string, completionTime: number, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.LESSON_COMPLETED, {
    lesson_id: lessonId,
    completion_time: completionTime,
    ...properties,
  });
}

/**
 * Track code execution
 */
export function trackCodeExecuted(language: string, success: boolean, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.CODE_EXECUTED, {
    language,
    success,
    ...properties,
  });
}

/**
 * Track chat message
 */
export function trackChatMessage(conversationId: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.CHAT_MESSAGE_SENT, {
    conversation_id: conversationId,
    ...properties,
  });
}

/**
 * Track project submission
 */
export function trackProjectSubmitted(projectId: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.PROJECT_SUBMITTED, {
    project_id: projectId,
    ...properties,
  });
}

/**
 * Track goal pivot
 */
export function trackGoalPivot(oldGoal: string, newGoal: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.GOAL_PIVOTED, {
    old_goal: oldGoal,
    new_goal: newGoal,
    ...properties,
  });
}

/**
 * Track NPS survey completion
 */
export function trackNPSSurvey(score: number, feedback?: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvents.NPS_SURVEY_COMPLETED, {
    score,
    feedback,
    ...properties,
  });
}
