# Production Deployment Guide

This comprehensive guide covers the complete deployment process for CodePath AI to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Process](#deployment-process)
3. [Post-Deployment Verification](#post-deployment-verification)
4. [Rollback Procedures](#rollback-procedures)
5. [Monitoring and Alerts](#monitoring-and-alerts)
6. [Common Issues](#common-issues)
7. [Runbook](#runbook)

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] No critical or high severity security issues
- [ ] Linting passes without errors
- [ ] TypeScript compilation successful
- [ ] Bundle size within acceptable limits

### Environment Setup

- [ ] Production environment variables configured in Vercel
- [ ] Supabase production project set up
- [ ] Claude API production key configured
- [ ] Resend production account configured
- [ ] PostHog production project configured
- [ ] Sentry production project configured
- [ ] Domain DNS configured
- [ ] SSL certificate active

### Database

- [ ] All migrations applied to production database
- [ ] RLS policies enabled and tested
- [ ] Database backup completed
- [ ] Database performance optimized
- [ ] Indexes created

### Security

- [ ] Security audit completed
- [ ] All secrets secured in environment variables
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly

### Documentation

- [ ] Deployment documentation updated
- [ ] API documentation current
- [ ] Environment setup documented
- [ ] Rollback procedures documented
- [ ] Monitoring setup documented

## Deployment Process

### Step 1: Pre-Deployment Backup

Create a backup before deploying:

```bash
# Trigger manual backup
curl -X POST https://api.supabase.com/v1/projects/$PROJECT_ID/database/backups \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"

# Or use GitHub Actions
gh workflow run backup.yml
```

### Step 2: Run Final Tests

```bash
# Run all tests locally
npm run test -- --run
npm run test:e2e

# Check for security vulnerabilities
npm audit --audit-level=moderate

# Analyze bundle size
npm run analyze
```

### Step 3: Create Release Tag

```bash
# Create and push release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Step 4: Deploy to Production

#### Option A: Automatic Deployment (Recommended)

1. Merge PR to `main` branch
2. GitHub Actions automatically triggers deployment
3. Monitor deployment in GitHub Actions
4. Verify deployment in Vercel dashboard

#### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or use GitHub Actions manual trigger
gh workflow run deploy.yml
```

### Step 5: Monitor Deployment

1. **GitHub Actions**: Watch deployment workflow
   - Go to Actions tab
   - Monitor "Deploy to Production" workflow
   - Check for any errors

2. **Vercel Dashboard**: Monitor build and deployment
   - Go to Vercel dashboard
   - Check deployment status
   - Review build logs

3. **Sentry**: Monitor for errors
   - Go to Sentry dashboard
   - Check for new errors
   - Monitor error rate

### Step 6: Verify Deployment

See [Post-Deployment Verification](#post-deployment-verification) section.

## Post-Deployment Verification

### Automated Checks

Smoke tests run automatically after deployment. Monitor results in GitHub Actions.

### Manual Verification

#### 1. Health Checks

```bash
# Check main health endpoint
curl https://yourdomain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Check database health
curl https://yourdomain.com/api/health/db
# Expected: {"status":"ok","database":"connected"}

# Check AI service health
curl https://yourdomain.com/api/health/ai
# Expected: {"status":"ok","ai":"connected"}
```

#### 2. Critical User Flows

Test these flows manually:

**User Registration**:
1. Go to https://yourdomain.com/register
2. Register new account
3. Verify email received
4. Confirm email
5. Verify redirect to onboarding

**User Login**:
1. Go to https://yourdomain.com/login
2. Login with test account
3. Verify redirect to dashboard
4. Check user data loads correctly

**Onboarding Flow**:
1. Complete onboarding form
2. Submit learning goal
3. Verify roadmap generation
4. Check roadmap displays correctly

**Lesson Interaction**:
1. Navigate to first lesson
2. Verify lesson content loads
3. Test code editor
4. Run code execution
5. Verify output displays

**AI Chat**:
1. Open AI chat
2. Send test message
3. Verify response received
4. Check response quality

#### 3. Performance Checks

```bash
# Run Lighthouse audit
lighthouse https://yourdomain.com --view

# Check Web Vitals in Vercel Analytics
# Go to Vercel Dashboard > Analytics

# Check page load times
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com
```

#### 4. Monitoring Dashboards

**Sentry**:
- [ ] No new critical errors
- [ ] Error rate < 1%
- [ ] Performance metrics normal

**Vercel Analytics**:
- [ ] Web Vitals in acceptable range
- [ ] Page load times < 3s
- [ ] No 5xx errors

**PostHog**:
- [ ] Events tracking correctly
- [ ] User sessions recording
- [ ] No anomalies in metrics

**Supabase**:
- [ ] Database connections normal
- [ ] Query performance acceptable
- [ ] No slow queries

### Verification Checklist

- [ ] All health checks passing
- [ ] Critical user flows working
- [ ] No errors in Sentry
- [ ] Performance metrics acceptable
- [ ] Monitoring dashboards normal
- [ ] SSL certificate valid
- [ ] Domain resolving correctly
- [ ] Email sending working
- [ ] Analytics tracking
- [ ] Database accessible

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- Critical functionality broken
- High error rate (> 5%)
- Data corruption detected
- Security vulnerability discovered
- Performance severely degraded

### Rollback Methods

#### Method 1: Vercel Dashboard (Fastest)

1. Go to Vercel Dashboard > Deployments
2. Find last working deployment
3. Click "..." menu
4. Select "Promote to Production"
5. Confirm promotion

**Time**: ~2 minutes

#### Method 2: Git Revert

```bash
# Identify problematic commit
git log --oneline

# Revert commit
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

**Time**: ~5-10 minutes

#### Method 3: Redeploy Previous Version

```bash
# Checkout previous version
git checkout <previous-tag>

# Deploy to production
vercel --prod

# Or trigger GitHub Actions
gh workflow run deploy.yml
```

**Time**: ~5-10 minutes

#### Method 4: Database Rollback

If database changes caused issues:

```bash
# Restore from backup (see DATABASE_BACKUP_STRATEGY.md)
# Use Point-in-Time Recovery for recent changes
# Or restore from daily backup
```

**Time**: ~1-4 hours

### Post-Rollback

1. **Verify**: Test critical flows
2. **Monitor**: Watch error rates and metrics
3. **Communicate**: Notify stakeholders
4. **Investigate**: Identify root cause
5. **Document**: Create incident report
6. **Fix**: Prepare fix for next deployment

## Monitoring and Alerts

### Real-Time Monitoring

**During Deployment**:
- Monitor GitHub Actions workflow
- Watch Vercel deployment logs
- Check Sentry for new errors
- Monitor Vercel Analytics

**First Hour After Deployment**:
- Check error rates every 15 minutes
- Monitor performance metrics
- Watch user activity
- Check for anomalies

**First 24 Hours**:
- Review error trends
- Monitor performance
- Check user feedback
- Analyze metrics

### Alert Channels

**Critical Alerts** (Immediate Response):
- Slack: #critical-alerts
- Email: team@codepath.ai
- PagerDuty: On-call engineer

**High Priority Alerts** (< 1 hour):
- Slack: #alerts
- Email: team@codepath.ai

**Medium Priority** (< 4 hours):
- Slack: #monitoring
- Email: Daily digest

### Key Metrics to Monitor

1. **Error Rate**: Should be < 1%
2. **Response Time**: P95 < 3s
3. **Availability**: > 99.9%
4. **Database Performance**: Queries < 500ms
5. **User Activity**: Normal patterns

## Common Issues

### Issue: Deployment Fails

**Symptoms**: GitHub Actions workflow fails, Vercel build fails

**Diagnosis**:
```bash
# Check build logs in GitHub Actions
# Check Vercel deployment logs
# Verify environment variables
```

**Solution**:
1. Check error message in logs
2. Verify all environment variables set
3. Test build locally: `npm run build`
4. Fix issues and redeploy

### Issue: High Error Rate After Deployment

**Symptoms**: Sentry shows spike in errors

**Diagnosis**:
1. Check Sentry for error details
2. Identify affected endpoints/features
3. Check if errors are new or existing

**Solution**:
1. If critical: Rollback immediately
2. If minor: Monitor and fix in next deployment
3. Create hotfix if needed

### Issue: Slow Performance

**Symptoms**: High response times, slow page loads

**Diagnosis**:
1. Check Vercel Analytics
2. Check database performance
3. Check external API response times
4. Run Lighthouse audit

**Solution**:
1. Identify bottleneck
2. Optimize queries if database issue
3. Add caching if API issue
4. Optimize bundle if frontend issue

### Issue: Database Connection Errors

**Symptoms**: 503 errors, "database unavailable"

**Diagnosis**:
```bash
# Check database health
curl https://yourdomain.com/api/health/db

# Check Supabase dashboard
# Check connection pool usage
```

**Solution**:
1. Check Supabase status
2. Verify connection string
3. Check connection pool limits
4. Restart if needed

### Issue: Email Not Sending

**Symptoms**: Users not receiving emails

**Diagnosis**:
1. Check Resend dashboard
2. Check email logs
3. Verify API key
4. Check domain verification

**Solution**:
1. Verify Resend API key
2. Check domain DNS records
3. Check email templates
4. Test email sending manually

## Runbook

### Daily Operations

**Morning Check** (9 AM):
- [ ] Review overnight errors in Sentry
- [ ] Check Vercel Analytics for anomalies
- [ ] Review database performance
- [ ] Check backup status

**Evening Check** (5 PM):
- [ ] Review day's error trends
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Plan next day's work

### Weekly Operations

**Monday**:
- [ ] Review previous week's metrics
- [ ] Plan week's deployments
- [ ] Check dependency updates
- [ ] Review security alerts

**Friday**:
- [ ] Deploy week's changes
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Review week's incidents

### Monthly Operations

- [ ] Comprehensive performance review
- [ ] Security audit
- [ ] Dependency updates
- [ ] Backup restoration test
- [ ] Disaster recovery drill
- [ ] Cost optimization review

### Incident Response

**P0 - Critical** (Service Down):
1. Acknowledge incident (< 15 min)
2. Assess impact
3. Rollback if needed
4. Communicate to users
5. Fix and redeploy
6. Post-mortem

**P1 - High** (Major Feature Broken):
1. Acknowledge incident (< 1 hour)
2. Assess impact
3. Create hotfix
4. Deploy fix
5. Verify resolution
6. Document incident

**P2 - Medium** (Minor Issue):
1. Acknowledge incident (< 4 hours)
2. Create fix
3. Include in next deployment
4. Monitor

**P3 - Low** (Cosmetic Issue):
1. Create ticket
2. Prioritize in backlog
3. Fix in regular sprint

## Deployment Schedule

### Regular Deployments

- **Frequency**: Weekly (Fridays)
- **Time**: 10 AM PST (low traffic period)
- **Duration**: ~30 minutes
- **Monitoring**: 24 hours post-deployment

### Hotfix Deployments

- **Frequency**: As needed
- **Time**: Immediately for P0, within 4 hours for P1
- **Process**: Expedited review and deployment
- **Monitoring**: Continuous until stable

### Deployment Windows

**Preferred**:
- Weekdays: 10 AM - 2 PM PST
- Low traffic periods
- Team available for monitoring

**Avoid**:
- Fridays after 3 PM
- Weekends
- Holidays
- High traffic periods

## Communication

### Internal Communication

**Before Deployment**:
- Notify team in #deployments channel
- Share deployment plan
- Assign monitoring responsibilities

**During Deployment**:
- Update status in #deployments
- Share progress updates
- Report any issues immediately

**After Deployment**:
- Confirm successful deployment
- Share verification results
- Document any issues

### External Communication

**Planned Maintenance**:
- Notify users 48 hours in advance
- Update status page
- Send email notification

**Incident Communication**:
- Update status page immediately
- Send email to affected users
- Post on social media if needed
- Provide regular updates

## Support

### Contacts

- **DevOps Team**: devops@codepath.ai
- **On-Call**: [PagerDuty link]
- **Slack**: #deployments, #incidents
- **Emergency**: [Phone number]

### Resources

- [Production Setup Guide](./PRODUCTION_SETUP.md)
- [CI/CD Setup](./CICD_SETUP.md)
- [Monitoring and Alerting](./MONITORING_ALERTING.md)
- [Database Backup Strategy](./DATABASE_BACKUP_STRATEGY.md)
- [Security Audit Checklist](./SECURITY_AUDIT_CHECKLIST.md)
- [Bundle Optimization](./BUNDLE_OPTIMIZATION.md)

## Appendix

### Useful Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Rollback to previous deployment
vercel rollback [deployment-url]

# Run health checks
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/health/db
curl https://yourdomain.com/api/health/ai

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Test DNS resolution
dig yourdomain.com
nslookup yourdomain.com

# Run Lighthouse audit
lighthouse https://yourdomain.com --view

# Analyze bundle
npm run analyze

# Run tests
npm run test -- --run
npm run test:e2e
```

### Environment Variables Reference

See `.env.local.example` for complete list of required environment variables.

### Deployment Checklist Template

```markdown
## Deployment: [Version] - [Date]

### Pre-Deployment
- [ ] Tests passing
- [ ] Code review approved
- [ ] Security audit completed
- [ ] Backup created
- [ ] Team notified

### Deployment
- [ ] Deployed to production
- [ ] Health checks passing
- [ ] Critical flows verified
- [ ] Monitoring normal

### Post-Deployment
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] User feedback positive
- [ ] Documentation updated

### Issues
- [List any issues encountered]

### Notes
- [Any additional notes]
```
