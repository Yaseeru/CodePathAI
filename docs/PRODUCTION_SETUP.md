# Production Environment Setup Guide

This guide walks through setting up all production services for CodePath AI.

## Prerequisites

- Access to production domain
- Admin access to all service accounts
- Production database backup strategy in place

## 1. Supabase Production Project

### Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: CodePath AI Production
   - **Database Password**: Generate strong password (save in password manager)
   - **Region**: Choose closest to target users (e.g., us-east-1)
   - **Pricing Plan**: Pro (for production features)

### Configure Database

1. Run all migrations from `supabase/migrations/` in order
2. Enable Row Level Security on all tables
3. Verify RLS policies are active

### Get Production Credentials

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co

# Anon Key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Service Role Key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates:
   - Confirmation email
   - Password reset email
   - Magic link email
4. Set Site URL: `https://yourdomain.com`
5. Add Redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/confirm`

### Configure Storage (if needed)

1. Go to Storage
2. Create buckets for user content
3. Set up RLS policies for storage

## 2. Claude API Production Key

### Get Production API Key

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Navigate to API Keys
3. Create new key:
   - **Name**: CodePath AI Production
   - **Type**: Production
4. Copy key immediately (shown only once)

### Configure Rate Limits

1. Set appropriate rate limits for production traffic
2. Configure usage alerts
3. Set up billing alerts

### Environment Variable

```bash
CLAUDE_API_KEY=sk-ant-api03-...
```

## 3. Resend Production Account

### Create Production Account

1. Go to [Resend Dashboard](https://resend.com)
2. Sign up or log in
3. Upgrade to production plan

### Configure Domain

1. Go to Domains
2. Add your domain: `yourdomain.com`
3. Add DNS records (provided by Resend):
   ```
   Type: TXT
   Name: @
   Value: resend-verify=...
   
   Type: MX
   Name: @
   Value: mx1.resend.com (Priority: 10)
   Value: mx2.resend.com (Priority: 20)
   ```
4. Verify domain

### Get API Key

1. Go to API Keys
2. Create new key:
   - **Name**: CodePath AI Production
   - **Permission**: Sending access
3. Copy key

### Environment Variables

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Configure Email Templates

1. Set up transactional email templates
2. Test email delivery
3. Configure bounce and complaint handling

## 4. PostHog Production Project

### Create Production Project

1. Go to [PostHog Dashboard](https://app.posthog.com)
2. Create new project:
   - **Name**: CodePath AI Production
   - **Plan**: Growth or Enterprise

### Get Project Key

1. Go to Project Settings
2. Copy Project API Key

### Environment Variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Configure Features

1. Enable session recording (optional)
2. Set up feature flags
3. Configure data retention
4. Set up dashboards for key metrics:
   - User registration
   - Onboarding completion
   - Lesson completion
   - Daily active users
   - Retention cohorts

## 5. Sentry Production Project

### Create Production Project

1. Go to [Sentry Dashboard](https://sentry.io)
2. Create new project:
   - **Platform**: Next.js
   - **Name**: CodePath AI Production
   - **Alert Frequency**: Real-time

### Get DSN

1. Go to Project Settings > Client Keys (DSN)
2. Copy DSN

### Environment Variables

```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_... (for source maps)
```

### Configure Alerts

1. Go to Alerts
2. Create alert rules:
   - **Critical Errors**: Notify immediately
   - **High Error Rate**: > 10 errors/minute
   - **Performance Issues**: P95 > 3 seconds
3. Configure notification channels (email, Slack)

### Configure Releases

1. Enable release tracking
2. Configure source maps upload
3. Set up deploy notifications

## 6. Vercel Production Deployment

### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com)
2. Import Git Repository
3. Select your GitHub repository

### Configure Project

1. **Framework Preset**: Next.js
2. **Root Directory**: ./
3. **Build Command**: `npm run build`
4. **Output Directory**: .next
5. **Install Command**: `npm ci`

### Add Environment Variables

Go to Project Settings > Environment Variables and add all production variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Claude AI
CLAUDE_API_KEY=sk-ant-api03-...

# Piston API
PISTON_API_URL=https://emkc.org/api/v2/piston

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

### Configure Domain

1. Go to Project Settings > Domains
2. Add custom domain: `yourdomain.com`
3. Add DNS records (provided by Vercel):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation and SSL certificate

### Configure Deployment Settings

1. **Production Branch**: main
2. **Preview Deployments**: Enable for all branches
3. **Automatic Deployments**: Enable
4. **Build & Development Settings**:
   - Node.js Version: 20.x
   - Install Command: `npm ci`
   - Build Command: `npm run build`

## 7. Optional: Upstash Redis (Rate Limiting)

### Create Redis Database

1. Go to [Upstash Console](https://console.upstash.com)
2. Create new database:
   - **Name**: CodePath AI Production
   - **Region**: Same as Vercel deployment
   - **Type**: Regional

### Get Credentials

```bash
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

## Environment Variables Checklist

Create a `.env.production` file (DO NOT commit to git):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude AI
CLAUDE_API_KEY=

# Piston API
PISTON_API_URL=https://emkc.org/api/v2/piston

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Application
NEXT_PUBLIC_APP_URL=
NODE_ENV=production

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Security Checklist

- [ ] All API keys are production keys (not development)
- [ ] Service role keys are never exposed to client
- [ ] All secrets are stored in Vercel environment variables
- [ ] `.env.production` is in `.gitignore`
- [ ] Database RLS policies are enabled and tested
- [ ] HTTPS is enforced on all domains
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Error tracking is configured
- [ ] Monitoring alerts are set up

## Verification Steps

1. **Database Connection**:
   ```bash
   # Test Supabase connection
   curl https://[project-ref].supabase.co/rest/v1/ \
     -H "apikey: [anon-key]"
   ```

2. **Claude API**:
   ```bash
   # Test Claude API
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $CLAUDE_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-sonnet-4-20250514","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
   ```

3. **Email Sending**:
   ```bash
   # Test Resend
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"noreply@yourdomain.com","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
   ```

4. **Analytics**: Check PostHog dashboard for events
5. **Error Tracking**: Trigger test error and verify in Sentry

## Next Steps

After completing this setup:
1. Deploy to Vercel
2. Run smoke tests on production
3. Monitor error rates and performance
4. Set up backup and disaster recovery
5. Document rollback procedures
