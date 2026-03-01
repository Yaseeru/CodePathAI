# Re-engagement System

This directory contains the implementation of the re-engagement system for CodePath AI, which automatically sends reminder emails to inactive users.

## Overview

The re-engagement system identifies users who haven't logged in for 3+ days and sends them personalized reminder emails to encourage them to continue their learning journey.

## Components

### 1. Inactivity Detector (`inactivity-detector.ts`)

Identifies users who are eligible for re-engagement emails.

**Key Features:**
- Queries `daily_activity` table to find users inactive for 3+ days
- Filters out users who opted out of emails
- Enforces 3-day minimum between emails
- Returns user data needed for email personalization

**Usage:**
```typescript
import { inactivityDetector } from '@/lib/reengagement/inactivity-detector';

// Get all eligible users
const eligibleUsers = await inactivityDetector.getEligibleUsers();
```

### 2. Email Sender (`email-sender.ts`)

Handles sending re-engagement emails and tracking.

**Key Features:**
- Fetches user progress data for personalization
- Sends emails via Resend API
- Tracks sent emails in database
- Updates last email sent timestamp
- Handles email open and click tracking

**Usage:**
```typescript
import { reengagementEmailSender } from '@/lib/reengagement/email-sender';

// Send email to a single user
const result = await reengagementEmailSender.sendEmail(user);

// Send emails to multiple users
const results = await reengagementEmailSender.sendReengagementEmails(users);
```

## API Endpoints

### POST `/api/reengagement/send`

Triggers re-engagement email sending for all eligible users.

**Authorization:** Requires `CRON_SECRET` in Authorization header

**Response:**
```json
{
  "success": true,
  "message": "Sent 5 emails, 0 failed",
  "emailsSent": 5,
  "emailsFailed": 0,
  "results": [...]
}
```

### GET `/api/reengagement/send`

Returns list of eligible users without sending emails (for testing).

**Response:**
```json
{
  "success": true,
  "eligibleUsersCount": 5,
  "eligibleUsers": [...]
}
```

### POST `/api/webhooks/resend`

Webhook endpoint for Resend email events (opens, clicks).

**Events Handled:**
- `email.opened` - Tracks when user opens email
- `email.clicked` - Tracks when user clicks link in email
- `email.delivered` - Logs delivery confirmation
- `email.bounced` - Logs bounce events

## Database Schema

### Email Tracking Table

```sql
CREATE TABLE email_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  email_type VARCHAR(50), -- 'reengagement'
  email_id VARCHAR(255), -- Resend email ID
  sent_at TIMESTAMP,
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### User Profile Fields

```sql
ALTER TABLE user_profiles
ADD COLUMN reengagement_emails_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN last_reengagement_email_sent_at TIMESTAMP;
```

## Email Template

The email template includes:
- User's name and learning goal
- Current progress stats (lessons completed, streak)
- Next lesson title and direct link
- Motivational message
- Email preferences and unsubscribe links

## Scheduling

The re-engagement system should be triggered by a scheduled job (cron).

### Vercel Cron (Recommended)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/reengagement/send",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9 AM UTC.

### Manual Trigger

For testing or manual execution:
```bash
curl -X POST https://your-domain.com/api/reengagement/send \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Configuration

Required environment variables:

```bash
# Resend API
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@codepath.ai

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Cron Secret (for authorization)
CRON_SECRET=your-secret-key
```

## User Settings

Users can manage their email preferences at `/settings`:

- Toggle re-engagement emails on/off
- View last email sent date
- Preferences are saved to `user_profiles.reengagement_emails_enabled`

## Testing

### Test Inactivity Detection

```typescript
import { inactivityDetector } from '@/lib/reengagement/inactivity-detector';

const inactiveUsers = await inactivityDetector.findInactiveUsers();
console.log(`Found ${inactiveUsers.length} inactive users`);

const eligibleUsers = await inactivityDetector.getEligibleUsers();
console.log(`${eligibleUsers.length} eligible for emails`);
```

### Test Email Sending

```bash
# Get eligible users (without sending)
curl https://your-domain.com/api/reengagement/send

# Send emails
curl -X POST https://your-domain.com/api/reengagement/send \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

Track re-engagement email performance:

```sql
-- Email send rate
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as emails_sent
FROM email_tracking
WHERE email_type = 'reengagement'
GROUP BY DATE(sent_at)
ORDER BY date DESC;

-- Open and click rates
SELECT 
  COUNT(*) as total_sent,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opened,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  ROUND(100.0 * SUM(CASE WHEN opened THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM email_tracking
WHERE email_type = 'reengagement';
```

## Requirements Validation

This implementation satisfies the following requirements:

- **12.1**: Sends email when user inactive for 3+ days
- **12.2**: Personalizes content with user's goal and progress
- **12.3**: Includes direct link to next lesson
- **12.4**: Enforces 3-day minimum between emails
- **12.5**: Provides opt-out preferences
- **12.6**: Tracks email opens and clicks
