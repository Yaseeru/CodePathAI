# E2E Tests for CodePath AI

This directory contains end-to-end tests using Playwright.

## Setup

1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`
3. Set up environment variables in `.env.local`

## Running Tests

- Run all tests: `npm run test:e2e`
- Run with UI: `npm run test:e2e:ui`
- Debug mode: `npm run test:e2e:debug`
- View report: `npm run test:e2e:report`

## Test Structure

- `fixtures/` - Test fixtures and setup utilities
- `setup/` - Database setup and teardown scripts
- `utils/` - Helper functions for tests
- `auth/` - Authentication flow tests
- `onboarding/` - Onboarding flow tests
- `lessons/` - Lesson-related tests
- `projects/` - Project submission tests
- `integration/` - Integration tests

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLAUDE_API_KEY`
