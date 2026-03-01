# Error Handling Guide

This document provides comprehensive guidance on using the error handling system in CodePath AI.

## Overview

The error handling system consists of:

1. **Error Boundaries** - Catch React component errors
2. **API Error Handling** - Retry logic and graceful degradation
3. **Form Validation** - Zod schemas with inline error display
4. **Error Logging** - Sentry integration with context
5. **User Messages** - User-friendly error and success messages
6. **Toast Notifications** - Non-intrusive notifications

## Components

### 1. Error Boundary

The `ErrorBoundary` component catches errors in React components and displays a fallback UI.

**Usage:**

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

The error boundary is already wrapping the entire app in `app/layout.tsx`.

### 2. API Error Handling

#### Using `fetchWithRetry`

```typescript
import { fetchWithRetry } from '@/lib/api/fetchWithRetry';

const response = await fetchWithRetry('/api/lessons/123', {
  method: 'GET',
}, {
  maxRetries: 3,
  onRetry: (attempt, error) => {
    console.log(`Retry attempt ${attempt}:`, error.message);
  },
});
```

#### Using `useApiCall` Hook

```tsx
import { useApiCall } from '@/lib/hooks/useApiCall';

function MyComponent() {
  const { data, error, loading, execute, retry } = useApiCall({
    maxRetries: 3,
    onSuccess: () => console.log('Success!'),
  });

  const loadData = async () => {
    await execute('/api/data');
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage error={error} onRetry={retry} />;
  
  return <div>{/* Render data */}</div>;
}
```

#### API Route Error Responses

```typescript
import { errorResponse, successResponse } from '@/lib/api/apiResponse';

export async function GET(req: Request) {
  try {
    const data = await fetchData();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error, {
      feature: 'data-fetch',
      userId: user.id,
    });
  }
}
```

### 3. Form Validation

#### Using Validation Schemas

```typescript
import { loginSchema } from '@/lib/validation/schemas';

const result = loginSchema.safeParse({ email, password });

if (!result.success) {
  // Handle validation errors
  const errors = result.error.errors;
}
```

#### Using `useFormValidation` Hook

```tsx
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { loginSchema } from '@/lib/validation/schemas';

function LoginForm() {
  const { values, errors, setValue, handleSubmit, isSubmitting } = useFormValidation({
    schema: loginSchema,
    onSubmit: async (data) => {
      await login(data);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email"
        type="email"
        value={values.email || ''}
        onChange={(e) => setValue('email', e.target.value)}
        error={errors.email}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
```

#### Using `FormField` Component

```tsx
import { FormField } from '@/components/ui/FormField';

<FormField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
  helperText="We'll never share your email"
/>
```

### 4. Error Logging

#### Basic Error Logging

```typescript
import { logError } from '@/lib/monitoring/errorLogger';

try {
  await riskyOperation();
} catch (error) {
  logError(error as Error, {
    feature: 'risky-operation',
    userId: user.id,
    severity: 'high',
    extra: {
      operationId: '123',
    },
  });
  throw error;
}
```

#### Specialized Error Logging

```typescript
import {
  logApiError,
  logAuthError,
  logAiError,
  logDatabaseError,
} from '@/lib/monitoring/errorLogger';

// API errors
logApiError(error, '/api/lessons', 'GET', 500, userId);

// Auth errors
logAuthError(error, 'login', userId);

// AI service errors
logAiError(error, 'claude', 'chat', userId);

// Database errors
logDatabaseError(error, 'lessons', 'insert', userId);
```

#### Adding Breadcrumbs

```typescript
import { trackErrorBreadcrumb } from '@/lib/monitoring/errorLogger';

trackErrorBreadcrumb('User clicked submit button', 'user-action', {
  formName: 'login',
});
```

### 5. User Messages

#### Error Messages

```typescript
import { getErrorMessage } from '@/lib/messages/errorMessages';

const errorMsg = getErrorMessage('auth/invalid-credentials');
// {
//   title: 'Login Failed',
//   message: 'The email or password you entered is incorrect.',
//   action: 'Please check your credentials and try again.',
//   severity: 'error'
// }
```

#### Success Messages

```typescript
import { getSuccessMessage } from '@/lib/messages/successMessages';

const successMsg = getSuccessMessage('lesson/completed');
// {
//   title: 'Lesson Complete! 🎉',
//   message: 'Great job! You've completed this lesson.',
//   action: 'Continue to the next lesson.'
// }
```

### 6. Toast Notifications

#### Setup Toast Provider

Wrap your app with `ToastProvider`:

```tsx
import { ToastProvider } from '@/lib/hooks/useToast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

#### Using Toast Notifications

```tsx
import { useToast } from '@/lib/hooks/useToast';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSuccess = () => {
    showSuccess('Success!', 'Your changes have been saved.');
  };

  const handleError = () => {
    showError('Error', 'Something went wrong.', 'Try again');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

### 7. Loading States

#### Loading Spinner

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="md" />
```

#### Loading State

```tsx
import { LoadingState } from '@/components/ui/LoadingSpinner';

{loading && <LoadingState message="Loading lessons..." />}
```

#### Loading Overlay

```tsx
import { LoadingOverlay } from '@/components/ui/LoadingSpinner';

{loading && <LoadingOverlay message="Generating roadmap..." />}
```

#### Button with Loading

```tsx
import { ButtonWithLoading } from '@/components/ui/LoadingSpinner';

<ButtonWithLoading
  loading={isSubmitting}
  onClick={handleSubmit}
  className="px-4 py-2 bg-blue-600 text-white rounded"
>
  Submit
</ButtonWithLoading>
```

## Complete Example

Here's a complete example combining all error handling features:

```tsx
'use client';

import { useState } from 'react';
import { useApiCall } from '@/lib/hooks/useApiCall';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { useToast } from '@/lib/hooks/useToast';
import { FormField } from '@/components/ui/FormField';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { loginSchema } from '@/lib/validation/schemas';
import { logAuthError } from '@/lib/monitoring/errorLogger';

export default function LoginPage() {
  const { showSuccess, showError } = useToast();
  const { execute, loading, error, retry } = useApiCall();

  const { values, errors, setValue, handleSubmit, isSubmitting } = useFormValidation({
    schema: loginSchema,
    onSubmit: async (data) => {
      try {
        const result = await execute('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (result) {
          showSuccess('Welcome Back!', 'You've successfully logged in.');
          // Redirect to dashboard
        }
      } catch (err) {
        logAuthError(err as Error, 'login');
        showError('Login Failed', 'Please check your credentials and try again.');
      }
    },
  });

  if (loading) {
    return <LoadingState message="Logging in..." />;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Log In</h1>

      {error && <ErrorMessage error={error} onRetry={retry} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          name="email"
          value={values.email || ''}
          onChange={(e) => setValue('email', e.target.value)}
          error={errors.email}
          required
        />

        <FormField
          label="Password"
          type="password"
          name="password"
          value={values.password || ''}
          onChange={(e) => setValue('password', e.target.value)}
          error={errors.password}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
```

## Best Practices

1. **Always log errors** - Use the error logging utilities to track issues
2. **Provide context** - Include feature, userId, and relevant data in error logs
3. **User-friendly messages** - Never show technical error messages to users
4. **Retry logic** - Use `fetchWithRetry` for network requests
5. **Validate early** - Validate forms before submission
6. **Loading states** - Always show loading indicators for async operations
7. **Success feedback** - Confirm successful actions with toast notifications
8. **Graceful degradation** - Handle errors without breaking the entire app

## Error Severity Levels

- **Low**: Validation errors, user input issues
- **Medium**: API failures, code execution errors
- **High**: Authentication failures, AI service errors
- **Critical**: Database errors, system failures

## Testing Error Handling

Test error scenarios:

1. Network failures (offline mode)
2. API timeouts
3. Invalid form inputs
4. Authentication failures
5. Rate limiting
6. Server errors (500s)

Use the browser's Network tab to simulate these conditions.
