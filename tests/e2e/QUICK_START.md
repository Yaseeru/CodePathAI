# E2E Tests Quick Start Guide

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLAUDE_API_KEY=your_claude_api_key
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run with interactive UI
```bash
npm run test:e2e:ui
```

### Run in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/e2e/journeys/registration-to-first-lesson.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "should complete full registration"
```

### Run in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

## Viewing Results

### View HTML report
```bash
npm run test:e2e:report
```

### View test results in terminal
Results are automatically displayed after test run

### View screenshots and videos
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`
- Traces: `test-results/traces/`

## Common Issues

### Tests failing due to timeout
- Increase timeout in test: `test.setTimeout(60000)`
- Check if dev server is running
- Verify API keys are correct

### Database connection errors
- Verify Supabase credentials
- Check service role key has admin permissions
- Ensure database is accessible

### Browser not found
- Run: `npx playwright install`
- Or install specific browser: `npx playwright install chromium`

## Test Structure

```
tests/e2e/
├── fixtures/          # Test fixtures and setup
├── setup/            # Database setup utilities
├── utils/            # Helper functions
├── journeys/         # Critical user journey tests
└── integration/      # Integration tests
```

## Writing New Tests

1. Import fixtures:
```typescript
import { test, expect } from '../fixtures/test-fixtures';
```

2. Use test user fixture:
```typescript
test('my test', async ({ page, testUser, authenticatedPage }) => {
  // Test code here
});
```

3. Use helper functions:
```typescript
import { login, executeCode, sendChatMessage } from '../utils/test-helpers';
```

4. Clean up is automatic - no need to manually delete test data

## Tips

- Use `page.pause()` to pause execution and inspect
- Use `--debug` flag to step through tests
- Use `--trace on` to record traces for debugging
- Check `playwright.config.ts` for configuration options
