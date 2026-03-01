# Database Backup and Recovery Strategy

This document outlines the backup and disaster recovery strategy for CodePath AI's production database.

## Overview

CodePath AI uses Supabase (PostgreSQL) for data storage. The backup strategy ensures:
- **RPO (Recovery Point Objective)**: < 1 hour (maximum data loss)
- **RTO (Recovery Time Objective)**: < 4 hours (maximum downtime)
- **Retention**: 30 days for daily backups, 90 days for weekly backups

## Backup Types

### 1. Automated Daily Backups (Supabase)

**Frequency**: Daily at 2:00 AM UTC

**Retention**: 30 days

**Configuration**:
1. Go to Supabase Dashboard > Database > Backups
2. Verify daily backups are enabled (enabled by default on Pro plan)
3. Configure backup schedule if needed

**What's Backed Up**:
- All database tables and data
- Database schema and structure
- Row Level Security policies
- Functions and triggers
- Indexes

**What's NOT Backed Up**:
- Storage files (separate backup needed)
- Real-time subscriptions configuration
- Edge functions

### 2. Point-in-Time Recovery (PITR)

**Availability**: Last 7 days

**Configuration**:
1. Go to Supabase Dashboard > Database > Backups
2. Enable Point-in-Time Recovery (available on Pro plan)
3. Verify PITR is active

**Use Cases**:
- Recover from accidental data deletion
- Restore to specific timestamp
- Investigate data at specific point in time

**Limitations**:
- Only available for last 7 days
- Requires Pro plan or higher
- Recovery creates new database instance

### 3. Weekly Full Backups (Manual)

**Frequency**: Weekly on Sundays at 3:00 AM UTC

**Retention**: 90 days

**Storage**: External storage (AWS S3 or similar)

**Process**:
```bash
# Export database using pg_dump
pg_dump -h db.project-ref.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).dump \
  s3://codepath-backups/weekly/

# Verify backup
aws s3 ls s3://codepath-backups/weekly/backup_$(date +%Y%m%d).dump
```

**Automation** (GitHub Actions):
```yaml
name: Weekly Database Backup

on:
  schedule:
    - cron: '0 3 * * 0'  # Every Sunday at 3 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Install PostgreSQL client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client
      
      - name: Create backup
        env:
          PGPASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: |
          pg_dump -h ${{ secrets.SUPABASE_DB_HOST }} \
            -U postgres \
            -d postgres \
            -F c \
            -f backup_$(date +%Y%m%d).dump
      
      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Copy to S3
        run: |
          aws s3 cp backup_$(date +%Y%m%d).dump \
            s3://codepath-backups/weekly/
      
      - name: Verify backup
        run: |
          aws s3 ls s3://codepath-backups/weekly/backup_$(date +%Y%m%d).dump
      
      - name: Cleanup old backups
        run: |
          # Delete backups older than 90 days
          aws s3 ls s3://codepath-backups/weekly/ | \
            awk '{print $4}' | \
            while read file; do
              if [ $(date -d "$(echo $file | grep -oP '\d{8}')" +%s) -lt $(date -d '90 days ago' +%s) ]; then
                aws s3 rm s3://codepath-backups/weekly/$file
              fi
            done
```

### 4. Pre-Deployment Backups

**Frequency**: Before every production deployment

**Retention**: 7 days

**Process**: Automated in deployment workflow

```yaml
# In .github/workflows/deploy.yml
- name: Create pre-deployment backup
  run: |
    # Trigger Supabase backup
    curl -X POST https://api.supabase.com/v1/projects/$PROJECT_ID/database/backups \
      -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
```

## Backup Verification

### Automated Verification

**Daily Verification**:
```bash
# Verify backup exists
supabase db dump --db-url $DATABASE_URL --file test_restore.sql

# Test restore to temporary database
psql -h temp-db.supabase.co -U postgres -d postgres -f test_restore.sql

# Verify data integrity
psql -h temp-db.supabase.co -U postgres -d postgres -c "SELECT COUNT(*) FROM user_profiles;"
```

### Monthly Restore Test

**Process**:
1. Create temporary Supabase project
2. Restore latest backup
3. Run data integrity checks
4. Verify application functionality
5. Document results
6. Delete temporary project

**Checklist**:
- [ ] Backup file is accessible
- [ ] Restore completes without errors
- [ ] All tables present
- [ ] Row counts match production
- [ ] RLS policies active
- [ ] Indexes present
- [ ] Functions working

## Recovery Procedures

### Scenario 1: Accidental Data Deletion (< 7 days ago)

**Use**: Point-in-Time Recovery

**Steps**:
1. Identify exact timestamp before deletion
2. Go to Supabase Dashboard > Database > Backups
3. Click "Point-in-Time Recovery"
4. Select timestamp
5. Create new database instance
6. Verify data in new instance
7. Update application connection string
8. Monitor for issues

**Estimated Time**: 2-4 hours

### Scenario 2: Database Corruption

**Use**: Latest daily backup

**Steps**:
1. Assess extent of corruption
2. Go to Supabase Dashboard > Database > Backups
3. Select latest backup before corruption
4. Click "Restore"
5. Verify data integrity
6. Update application if needed
7. Monitor for issues

**Estimated Time**: 1-2 hours

### Scenario 3: Complete Database Loss

**Use**: Weekly full backup from S3

**Steps**:
1. Create new Supabase project
2. Download backup from S3:
   ```bash
   aws s3 cp s3://codepath-backups/weekly/backup_latest.dump ./
   ```
3. Restore backup:
   ```bash
   pg_restore -h new-db.supabase.co \
     -U postgres \
     -d postgres \
     -c \
     backup_latest.dump
   ```
4. Verify data integrity
5. Update application connection strings
6. Update DNS if needed
7. Monitor for issues

**Estimated Time**: 4-8 hours

### Scenario 4: Partial Data Recovery

**Use**: Point-in-Time Recovery + selective restore

**Steps**:
1. Create PITR instance at desired timestamp
2. Export specific tables:
   ```bash
   pg_dump -h pitr-db.supabase.co \
     -U postgres \
     -d postgres \
     -t user_profiles \
     -t roadmaps \
     -f partial_restore.sql
   ```
3. Import to production:
   ```bash
   psql -h prod-db.supabase.co \
     -U postgres \
     -d postgres \
     -f partial_restore.sql
   ```
4. Verify data
5. Clean up PITR instance

**Estimated Time**: 1-3 hours

## Data Integrity Checks

### Automated Checks (Daily)

```sql
-- Check for orphaned records
SELECT COUNT(*) FROM lessons 
WHERE roadmap_id NOT IN (SELECT id FROM roadmaps);

-- Check for missing required data
SELECT COUNT(*) FROM user_profiles 
WHERE email IS NULL OR name IS NULL;

-- Check for data consistency
SELECT COUNT(*) FROM lesson_progress 
WHERE completed_at IS NOT NULL AND status != 'completed';

-- Check for duplicate records
SELECT email, COUNT(*) 
FROM user_profiles 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### Manual Checks (Weekly)

- [ ] Verify row counts match expected growth
- [ ] Check for data anomalies
- [ ] Verify RLS policies are active
- [ ] Check for slow queries
- [ ] Review database size growth

## Backup Monitoring

### Metrics to Track

1. **Backup Success Rate**: Should be 100%
2. **Backup Size**: Track growth over time
3. **Backup Duration**: Should be < 30 minutes
4. **Restore Test Success**: Should be 100%
5. **Storage Usage**: Monitor S3 costs

### Alerts

**Backup Failure Alert**:
- Trigger: Daily backup fails
- Action: Immediate notification to DevOps
- Response: Investigate and retry within 4 hours

**Backup Size Anomaly**:
- Trigger: Backup size changes > 50% from previous
- Action: Notification to DevOps
- Response: Investigate within 24 hours

**Storage Limit Alert**:
- Trigger: S3 storage > 80% of quota
- Action: Notification to DevOps
- Response: Clean up old backups or increase quota

## Disaster Recovery Plan

### Communication Plan

**Internal**:
1. Notify engineering team via Slack #incidents
2. Update status in incident management system
3. Regular updates every 30 minutes

**External** (if needed):
1. Update status page
2. Send email to affected users
3. Post on social media

### Recovery Team Roles

**Incident Commander**: Coordinates recovery effort
**Database Engineer**: Executes recovery procedures
**Application Engineer**: Updates application configuration
**QA Engineer**: Verifies data integrity
**Communications**: Handles internal/external communication

### Recovery Checklist

- [ ] Assess situation and determine recovery method
- [ ] Notify stakeholders
- [ ] Create recovery timeline
- [ ] Execute recovery procedure
- [ ] Verify data integrity
- [ ] Update application configuration
- [ ] Run smoke tests
- [ ] Monitor for issues
- [ ] Document incident
- [ ] Conduct post-mortem

## Testing Schedule

### Daily
- Automated backup verification
- Data integrity checks

### Weekly
- Manual backup verification
- Review backup logs
- Check storage usage

### Monthly
- Full restore test to temporary environment
- Disaster recovery drill
- Update documentation

### Quarterly
- Review and update backup strategy
- Test all recovery scenarios
- Update team training

## Backup Security

### Encryption

- **At Rest**: All backups encrypted with AES-256
- **In Transit**: TLS 1.3 for all transfers
- **Keys**: Managed by AWS KMS or Supabase

### Access Control

- Backup access limited to DevOps team
- MFA required for backup operations
- Audit log for all backup access
- Regular access review

### Compliance

- GDPR compliant backup retention
- Data residency requirements met
- Regular security audits
- Documented procedures

## Cost Optimization

### Storage Costs

- Daily backups: Included in Supabase Pro plan
- PITR: Included in Supabase Pro plan
- Weekly backups: ~$5-10/month in S3
- Total estimated cost: ~$10-20/month

### Optimization Strategies

1. Compress backups before upload
2. Use S3 Intelligent-Tiering
3. Delete old backups automatically
4. Monitor and optimize backup size

## Documentation

### Required Documentation

- [ ] Backup procedures (this document)
- [ ] Recovery procedures (this document)
- [ ] Access credentials (secure location)
- [ ] Contact information
- [ ] Escalation procedures

### Update Schedule

- Review quarterly
- Update after any changes
- Update after incidents
- Update after recovery tests

## Support

For backup and recovery issues:

1. Check Supabase status page
2. Review backup logs
3. Contact Supabase support
4. Escalate to DevOps team

## Appendix

### Useful Commands

```bash
# List all backups
supabase db dump --list

# Create manual backup
supabase db dump --db-url $DATABASE_URL --file backup.sql

# Restore from backup
supabase db push --db-url $DATABASE_URL --file backup.sql

# Verify backup integrity
pg_restore --list backup.dump

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('postgres'));"

# Export specific table
pg_dump -t table_name -f table_backup.sql

# Import specific table
psql -f table_backup.sql
```

### Contact Information

- **Supabase Support**: support@supabase.com
- **DevOps Team**: devops@codepath.ai
- **On-Call**: [PagerDuty link]
- **Incident Channel**: #incidents on Slack
