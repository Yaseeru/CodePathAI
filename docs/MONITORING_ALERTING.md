# Monitoring and Alerting Setup

This document describes the monitoring and alerting infrastructure for CodePath AI production environment.

## Overview

CodePath AI uses multiple monitoring services:

1. **Sentry** - Error tracking and performance monitoring
2. **Vercel Analytics** - Web vitals and performance metrics
3. **PostHog** - Product analytics and user behavior
4. **Supabase** - Database performance monitoring
5. **Uptime Monitoring** - Service availability checks

## 1. Sentry Error Tracking

### Configuration

Sentry is already configured in the application via `@sentry/nextjs`.

**Configuration files:**
- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration

### Error Alerts

#### Critical Errors Alert

**Trigger**: Any error with level "error" or "fatal"

**Configuration:**
1. Go to Sentry > Alerts > Create Alert Rule
2. Select "Issues"
3. Configure:
   - **When**: An event is seen
   - **If**: level equals error OR level equals fatal
   - **Then**: Send notification to #critical-alerts Slack channel and email
   - **Action Interval**: Immediately

#### High Error Rate Alert

**Trigger**: More than 10 errors per minute

**Configuration:**
1. Go to Sentry > Alerts > Create Alert Rule
2. Select "Issues"
3. Configure:
   - **When**: An event is seen
   - **If**: The issue is seen more than 10 times in 1 minute
   - **Then**: Send notification to #alerts Slack channel
   - **Action Interval**: 5 minutes

#### New Issue Alert

**Trigger**: First occurrence of a new error

**Configuration:**
1. Go to Sentry > Alerts > Create Alert Rule
2. Select "Issues"
3. Configure:
   - **When**: An event is first seen
   - **Then**: Send notification to #new-issues Slack channel
   - **Action Interval**: Immediately

#### Regression Alert

**Trigger**: Previously resolved issue occurs again

**Configuration:**
1. Go to Sentry > Alerts > Create Alert Rule
2. Select "Issues"
3. Configure:
   - **When**: An issue changes state from resolved to unresolved
   - **Then**: Send notification to #regressions Slack channel and email
   - **Action Interval**: Immediately

### Performance Monitoring

#### Slow Transaction Alert

**Trigger**: P95 response time > 3 seconds

**Configuration:**
1. Go to Sentry > Alerts > Create Alert Rule
2. Select "Metric"
3. Configure:
   - **Metric**: Transaction Duration (p95)
   - **When**: Above 3000ms
   - **For**: 5 minutes
   - **Then**: Send notification to #performance Slack channel
   - **Action Interval**: 15 minutes

#### High Apdex Alert

**Trigger**: Apdex score < 0.8

**Configuration:**
1. Go to Sentry > Alerts > Create Alert Rule
2. Select "Metric"
3. Configure:
   - **Metric**: Apdex
   - **When**: Below 0.8
   - **For**: 10 minutes
   - **Then**: Send notification to #performance Slack channel
   - **Action Interval**: 30 minutes

### Custom Error Tracking

Add custom error tracking in critical paths:

```typescript
import * as Sentry from '@sentry/nextjs';

// Track AI API failures
try {
  const response = await callClaudeAPI(prompt);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'ai-chat',
      severity: 'high'
    },
    extra: {
      prompt: prompt.substring(0, 100), // First 100 chars
      userId: user.id
    }
  });
  throw error;
}

// Track code execution failures
try {
  const result = await executeCode(code, language);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'code-execution',
      language: language
    },
    extra: {
      codeLength: code.length,
      userId: user.id
    }
  });
  throw error;
}
```

## 2. Vercel Analytics

### Web Vitals Monitoring

Vercel automatically tracks Core Web Vitals:
- **LCP** (Largest Contentful Paint) - Target: < 2.5s
- **FID** (First Input Delay) - Target: < 100ms
- **CLS** (Cumulative Layout Shift) - Target: < 0.1
- **TTFB** (Time to First Byte) - Target: < 600ms

### Performance Alerts

Configure in Vercel Dashboard > Analytics > Insights:

1. **LCP Alert**: Notify when LCP > 3s for 10% of users
2. **FID Alert**: Notify when FID > 200ms for 5% of users
3. **CLS Alert**: Notify when CLS > 0.25 for 10% of users

### Real User Monitoring

Vercel tracks:
- Page load times
- API route performance
- Edge function performance
- Geographic distribution

## 3. PostHog Product Analytics

### Key Metrics Dashboards

#### User Engagement Dashboard

**Metrics:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- DAU/MAU ratio (stickiness)
- Session duration
- Sessions per user

#### Learning Progress Dashboard

**Metrics:**
- Onboarding completion rate
- Lessons completed per day
- Average lesson completion time
- Project completion rate
- AI chat usage frequency
- Code execution frequency

#### Retention Dashboard

**Metrics:**
- Day 1 retention
- Day 7 retention
- Day 30 retention
- Cohort retention curves
- Churn rate

### Custom Events

Track critical user actions:

```typescript
import { usePostHog } from 'posthog-js/react';

// Track lesson completion
posthog.capture('lesson_completed', {
  lesson_id: lessonId,
  completion_time: completionTime,
  difficulty_level: difficultyLevel,
  attempts: attempts
});

// Track AI chat usage
posthog.capture('ai_chat_message', {
  conversation_id: conversationId,
  message_length: message.length,
  response_time: responseTime
});

// Track code execution
posthog.capture('code_executed', {
  language: language,
  code_length: code.length,
  execution_time: executionTime,
  success: exitCode === 0
});
```

### Alerts

PostHog doesn't have built-in alerting, but you can:

1. Create insights for key metrics
2. Export to external monitoring (e.g., Datadog)
3. Use webhooks for custom alerts

## 4. Uptime Monitoring

### Service: UptimeRobot or Better Uptime

#### Monitor Configuration

**1. Homepage Monitor**
- **URL**: https://yourdomain.com
- **Type**: HTTP(S)
- **Interval**: 5 minutes
- **Alert**: Email + Slack when down

**2. API Health Check**
- **URL**: https://yourdomain.com/api/health
- **Type**: HTTP(S)
- **Interval**: 5 minutes
- **Expected Status**: 200
- **Alert**: Email + Slack when down

**3. Database Connection**
- **URL**: https://yourdomain.com/api/health/db
- **Type**: HTTP(S)
- **Interval**: 5 minutes
- **Expected Status**: 200
- **Alert**: Email + Slack when down

**4. AI Service**
- **URL**: https://yourdomain.com/api/health/ai
- **Type**: HTTP(S)
- **Interval**: 10 minutes
- **Expected Status**: 200
- **Alert**: Email + Slack when down

### Health Check Endpoints

Create health check API routes:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}

// app/api/health/db/route.ts
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return Response.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return Response.json(
      { status: 'error', database: 'disconnected', error: error.message },
      { status: 503 }
    );
  }
}

// app/api/health/ai/route.ts
export async function GET() {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
    });
    
    if (!response.ok) throw new Error('AI service unavailable');
    
    return Response.json({ status: 'ok', ai: 'connected' });
  } catch (error) {
    return Response.json(
      { status: 'error', ai: 'disconnected', error: error.message },
      { status: 503 }
    );
  }
}
```

## 5. Database Performance Monitoring

### Supabase Dashboard

Monitor in Supabase Dashboard > Database:

**Key Metrics:**
- Connection pool usage
- Query performance
- Slow queries (> 1s)
- Database size
- Table sizes
- Index usage

### Performance Alerts

Configure in Supabase Dashboard > Database > Performance:

1. **High Connection Usage**: Alert when > 80% of connections used
2. **Slow Queries**: Alert when queries take > 2s
3. **Database Size**: Alert when > 80% of storage used
4. **Replication Lag**: Alert when lag > 10s

### Query Monitoring

Add query performance tracking:

```typescript
import { performance } from 'perf_hooks';

async function monitoredQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query: ${queryName} took ${duration}ms`);
      Sentry.captureMessage(`Slow query: ${queryName}`, {
        level: 'warning',
        extra: { duration, queryName }
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    Sentry.captureException(error, {
      tags: { query: queryName },
      extra: { duration }
    });
    throw error;
  }
}

// Usage
const lessons = await monitoredQuery(
  () => supabase.from('lessons').select('*').eq('roadmap_id', roadmapId),
  'fetch_lessons_by_roadmap'
);
```

## 6. Alert Channels

### Slack Integration

**Setup:**
1. Create Slack app
2. Add incoming webhook
3. Configure channels:
   - `#critical-alerts` - Critical errors, downtime
   - `#alerts` - High error rates, performance issues
   - `#new-issues` - New errors
   - `#regressions` - Resolved issues recurring
   - `#performance` - Performance degradation
   - `#deployments` - Deployment notifications

**Webhook Configuration:**
- Sentry: Settings > Integrations > Slack
- Vercel: Project Settings > Integrations > Slack
- UptimeRobot: My Settings > Alert Contacts > Add Slack

### Email Notifications

Configure email alerts for:
- Critical errors (immediate)
- Daily summary reports
- Weekly performance reports
- Monthly analytics reports

### PagerDuty (Optional)

For 24/7 on-call rotation:

1. Create PagerDuty service
2. Configure escalation policies
3. Integrate with Sentry and UptimeRobot
4. Set up on-call schedules

## 7. Monitoring Checklist

### Daily Checks

- [ ] Review Sentry error dashboard
- [ ] Check Vercel analytics for anomalies
- [ ] Review PostHog user metrics
- [ ] Check uptime status
- [ ] Review slow query logs

### Weekly Reviews

- [ ] Analyze error trends
- [ ] Review performance metrics
- [ ] Check database performance
- [ ] Review user retention
- [ ] Analyze feature usage

### Monthly Reviews

- [ ] Comprehensive performance review
- [ ] User behavior analysis
- [ ] Infrastructure cost review
- [ ] Alert effectiveness review
- [ ] Update monitoring thresholds

## 8. Incident Response

### Severity Levels

**P0 - Critical**
- Service completely down
- Data loss or corruption
- Security breach
- Response: Immediate (< 15 minutes)

**P1 - High**
- Major feature broken
- High error rate (> 5%)
- Severe performance degradation
- Response: < 1 hour

**P2 - Medium**
- Minor feature broken
- Moderate error rate (1-5%)
- Performance issues
- Response: < 4 hours

**P3 - Low**
- UI issues
- Low error rate (< 1%)
- Minor performance issues
- Response: < 24 hours

### Incident Response Process

1. **Detection**: Alert triggered
2. **Acknowledgment**: Team member acknowledges (< 15 min for P0)
3. **Investigation**: Identify root cause
4. **Mitigation**: Implement fix or rollback
5. **Resolution**: Verify fix in production
6. **Post-mortem**: Document incident and prevention

### Incident Communication

**Internal:**
- Update incident channel in Slack
- Notify stakeholders
- Document actions taken

**External (if needed):**
- Status page update
- User notification
- Social media update

## 9. Dashboard Setup

### Sentry Dashboard

**Widgets:**
- Error rate (last 24h)
- Top 10 errors
- Performance metrics (P50, P95, P99)
- Release health
- User impact

### Vercel Dashboard

**Widgets:**
- Web Vitals scores
- Page load times
- API response times
- Geographic distribution
- Device breakdown

### PostHog Dashboard

**Widgets:**
- DAU/WAU/MAU
- Retention curves
- Funnel analysis (onboarding)
- Feature usage
- User paths

### Custom Dashboard (Optional)

Use Grafana or similar to combine metrics:
- System health overview
- Error rates across services
- Performance metrics
- User engagement
- Business metrics

## 10. Testing Alerts

### Test Each Alert

1. **Error Alerts**: Trigger test error in production
2. **Performance Alerts**: Simulate slow response
3. **Uptime Alerts**: Temporarily disable health endpoint
4. **Database Alerts**: Simulate connection issue

### Verify Alert Delivery

- [ ] Slack notifications received
- [ ] Email notifications received
- [ ] PagerDuty incidents created (if configured)
- [ ] Alert contains relevant information
- [ ] Alert links to correct resources

## Support

For monitoring and alerting issues:

1. Check service status pages
2. Review this documentation
3. Check integration configurations
4. Contact DevOps team
