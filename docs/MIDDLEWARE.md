# Middleware Documentation

## Overview

The middleware implements onboarding-based routing to ensure users complete the onboarding flow before accessing protected routes.

## Route Categories

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/reset-password` - Password reset page

### Onboarding Route
- `/onboarding` - Onboarding flow (requires authentication)

### Protected Routes
All other routes require:
1. User authentication
2. Completed onboarding

## Routing Logic

### Unauthenticated Users
- Can access public routes
- Redirected to `/login` for protected routes
- Redirect URL is preserved in query parameter

### Authenticated Users (Onboarding Incomplete)
- Redirected to `/onboarding` from all routes except:
  - Public routes
  - `/onboarding` itself

### Authenticated Users (Onboarding Complete)
- Can access all protected routes
- Redirected to `/dashboard` if accessing:
  - Auth routes (`/login`, `/register`)
  - `/onboarding`

## Implementation Details

### Middleware Configuration

The middleware runs on all routes except:
- Static files (`_next/static`)
- Image optimization (`_next/image`)
- Favicon
- Public assets (images, SVGs, etc.)
- API routes (handled separately)

### Supabase Integration

The middleware uses `@supabase/ssr` to:
1. Read authentication cookies
2. Verify user session
3. Query user profile for onboarding status

### Cookie Management

Cookies are properly managed for:
- Session persistence
- Authentication state
- Secure transmission (HTTPS in production)

## Testing

To test the middleware:

1. **Unauthenticated access**:
   - Visit `/dashboard` → Should redirect to `/login?redirect=/dashboard`
   - Visit `/login` → Should show login page

2. **Authenticated, onboarding incomplete**:
   - Login → Should redirect to `/onboarding`
   - Try to access `/dashboard` → Should redirect to `/onboarding`

3. **Authenticated, onboarding complete**:
   - Login → Should redirect to `/dashboard`
   - Try to access `/onboarding` → Should redirect to `/dashboard`
   - Can access all protected routes

## Requirements Satisfied

- **Requirement 1.5**: Redirect users to appropriate page based on onboarding status
- **Requirement 2.6**: Redirect incomplete users to onboarding flow
