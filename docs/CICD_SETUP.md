# CI/CD Pipeline Setup

This document describes the CI/CD pipeline for CodePath AI.

## Overview

The CI/CD pipeline consists of three main workflows:

1. **CI Pipeline** (`ci.yml`) - Runs on every push and PR
2. **Production Deployment** (`deploy.yml`) - Deploys to production on main branch
3. **Preview Deployment** (`preview.yml`) - Creates preview deployments for PRs

## Workflows

### 1. CI Pipeline (ci.yml)

Runs on: Push to `main` or `develop`, and all PRs

**Jobs:**

- **Lint**: Runs ESLint to check code quality
- **Unit Tests**: Runs Vitest unit tests with coverage
- **E2E Tests**: Runs Playwright end-to-end tests
- **Build**: Builds the Next.js application and analyzes bundle size
- **Security Scan**: Runs npm audit to check for vulnerabilities

**Artifacts:**
- Test coverage reports
- Playwright test results
- Build output
- Security audit results

### 2. Production Deployment (deploy.yml)

Runs on: Push to `main` branch or manual trigger

**Jobs:**

- **Deploy**: Deploys to Vercel production
  - Pulls Vercel environment configuration
  - Builds production artifacts
  - Deploys to Vercel
  - Creates Sentry release for error tracking
  - Notifies deployment status

- **Smoke Tests**: Runs critical smoke tests on production
  - Tests basic functionality
  - Verifies deployment health

**Environment:** production

### 3. Preview Deployment (preview.yml)

Runs on: Pull requests to `main` or `develop`

**Jobs:**

- **Deploy Preview**: Creates preview deployment
  - Deploys to Vercel preview environment
  - Comments on PR with preview URL
  - Runs preview tests
  - Automatically cleaned up when PR is closed

## Required GitHub Secrets

Add these secrets in GitHub repository settings (Settings > Secrets and variables > Actions):

### Vercel Secrets

```
VERCEL_TOKEN=<your-vercel-token>
```

To get Vercel token:
1. Go to Vercel Dashboard > Settings > Tokens
2. Create new token with appropriate scope
3. Copy token to GitHub secrets

### Supabase Secrets

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Claude API Secret

```
CLAUDE_API_KEY=sk-ant-api03-...
```

### PostHog Secrets

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Sentry Secrets

```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org-name
SENTRY_PROJECT=codepath-ai
```

### Codecov Secret (Optional)

```
CODECOV_TOKEN=<your-codecov-token>
```

## Vercel Configuration

### Project Settings

1. **Framework Preset**: Next.js
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Install Command**: `npm ci`
5. **Node.js Version**: 20.x

### Environment Variables

Add all production environment variables in Vercel dashboard:

- Go to Project Settings > Environment Variables
- Add all variables from `.env.local.example`
- Set appropriate values for production
- Select "Production" environment

### Deployment Settings

1. **Production Branch**: `main`
2. **Preview Deployments**: Enabled for all branches
3. **Automatic Deployments**: Enabled
4. **Ignored Build Step**: None (build on every commit)

### Domain Configuration

1. Add custom domain in Project Settings > Domains
2. Configure DNS records as provided by Vercel
3. Wait for SSL certificate provisioning

## Deployment Process

### Automatic Deployment (Recommended)

1. Create feature branch from `develop`
2. Make changes and commit
3. Push to GitHub
4. CI pipeline runs automatically
5. Create PR to `develop` or `main`
6. Preview deployment created automatically
7. Review preview and tests
8. Merge PR
9. If merged to `main`, production deployment triggers

### Manual Deployment

Trigger manual deployment from GitHub Actions:

1. Go to Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

## Monitoring Deployments

### GitHub Actions

- View workflow runs in Actions tab
- Check logs for each job
- Download artifacts for debugging

### Vercel Dashboard

- View deployment status
- Check build logs
- Monitor performance metrics
- View deployment history

### Sentry

- Track errors in production
- Monitor release health
- View deployment markers

## Rollback Procedure

If a deployment causes issues:

### Option 1: Vercel Dashboard (Fastest)

1. Go to Vercel Dashboard > Deployments
2. Find last working deployment
3. Click "..." menu > "Promote to Production"

### Option 2: Git Revert

1. Identify problematic commit
2. Revert commit:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. New deployment triggers automatically

### Option 3: Redeploy Previous Version

1. Go to GitHub Actions
2. Find successful deployment workflow
3. Click "Re-run all jobs"

## Troubleshooting

### Build Failures

**Symptom**: Build job fails in CI

**Solutions**:
- Check build logs in GitHub Actions
- Verify all environment variables are set
- Test build locally: `npm run build`
- Check for TypeScript errors: `npm run lint`

### Test Failures

**Symptom**: Tests fail in CI but pass locally

**Solutions**:
- Check test logs in GitHub Actions
- Verify test environment variables
- Run tests in CI mode locally: `npm run test -- --run`
- Check for timing issues in E2E tests

### Deployment Failures

**Symptom**: Vercel deployment fails

**Solutions**:
- Check Vercel build logs
- Verify Vercel token is valid
- Check environment variables in Vercel
- Verify build succeeds locally

### Preview Deployment Not Created

**Symptom**: PR doesn't get preview deployment

**Solutions**:
- Check GitHub Actions logs
- Verify Vercel token has correct permissions
- Check Vercel project settings
- Ensure PR is from allowed branch

## Best Practices

### Before Merging

- [ ] All CI checks pass
- [ ] Preview deployment works correctly
- [ ] Code review approved
- [ ] Tests added for new features
- [ ] Documentation updated

### After Deployment

- [ ] Monitor Sentry for errors
- [ ] Check Vercel analytics
- [ ] Verify critical user flows
- [ ] Monitor performance metrics
- [ ] Check PostHog for analytics

### Security

- [ ] Never commit secrets to repository
- [ ] Rotate tokens regularly
- [ ] Use environment-specific secrets
- [ ] Enable branch protection rules
- [ ] Require status checks before merge

## Notifications

### Slack Integration (Optional)

Add Slack notifications for deployments:

1. Create Slack webhook
2. Add webhook URL to GitHub secrets: `SLACK_WEBHOOK_URL`
3. Add notification step to workflows:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Email Notifications

GitHub sends email notifications by default for:
- Failed workflow runs
- Deployment status
- Security alerts

Configure in GitHub Settings > Notifications

## Performance Optimization

### Build Cache

- npm dependencies cached automatically
- Next.js build cache enabled
- Playwright browsers cached

### Parallel Jobs

- Lint, tests, and security scan run in parallel
- Reduces total CI time
- Build job depends on lint and unit tests

### Conditional Execution

- E2E tests only on PR and main branch
- Security scan runs independently
- Preview deployments only on PRs

## Maintenance

### Regular Tasks

- **Weekly**: Review failed workflows
- **Monthly**: Update dependencies
- **Quarterly**: Rotate API tokens
- **Yearly**: Review and optimize pipeline

### Dependency Updates

Use Dependabot for automated dependency updates:

1. Enable Dependabot in repository settings
2. Configure `.github/dependabot.yml`
3. Review and merge PRs regularly

## Support

For issues with CI/CD pipeline:

1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check Vercel documentation
4. Contact DevOps team
