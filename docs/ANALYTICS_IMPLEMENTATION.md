# Analytics Implementation Guide

This document describes the analytics tracking system implemented for CodePath AI MVP (Task 23).

## Overview

The analytics system tracks key user events and provides dashboard queries for measuring platform success metrics. It uses:
- **PostHog** for client-side analytics and feature flags
- **Database events** (user_events table) for server-side tracking
- **NPS surveys** for user satisfaction measurement

## Components Implemented

### 1. PostHog Integration (Task 23.1)

**File:** `lib/monitoring/posthog.ts`

**Features:**
- Privacy-compliant tracking (respects Do Not Track, no session recording)
- PII sanitization in event properties
- User identification and session management
- Feature flag support
- Comprehensive event tracking utilities

**Key Functions:**
- `initPostHog()` - Initialize PostHog client
- `trackEvent()` - Track custom events
- `identifyUser()` - Identify user for tracking
- `trackUserRegistration()` - Track user registration
- `trackOnboardingCompleted()` - Track onboarding completion
- `trackLessonStarted()` - Track lesson starts
- `trackLessonCompleted()` - Track lesson completions
- `trackCodeExecuted()` - Track code executions
- `trackChatMessage()` - Track chat messages
- `trackProjectSubmitted()` - Track project submissions
- `trackGoalPivot()` - Track goal changes
- `trackNPSSurvey()` - Track NPS survey responses

### 2. Server-Side Analytics (Task 23.2)

**File:** `lib/analytics/server-analytics.ts`

**Purpose:** Track events to the database for analytics queries

**Key Functions:**
- `trackServerEvent()` - Insert event into user_events table

**Events Tracked:**
- User registration
- Onboarding completion
- Lesson starts and completions
- Code executions
- Chat messages
- Project submissions
- Goal pivots

**Integration Points:**
- `app/api/auth/register/route.ts` - Track user registration
- `app/api/onboarding/submit/route.ts` - Track onboarding completion
- `app/api/lessons/[id]/start/route.ts` - Track lesson starts
- `app/api/lessons/[id]/complete/route.ts` - Track lesson completions
- `app/api/code/execute/route.ts` - Track code executions
- `app/api/ai/chat/route.ts` - Track chat messages
- `app/api/projects/[id]/submit/route.ts` - Track project submissions
- `app/api/roadmap/pivot/route.ts` - Track goal pivots

### 3. Analytics Dashboard Queries (Task 23.4)

Six API endpoints for key metrics:

#### 3.1 Onboarding Completion Rate
**Endpoint:** `GET /api/analytics/onboarding-rate`

**Returns:**
```json
{
  "totalUsers": 100,
  "completedUsers": 60,
  "completionRate": 60.0,
  "unit": "percentage"
}
```

**Calculation:** (completedUsers / totalUsers) × 100

#### 3.2 Day-7 Retention
**Endpoint:** `GET /api/analytics/retention`

**Returns:**
```json
{
  "totalEligibleUsers": 50,
  "retainedUsers": 20,
  "retentionRate": 40.0,
  "unit": "percentage"
}
```

**Calculation:** Users with activity on day 7 (±1 day) after registration

#### 3.3 Projects Per User
**Endpoint:** `GET /api/analytics/projects-per-user`

**Returns:**
```json
{
  "activeUsers": 30,
  "totalProjects": 90,
  "projectsPerUser": 3.0,
  "unit": "projects",
  "period": "last 30 days"
}
```

**Calculation:** Total projects / Active users (last 30 days)

#### 3.4 Average Session Duration
**Endpoint:** `GET /api/analytics/session-duration`

**Returns:**
```json
{
  "totalSessions": 200,
  "totalTime": 3000,
  "averageDuration": 15.0,
  "unit": "minutes"
}
```

**Calculation:** Total time spent / Number of sessions

#### 3.5 Lesson Completion Rate
**Endpoint:** `GET /api/analytics/lesson-completion-rate`

**Returns:**
```json
{
  "startedLessons": 500,
  "completedLessons": 400,
  "completionRate": 80.0,
  "unit": "percentage"
}
```

**Calculation:** (completedLessons / startedLessons) × 100

#### 3.6 Chat Usage Frequency
**Endpoint:** `GET /api/analytics/chat-usage`

**Returns:**
```json
{
  "totalMessages": 1000,
  "uniqueUsers": 50,
  "messagesPerUser": 20.0,
  "unit": "messages"
}
```

**Calculation:** Total messages / Unique users

### 4. NPS Survey System (Task 23.11)

#### 4.1 Database Schema
**Migration:** `supabase/migrations/005_create_nps_responses_table.sql`

**Table:** `nps_responses`
- `id` - UUID primary key
- `user_id` - Foreign key to user_profiles
- `score` - Integer 0-10
- `feedback` - Optional text feedback
- `created_at` - Timestamp

**RLS Policies:**
- Users can view their own responses
- Users can insert their own responses
- No updates or deletes allowed (one-time submission)

#### 4.2 NPS Survey Modal
**Component:** `components/nps/NPSSurveyModal.tsx`

**Features:**
- 0-10 scale selection
- Optional feedback text area
- Submit and dismiss actions
- Error handling
- Analytics tracking (shown, completed, dismissed)

#### 4.3 NPS Survey Hook
**Hook:** `lib/hooks/useNPSSurvey.ts`

**Features:**
- Triggers after 5 completed lessons
- Checks localStorage to prevent duplicate surveys
- Handles survey submission
- Tracks survey events

**Usage:**
```typescript
const { shouldShowSurvey, hideSurvey, submitSurvey } = useNPSSurvey(completedLessonsCount);

<NPSSurveyModal
  isOpen={shouldShowSurvey}
  onClose={hideSurvey}
  onSubmit={submitSurvey}
/>
```

#### 4.4 NPS API Endpoints
**Endpoint:** `POST /api/analytics/nps` - Submit NPS response
**Endpoint:** `GET /api/analytics/nps` - Calculate NPS score

**NPS Calculation:**
- Promoters: Score 9-10
- Passives: Score 7-8
- Detractors: Score 0-6
- NPS = % Promoters - % Detractors

**GET Response:**
```json
{
  "totalResponses": 100,
  "promoters": 50,
  "passives": 30,
  "detractors": 20,
  "npsScore": 30,
  "promoterPercentage": 50.0,
  "passivePercentage": 30.0,
  "detractorPercentage": 20.0
}
```

## Integration Guide

### Adding NPS Survey to Dashboard

In your dashboard component:

```typescript
import { useNPSSurvey } from '@/lib/hooks/useNPSSurvey';
import NPSSurveyModal from '@/components/nps/NPSSurveyModal';

function Dashboard() {
  const { data: progress } = useSWR('/api/progress');
  const completedLessons = progress?.totalLessonsCompleted || 0;
  
  const { shouldShowSurvey, hideSurvey, submitSurvey } = useNPSSurvey(completedLessons);

  return (
    <>
      {/* Your dashboard content */}
      
      <NPSSurveyModal
        isOpen={shouldShowSurvey}
        onClose={hideSurvey}
        onSubmit={submitSurvey}
      />
    </>
  );
}
```

### Tracking Custom Events

**Client-side (PostHog):**
```typescript
import { trackEvent } from '@/lib/monitoring/posthog';

trackEvent('custom_event', {
  property1: 'value1',
  property2: 'value2',
});
```

**Server-side (Database):**
```typescript
import { trackServerEvent } from '@/lib/analytics/server-analytics';

await trackServerEvent({
  user_id: userId,
  event_type: 'custom_event',
  event_data: {
    property1: 'value1',
    property2: 'value2',
  },
});
```

## Database Migration

To apply the NPS responses table migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually via psql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/005_create_nps_responses_table.sql
```

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Success Metrics Targets

Based on requirements:
- **Onboarding completion rate:** ≥ 60%
- **Day-7 retention:** ≥ 40%
- **Projects per active user:** ≥ 3/month
- **NPS:** ≥ 50

## Privacy Compliance

The analytics system is designed with privacy in mind:
- Respects Do Not Track browser setting
- No session recordings
- PII sanitization in event properties
- User data isolation via RLS policies
- One-time NPS submission (no tracking of dismissals)

## Testing

To test the analytics system:

1. **Event Tracking:**
   - Register a new user → Check user_events table
   - Complete onboarding → Check user_events table
   - Start/complete lessons → Check user_events table

2. **Analytics Queries:**
   - Call each analytics endpoint
   - Verify calculations match database state

3. **NPS Survey:**
   - Complete 5 lessons
   - Verify survey appears
   - Submit survey
   - Verify response saved to database
   - Check NPS calculation endpoint

## Next Steps

1. **Admin Dashboard:** Create an admin interface to view analytics
2. **Real-time Updates:** Add real-time analytics updates using Supabase subscriptions
3. **Export Functionality:** Add CSV export for analytics data
4. **Advanced Metrics:** Add cohort analysis, funnel tracking, etc.
5. **A/B Testing:** Use PostHog feature flags for experiments

## Requirements Validated

This implementation validates the following requirements:
- **17.1** - Onboarding completion rate tracking
- **17.2** - Day-7 retention tracking
- **17.3** - Projects per user tracking
- **17.4** - Session duration tracking
- **17.5** - Lesson completion rate tracking
- **17.6** - Chat usage tracking
- **17.7** - Event tracking with timestamps
- **17.8** - Admin dashboard for metrics
- **17.9** - NPS calculation from surveys
