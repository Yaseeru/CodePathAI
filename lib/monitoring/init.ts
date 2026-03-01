/**
 * Monitoring Initialization
 * Initialize all monitoring services (Sentry, PostHog)
 */

import { initSentry } from './sentry';
import { initPostHog } from './posthog';

/**
 * Initialize all monitoring services
 * Should be called once at app startup
 */
export function initMonitoring() {
     // Initialize Sentry for error tracking
     initSentry();

     // Initialize PostHog for analytics (client-side only)
     if (typeof window !== 'undefined') {
          initPostHog();
     }
}

// Export all monitoring utilities
export * from './sentry';
export * from './posthog';
export * from './logger';
