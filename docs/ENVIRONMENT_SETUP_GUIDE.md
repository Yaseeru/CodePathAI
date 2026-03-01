# Environment Setup Guide

This guide will help you set up all required environment variables for the CodePath AI application.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials (see sections below)

3. Validate your setup:
   ```bash
   node scripts/validate-env.js
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Required Environment Variables

### 1. Supabase Configuration

**Purpose:** Database, authentication, and storage

**Get your credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to Settings → API
4. Copy the values

**Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Notes:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key (safe to expose)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret, server-side only)

---

### 2. Claude AI Configuration

**Purpose:** AI mentor, roadmap generation, code review

**Get your API key:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys
4. Create a new API key

**Variable:**
```env
CLAUDE_API_KEY=sk-ant-api03-...
```

**Notes:**
- Keep this key secret
- Monitor your usage at the Anthropic console
- The application uses `claude-sonnet-4-20250514` model

---

### 3. Resend Email Configuration

**Purpose:** Re-engagement emails, notifications

**Get your API key:**
1. Go to [Resend](https://resend.com/)
2. Sign up or log in
3. Go to API Keys
4. Create a new API key
5. Verify your domain (for production)

**Variables:**
```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Notes:**
- For development, you can use any email address
- For production, verify your domain in Resend dashboard
- Test emails will be sent to your Resend dashboard in development

---

### 4. Piston API Configuration

**Purpose:** Code execution in sandboxed environment

**Variable:**
```env
PISTON_API_URL=https://emkc.org/api/v2/piston
```

**Notes:**
- Default public API is free and works out of the box
- For production, consider self-hosting Piston for better reliability
- See [Piston GitHub](https://github.com/engineer-man/piston) for self-hosting

---

## Optional Environment Variables

### 5. PostHog Analytics (Optional)

**Purpose:** Product analytics, feature flags

**Get your credentials:**
1. Go to [PostHog](https://posthog.com/)
2. Sign up or log in
3. Create a project
4. Copy your project API key

**Variables:**
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Notes:**
- Optional but recommended for tracking user behavior
- Self-hosted PostHog is also supported

---

### 6. Sentry Error Tracking (Optional)

**Purpose:** Error monitoring and debugging

**Get your DSN:**
1. Go to [Sentry](https://sentry.io/)
2. Sign up or log in
3. Create a project
4. Copy your DSN from project settings

**Variables:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your_auth_token
```

**Notes:**
- Optional but highly recommended for production
- `SENTRY_AUTH_TOKEN` is only needed for uploading source maps

---

### 7. Upstash Redis (Optional)

**Purpose:** Rate limiting

**Get your credentials:**
1. Go to [Upstash](https://upstash.com/)
2. Sign up or log in
3. Create a Redis database
4. Copy REST URL and token

**Variables:**
```env
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

**Notes:**
- Optional - rate limiting will be disabled without this
- Free tier available

---

### 8. Application Configuration

**Variables:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Notes:**
- `NEXT_PUBLIC_APP_URL`: Change to your production URL when deploying
- `NODE_ENV`: Automatically set by Next.js, but can be overridden

---

## Validation

After setting up your environment variables, run the validation script:

```bash
node scripts/validate-env.js
```

This will check:
- ✓ All required variables are set
- ✓ No placeholder values remain
- ✓ Optional variables status

**Example output:**
```
============================================================
  Environment Variable Validation
============================================================

Checking required variables:

  ✓ NEXT_PUBLIC_SUPABASE_URL
  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ✓ SUPABASE_SERVICE_ROLE_KEY
  ✓ CLAUDE_API_KEY
  ✓ PISTON_API_URL
  ✓ RESEND_API_KEY
  ✓ RESEND_FROM_EMAIL

Checking optional variables:

  ✓ NEXT_PUBLIC_POSTHOG_KEY
  ✓ NEXT_PUBLIC_POSTHOG_HOST
  ○ NEXT_PUBLIC_SENTRY_DSN (optional)
  ○ UPSTASH_REDIS_REST_URL (optional)

============================================================
  Summary
============================================================

Valid: 7
Missing: 0
Placeholder: 0

✅ All environment variables are properly configured!
You can now start the application with: npm run dev
```

---

## Troubleshooting

### Error: "Missing required Supabase environment variables"

**Solution:**
1. Ensure `.env.local` file exists in project root
2. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Restart the development server after adding variables

### Error: "Cannot find module 'critters'"

**Solution:**
```bash
npm install critters --save-dev
```

### Error: "Claude API key is invalid"

**Solution:**
1. Verify your API key at [Anthropic Console](https://console.anthropic.com/)
2. Ensure the key starts with `sk-ant-api03-`
3. Check that you have API credits available

### Error: "Supabase connection failed"

**Solution:**
1. Verify your Supabase project is active
2. Check that the URL and keys are correct
3. Ensure your IP is not blocked (check Supabase dashboard)

---

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - It's already in `.gitignore`
   - Double-check before pushing

2. **Use different credentials for development and production**
   - Create separate Supabase projects
   - Use separate API keys

3. **Rotate keys regularly**
   - Especially after team member changes
   - If keys are accidentally exposed

4. **Limit API key permissions**
   - Use service role key only where necessary
   - Prefer anonymous key for client-side operations

5. **Monitor API usage**
   - Check Anthropic console for Claude API usage
   - Monitor Supabase dashboard for database usage
   - Set up billing alerts

---

## Production Deployment

When deploying to production (Vercel, etc.):

1. **Set environment variables in your hosting platform**
   - Vercel: Project Settings → Environment Variables
   - Add all required variables
   - Mark sensitive variables as "Secret"

2. **Update `NEXT_PUBLIC_APP_URL`**
   ```env
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Verify domain for Resend**
   - Add DNS records
   - Verify domain ownership
   - Update `RESEND_FROM_EMAIL` to use verified domain

4. **Enable production monitoring**
   - Set up Sentry for error tracking
   - Configure PostHog for analytics
   - Set up uptime monitoring

5. **Test thoroughly**
   - Run validation script
   - Test all features
   - Check error tracking is working

---

## Need Help?

- **Supabase:** [Documentation](https://supabase.com/docs)
- **Claude API:** [Documentation](https://docs.anthropic.com/)
- **Resend:** [Documentation](https://resend.com/docs)
- **Next.js:** [Environment Variables Guide](https://nextjs.org/docs/basic-features/environment-variables)

