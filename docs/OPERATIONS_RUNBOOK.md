# Operations Runbook

Quick reference guide for common operational tasks and troubleshooting.

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Sentry Dashboard**: https://sentry.io
- **PostHog Dashboard**: https://app.posthog.com
- **GitHub Actions**: https://github.com/[org]/[repo]/actions

## Common Issues

### 1. Service is Down

**Symptoms**: Users cannot access the site, 502/503 errors

**Quick Check**:
```bash
curl -I https://yourdomain.com
```

**Diagnosis**:
1. Check Vercel status: https://www.vercel-status.com
2. Check Supabase status: https://status.supabase.com
3. Check recent deployments in Vercel
4. Check Sentry for errors

**Resolution**:
- If Vercel issue: Wait for resolution or contact support
- If deployment issue: Rollback to previous version
- If database issue: Check Supabase dashboard and connection

**Escalation**: If not resolved in 15 minutes, page on-call engineer

---

### 2. High Error Rate

**Symptoms**: Sentry shows spike in errors, users reporting issues

**Quick Check**:
```bash
# Check error rate in Sentry
# Check affected endpoints
```

**Diagnosis**:
1. Identify error type and frequency
2. Check if errors started after deployment
3. Identify affected users/features
4. Check error stack traces

**Resolution**:
- If after deployment: Consider rollback
- If specific feature: Disable feature flag
- If external service: Check service status
- If database: Check query performance

**Escalation**: If error rate > 5%, escalate immediately

---

### 3. Slow Performance

**Symptoms**: Users reporting slow load times, high response times

**Quick Check**:
```bash
# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Check database performance
# Go to Supabase Dashboard > Database > Performance
```

**Diagnosis**:
1. Check Vercel Analytics for slow pages
2. Check database slow queries
3. Check external API response times
4. Check CDN performance

**Resolution**:
- If database: Optimize slow queries, add indexes
- If API: Add caching, optimize requests
- If frontend: Check bundle size, optimize assets
- If CDN: Clear cache, check configuration

**Escalation**: If P95 > 5s, escalate to engineering team

---

### 4. Database Connection Errors

**Symptoms**: "Database unavailable", connection timeout errors

**Quick Check**:
```bash
curl https://yourdomain.com/api/health/db
```

**Diagnosis**:
1. Check Supabase dashboard status
2. Check connection pool usage
3. Check for long-running queries
4. Verify connection string

**Resolution**:
- If connection pool full: Restart application or increase pool size
- If long-running queries: Kill queries or optimize
- If Supabase issue: Check status page, contact support
- If connection string: Verify environment variables

**Escalation**: If database unavailable > 5 minutes, escalate immediately

---

### 5. Authentication Issues

**Symptoms**: Users cannot login, session errors

**Quick Check**:
```bash
# Test login endpoint
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Diagnosis**:
1. Check Supabase Auth status
2. Check JWT configuration
3. Check session storage
4. Verify environment variables

**Resolution**:
- If Supabase Auth issue: Check dashboard, contact support
- If JWT issue: Verify secret, check expiration
- If session issue: Clear cookies, check storage
- If environment: Verify auth keys

**Escalation**: If affecting all users, escalate immediately

---

### 6. Email Not Sending

**Symptoms**: Users not receiving emails, email errors

**Quick Check**:
```bash
# Check Resend dashboard
# Check email logs
```

**Diagnosis**:
1. Check Resend dashboard for errors
2. Verify API key
3. Check domain verification
4. Check email templates

**Resolution**:
- If API key issue: Verify key in environment variables
- If domain issue: Check DNS records
- If template issue: Fix template syntax
- If rate limit: Wait or upgrade plan

**Escalation**: If critical emails (password reset), escalate within 1 hour

---

### 7. AI Service Errors

**Symptoms**: AI chat not responding, Claude API errors

**Quick Check**:
```bash
curl https://yourdomain.com/api/health/ai
```

**Diagnosis**:
1. Check Claude API status
2. Check API key validity
3. Check rate limits
4. Check request/response logs

**Resolution**:
- If API status issue: Wait for resolution
- If API key issue: Verify key, rotate if needed
- If rate limit: Implement queuing or upgrade plan
- If request issue: Check prompt format

**Escalation**: If AI unavailable > 30 minutes, notify users

---

### 8. Code Execution Failures

**Symptoms**: Code not running, execution timeouts

**Quick Check**:
```bash
# Test code execution endpoint
curl -X POST https://yourdomain.com/api/code/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"test\")","language":"javascript"}'
```

**Diagnosis**:
1. Check Piston API status
2. Check execution logs
3. Check timeout settings
4. Verify code sanitization

**Resolution**:
- If Piston issue: Check status, use backup service
- If timeout: Increase timeout or optimize code
- If sanitization: Review filtering rules
- If resource limit: Check Piston configuration

**Escalation**: If code execution unavailable > 15 minutes, escalate

---

## Routine Tasks

### Daily Tasks

**Morning Checklist** (9 AM):
```bash
# 1. Check overnight errors
# Go to Sentry > Issues > Last 24 hours

# 2. Check system health
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/health/db
curl https://yourdomain.com/api/health/ai

# 3. Check backup status
# Go to Supabase > Database > Backups

# 4. Review metrics
# Go to Vercel Analytics
# Go to PostHog Dashboard
```

**Evening Checklist** (5 PM):
```bash
# 1. Review day's errors
# Go to Sentry > Issues > Today

# 2. Check performance
# Go to Vercel Analytics > Performance

# 3. Review user activity
# Go to PostHog > Dashboard

# 4. Check pending alerts
# Review Slack #alerts channel
```

### Weekly Tasks

**Monday**:
- Review previous week's incidents
- Plan week's deployments
- Check dependency updates
- Review security alerts

**Wednesday**:
- Mid-week health check
- Review error trends
- Check database performance
- Update documentation

**Friday**:
- Deploy week's changes
- Run full test suite
- Review week's metrics
- Plan next week

### Monthly Tasks

- Comprehensive performance review
- Security audit
- Dependency updates
- Backup restoration test
- Cost optimization review
- Team retrospective

---

## Emergency Procedures

### Complete Service Outage

**Immediate Actions** (< 5 minutes):
1. Acknowledge incident in #incidents
2. Check Vercel and Supabase status pages
3. Verify DNS resolution
4. Check recent deployments

**Short-term Actions** (< 15 minutes):
1. If deployment issue: Rollback
2. If infrastructure issue: Contact provider
3. Update status page
4. Notify stakeholders

**Recovery**:
1. Restore service
2. Verify functionality
3. Monitor closely
4. Communicate resolution

### Data Loss or Corruption

**Immediate Actions** (< 5 minutes):
1. Stop all write operations
2. Assess extent of damage
3. Identify last known good state
4. Notify engineering team

**Short-term Actions** (< 1 hour):
1. Restore from backup
2. Verify data integrity
3. Test critical functionality
4. Document incident

**Recovery**:
1. Resume normal operations
2. Monitor data quality
3. Investigate root cause
4. Implement prevention measures

### Security Incident

**Immediate Actions** (< 5 minutes):
1. Isolate affected systems
2. Assess breach scope
3. Preserve evidence
4. Notify security team

**Short-term Actions** (< 1 hour):
1. Contain breach
2. Rotate compromised credentials
3. Patch vulnerabilities
4. Document incident

**Recovery**:
1. Restore secure state
2. Monitor for further activity
3. Notify affected users
4. Conduct post-mortem

---

## Monitoring Commands

### Health Checks

```bash
# Main health check
curl https://yourdomain.com/api/health

# Database health
curl https://yourdomain.com/api/health/db

# AI service health
curl https://yourdomain.com/api/health/ai

# All health checks
for endpoint in health health/db health/ai; do
  echo "Checking $endpoint..."
  curl -s https://yourdomain.com/api/$endpoint | jq
done
```

### Performance Checks

```bash
# Response time
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# DNS resolution
dig yourdomain.com

# SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com | openssl x509 -noout -dates

# Lighthouse audit
lighthouse https://yourdomain.com --output json --output-path ./lighthouse-report.json
```

### Database Checks

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;
```

---

## Useful Scripts

### Restart Application

```bash
# Trigger redeployment in Vercel
vercel --prod

# Or redeploy via GitHub Actions
gh workflow run deploy.yml
```

### Clear Cache

```bash
# Clear Vercel cache
vercel --prod --force

# Clear CDN cache (if using)
# Depends on CDN provider
```

### Rotate Secrets

```bash
# 1. Generate new secret
# 2. Update in Vercel environment variables
vercel env add SECRET_NAME production

# 3. Redeploy
vercel --prod

# 4. Verify new secret works
# 5. Remove old secret
```

### Database Maintenance

```sql
-- Vacuum database
VACUUM ANALYZE;

-- Reindex tables
REINDEX DATABASE postgres;

-- Update statistics
ANALYZE;
```

---

## Contact Information

### On-Call Rotation

- **Primary**: [Name] - [Phone] - [Email]
- **Secondary**: [Name] - [Phone] - [Email]
- **Escalation**: [Name] - [Phone] - [Email]

### Service Providers

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Anthropic Support**: support@anthropic.com
- **Resend Support**: support@resend.com

### Internal Teams

- **Engineering**: engineering@codepath.ai
- **DevOps**: devops@codepath.ai
- **Security**: security@codepath.ai
- **Product**: product@codepath.ai

---

## Escalation Matrix

| Severity | Response Time | Escalation Path |
|----------|--------------|-----------------|
| P0 - Critical | < 15 minutes | On-call → Engineering Lead → CTO |
| P1 - High | < 1 hour | On-call → Engineering Lead |
| P2 - Medium | < 4 hours | On-call → Team Lead |
| P3 - Low | < 24 hours | Team Lead |

---

## Additional Resources

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Monitoring and Alerting](./MONITORING_ALERTING.md)
- [Database Backup Strategy](./DATABASE_BACKUP_STRATEGY.md)
- [Security Audit Checklist](./SECURITY_AUDIT_CHECKLIST.md)
- [CI/CD Setup](./CICD_SETUP.md)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| [Date] | Initial version | [Name] |
