/**
 * PostHog Analytics Configuration
 * Handles product analytics and feature flags
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
