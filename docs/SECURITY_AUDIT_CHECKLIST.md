# Security Audit Checklist

This document provides a comprehensive security audit checklist for CodePath AI before production deployment.

## 1. Authentication Security

### Password Security
- [ ] Passwords hashed with bcrypt (salt rounds ≥ 10)
- [ ] Password minimum length: 8 characters
- [ ] Password complexity requirements enforced
- [ ] Password reset tokens expire after 1 hour
- [ ] Password reset rate limited
- [ ] Account lockout after 5 failed login attempts

**Verification**:
```sql
-- Check password hashing (should not see plaintext)
SELECT id, email, encrypted_password FROM auth.users LIMIT 5;

-- Verify bcrypt is used (should start with $2a$ or $2b$)
SELECT encrypted_password FROM auth.users WHERE encrypted_password NOT LIKE '$2%';
```

### Session Management
- [ ] JWT tokens expire after 1 hour
- [ ] Refresh tokens expire after 7 days
- [ ] Tokens stored in httpOnly cookies
- [ ] Secure flag set on cookies (HTTPS only)
- [ ] SameSite=Lax or Strict on cookies
- [ ] Session invalidation on logout
- [ ] Concurrent session limit enforced

**Verification**:
```typescript
// Check cookie settings in middleware
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 3600000 // 1 hour
};
```

### OAuth Security
- [ ] OAuth state parameter validated
- [ ] PKCE used for OAuth flows
- [ ] Redirect URIs whitelisted
- [ ] OAuth tokens stored securely
- [ ] OAuth scopes minimized

## 2. Row Level Security (RLS) Policies

### User Profiles
- [ ] Users can only view their own profile
- [ ] Users can only update their own profile
- [ ] Users cannot delete other users' profiles
- [ ] Service role can access all profiles

**Test**:
```sql
-- Test as user A trying to access user B's data
SET request.jwt.claims.sub = 'user-a-id';
SELECT * FROM user_profiles WHERE id = 'user-b-id';
-- Should return 0 rows

-- Test update
UPDATE user_profiles SET name = 'Hacked' WHERE id = 'user-b-id';
-- Should fail or affect 0 rows
```

### Roadmaps and Lessons
- [ ] Users can only view their own roadmaps
- [ ] Users can only view lessons from their roadmaps
- [ ] Users cannot modify lesson content
- [ ] Users can only update their own progress

**Test**:
```sql
-- Test roadmap access
SET request.jwt.claims.sub = 'user-a-id';
SELECT * FROM roadmaps WHERE user_id = 'user-b-id';
-- Should return 0 rows

-- Test lesson access
SELECT * FROM lessons WHERE roadmap_id IN (
  SELECT id FROM roadmaps WHERE user_id = 'user-b-id'
);
-- Should return 0 rows
```

### Messages and Conversations
- [ ] Users can only view their own conversations
- [ ] Users can only send messages in their conversations
- [ ] Users cannot delete other users' messages
- [ ] Message history is private

**Test**:
```sql
-- Test conversation access
SET request.jwt.claims.sub = 'user-a-id';
SELECT * FROM conversations WHERE user_id = 'user-b-id';
-- Should return 0 rows

-- Test message access
SELECT * FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE user_id = 'user-b-id'
);
-- Should return 0 rows
```

### Code Saves and Submissions
- [ ] Users can only view their own code
- [ ] Users can only submit code for their projects
- [ ] Code submissions are private
- [ ] Users cannot modify submitted code

**Test**:
```sql
-- Test code save access
SET request.jwt.claims.sub = 'user-a-id';
SELECT * FROM code_saves WHERE user_id = 'user-b-id';
-- Should return 0 rows

-- Test project submission access
SELECT * FROM project_submissions WHERE user_id = 'user-b-id';
-- Should return 0 rows
```

## 3. API Endpoint Security

### Authentication Endpoints
- [ ] Rate limiting on login (5 attempts per 15 minutes)
- [ ] Rate limiting on registration (3 attempts per hour)
- [ ] Rate limiting on password reset (3 attempts per hour)
- [ ] Email verification required
- [ ] CAPTCHA on registration (optional)

**Test**:
```bash
# Test login rate limiting
for i in {1..10}; do
  curl -X POST https://yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
# Should return 429 after 5 attempts
```

### AI Endpoints
- [ ] Authentication required
- [ ] Rate limiting (10 requests per minute per user)
- [ ] Input validation (max message length)
- [ ] Context sanitization
- [ ] Response streaming secured
- [ ] API key not exposed to client

**Test**:
```bash
# Test AI endpoint without auth
curl -X POST https://yourdomain.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
# Should return 401

# Test rate limiting
for i in {1..15}; do
  curl -X POST https://yourdomain.com/api/ai/chat \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
done
# Should return 429 after 10 requests
```

### Code Execution Endpoints
- [ ] Authentication required
- [ ] Code size limit enforced (50KB)
- [ ] Execution timeout enforced (30 seconds)
- [ ] Dangerous patterns filtered
- [ ] Sandboxed execution
- [ ] Rate limiting (5 executions per minute)

**Test**:
```bash
# Test code size limit
curl -X POST https://yourdomain.com/api/code/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"$(python -c 'print("a"*60000)')\"}"
# Should return 400

# Test execution timeout
curl -X POST https://yourdomain.com/api/code/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"while(true){}","language":"javascript"}'
# Should timeout and return error
```

### Data Export Endpoints
- [ ] Authentication required
- [ ] User can only export their own data
- [ ] Rate limiting (1 export per hour)
- [ ] Audit log created
- [ ] PII properly handled

**Test**:
```bash
# Test data export without auth
curl -X GET https://yourdomain.com/api/user/export
# Should return 401

# Test exporting other user's data
curl -X GET https://yourdomain.com/api/user/export?userId=other-user-id \
  -H "Authorization: Bearer $TOKEN"
# Should return 403
```

## 4. Input Validation and Sanitization

### User Input
- [ ] Email validation (format and domain)
- [ ] Name validation (length and characters)
- [ ] Goal text validation (length limits)
- [ ] Code validation (size limits)
- [ ] Message validation (length limits)
- [ ] XSS prevention in all inputs

**Test**:
```bash
# Test XSS in name field
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@example.com","password":"password123"}'
# Should sanitize or reject

# Test SQL injection in search
curl -X GET "https://yourdomain.com/api/lessons?search='; DROP TABLE users; --" \
  -H "Authorization: Bearer $TOKEN"
# Should not execute SQL
```

### File Uploads (if applicable)
- [ ] File type validation
- [ ] File size limits
- [ ] Virus scanning
- [ ] Secure file storage
- [ ] Access control on files

### API Parameters
- [ ] Type validation (string, number, boolean)
- [ ] Range validation (min/max)
- [ ] Format validation (UUID, email, URL)
- [ ] Required field validation
- [ ] Unexpected field rejection

## 5. Environment Variables Security

### Production Environment
- [ ] All secrets in environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in client-side code
- [ ] Environment variables validated on startup
- [ ] Separate keys for dev/staging/production

**Verification**:
```bash
# Check for secrets in code
grep -r "sk-ant-" . --exclude-dir=node_modules
grep -r "eyJhbGc" . --exclude-dir=node_modules
# Should return no results

# Check .gitignore
cat .gitignore | grep ".env"
# Should include .env files
```

### API Keys
- [ ] Claude API key is production key
- [ ] Supabase service role key secured
- [ ] Resend API key is production key
- [ ] PostHog key is production key
- [ ] Sentry DSN is production DSN
- [ ] All keys rotated from development

### Secrets Management
- [ ] Secrets stored in Vercel environment variables
- [ ] Access to secrets limited to authorized personnel
- [ ] Secrets rotation schedule defined
- [ ] Secrets audit log maintained

## 6. HTTPS and Transport Security

### SSL/TLS Configuration
- [ ] HTTPS enforced on all pages
- [ ] HTTP redirects to HTTPS
- [ ] TLS 1.2 or higher required
- [ ] Strong cipher suites only
- [ ] HSTS header enabled
- [ ] Certificate valid and not expiring soon

**Test**:
```bash
# Test HTTP redirect
curl -I http://yourdomain.com
# Should return 301/302 to https://

# Test HSTS header
curl -I https://yourdomain.com
# Should include: Strict-Transport-Security: max-age=31536000

# Test SSL configuration
nmap --script ssl-enum-ciphers -p 443 yourdomain.com
# Should show only strong ciphers
```

### Security Headers
- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured

**Verification**:
```bash
curl -I https://yourdomain.com | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)"
```

## 7. CORS Configuration

### CORS Settings
- [ ] CORS restricted to allowed origins
- [ ] Credentials allowed only for trusted origins
- [ ] Preflight requests handled correctly
- [ ] CORS headers validated

**Test**:
```bash
# Test CORS from unauthorized origin
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS https://yourdomain.com/api/ai/chat
# Should not include Access-Control-Allow-Origin
```

## 8. Rate Limiting

### Endpoint Rate Limits
- [ ] Authentication endpoints: 5 req/15min
- [ ] AI endpoints: 10 req/min per user
- [ ] Code execution: 5 req/min per user
- [ ] Data export: 1 req/hour per user
- [ ] General API: 100 req/min per user

**Test**:
```bash
# Test rate limiting on AI endpoint
for i in {1..15}; do
  curl -X POST https://yourdomain.com/api/ai/chat \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}' &
done
wait
# Should see 429 responses
```

### Rate Limit Headers
- [ ] X-RateLimit-Limit header present
- [ ] X-RateLimit-Remaining header present
- [ ] X-RateLimit-Reset header present
- [ ] Retry-After header on 429 responses

## 9. Error Handling

### Error Messages
- [ ] No stack traces in production errors
- [ ] No sensitive data in error messages
- [ ] Generic error messages for auth failures
- [ ] Detailed errors logged server-side only
- [ ] Error codes consistent

**Test**:
```bash
# Test error message for invalid credentials
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
# Should return generic "Invalid credentials", not "User not found" or "Wrong password"
```

### Error Logging
- [ ] All errors logged to Sentry
- [ ] PII redacted from logs
- [ ] Error context included
- [ ] User ID included (if authenticated)
- [ ] Request ID included

## 10. Database Security

### Connection Security
- [ ] Database connection over SSL
- [ ] Connection string not in code
- [ ] Connection pooling configured
- [ ] Idle connections closed

### Query Security
- [ ] Parameterized queries used
- [ ] No raw SQL with user input
- [ ] ORM/query builder used
- [ ] SQL injection prevented

**Test**:
```typescript
// Bad (vulnerable to SQL injection)
const query = `SELECT * FROM users WHERE email = '${userInput}'`;

// Good (parameterized)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userInput);
```

### Backup Security
- [ ] Backups encrypted at rest
- [ ] Backup access restricted
- [ ] Backup retention policy defined
- [ ] Backup restoration tested

## 11. Third-Party Services

### Claude API
- [ ] API key secured
- [ ] Rate limits configured
- [ ] Error handling implemented
- [ ] Timeout configured
- [ ] Retry logic implemented

### Piston API
- [ ] Code execution sandboxed
- [ ] Timeout enforced
- [ ] Resource limits set
- [ ] Dangerous code filtered
- [ ] Error handling implemented

### Resend
- [ ] API key secured
- [ ] Email rate limiting
- [ ] SPF/DKIM configured
- [ ] Bounce handling implemented
- [ ] Unsubscribe handling implemented

### PostHog
- [ ] API key secured
- [ ] PII not sent to PostHog
- [ ] Data retention configured
- [ ] GDPR compliance enabled

### Sentry
- [ ] DSN secured
- [ ] PII scrubbing enabled
- [ ] Source maps uploaded securely
- [ ] Data retention configured
- [ ] GDPR compliance enabled

## 12. Compliance

### GDPR
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Data processing agreement with vendors
- [ ] User consent tracked

### Data Privacy
- [ ] PII encrypted at rest
- [ ] PII encrypted in transit
- [ ] PII access logged
- [ ] PII retention policy defined
- [ ] PII deletion on account closure

## 13. Monitoring and Logging

### Security Monitoring
- [ ] Failed login attempts logged
- [ ] Suspicious activity alerts
- [ ] Rate limit violations logged
- [ ] RLS policy violations logged
- [ ] API abuse detected

### Audit Logging
- [ ] User actions logged
- [ ] Admin actions logged
- [ ] Data access logged
- [ ] Configuration changes logged
- [ ] Logs retained for 90 days

## 14. Incident Response

### Preparation
- [ ] Incident response plan documented
- [ ] Security contacts defined
- [ ] Escalation procedures defined
- [ ] Communication templates prepared
- [ ] Backup restoration tested

### Detection
- [ ] Security monitoring active
- [ ] Alerts configured
- [ ] Log analysis automated
- [ ] Anomaly detection enabled

### Response
- [ ] Incident response team identified
- [ ] Response procedures documented
- [ ] Communication plan defined
- [ ] Post-mortem process defined

## Security Audit Report

### Audit Date: [Date]
### Auditor: [Name]
### Version: [Version]

### Summary
- Total checks: [Number]
- Passed: [Number]
- Failed: [Number]
- Critical issues: [Number]
- High issues: [Number]
- Medium issues: [Number]
- Low issues: [Number]

### Critical Issues
1. [Issue description]
   - Impact: [Description]
   - Remediation: [Steps]
   - Status: [Open/In Progress/Resolved]

### Recommendations
1. [Recommendation]
2. [Recommendation]

### Sign-off
- [ ] Security audit completed
- [ ] All critical issues resolved
- [ ] All high issues resolved or accepted
- [ ] Production deployment approved

**Auditor Signature**: _______________
**Date**: _______________

**Approver Signature**: _______________
**Date**: _______________
