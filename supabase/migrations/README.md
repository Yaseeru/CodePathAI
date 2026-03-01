# Database Migrations for CodePath AI MVP

This directory contains SQL migration files for setting up the complete database schema for the CodePath AI platform.

## Migration Files

The migrations are numbered sequentially and should be executed in order:

1. **001_create_core_tables.sql** - Creates core tables for user profiles, roadmaps, lessons, projects, and progress tracking
2. **002_create_ai_interaction_tables.sql** - Creates tables for AI conversations, messages, and code saves
3. **003_create_analytics_tables.sql** - Creates tables for event tracking and daily activity analytics
4. **004_enable_row_level_security.sql** - Enables Row Level Security (RLS) on all tables and creates policies

## Database Schema Overview

### Core Tables
- **user_profiles** - User account information and onboarding data
- **roadmaps** - Personalized learning roadmaps for each user
- **lessons** - Individual learning units within roadmaps
- **projects** - Build-as-you-learn project milestones
- **lesson_progress** - Tracks user progress through lessons
- **project_submissions** - Stores user project code submissions
- **user_progress** - Aggregated user progress metrics

### AI Interaction Tables
- **conversations** - Chat conversation sessions
- **messages** - Individual chat messages with context snapshots
- **code_saves** - Auto-saved code from lessons and projects

### Analytics Tables
- **user_events** - Event tracking for analytics
- **daily_activity** - Daily aggregated user activity metrics

## How to Apply Migrations

### Using Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply all migrations:
   ```bash
   supabase db push
   ```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration

### Manual Execution

You can also execute the migrations directly using `psql` or any PostgreSQL client:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/001_create_core_tables.sql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/002_create_ai_interaction_tables.sql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/003_create_analytics_tables.sql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/004_enable_row_level_security.sql
```

## Row Level Security (RLS)

All tables have RLS enabled to ensure data isolation between users. The policies enforce that:

- Users can only access their own profile data
- Users can only view/modify roadmaps, lessons, and projects they own
- Users can only see messages from their own conversations
- Users can only access their own code saves and progress data
- Users can only view their own analytics and events

## Key Features

### Foreign Key Relationships
- All user-related tables cascade delete when a user is deleted
- Lessons and projects cascade delete when their parent roadmap is deleted
- Messages cascade delete when their parent conversation is deleted

### Indexes
Optimized indexes are created for common query patterns:
- User lookups by email
- Roadmap queries by user and status
- Lesson queries by roadmap and order
- Progress queries by user and status
- Message queries by conversation and timestamp
- Activity queries by user and date

### JSONB Fields
Several tables use JSONB for flexible structured data:
- `lessons.content` - Structured lesson content with sections, objectives, and exercises
- `lessons.test_cases` - Test cases for validating user code
- `projects.requirements` - Project requirements list
- `projects.success_criteria` - Success criteria for project completion
- `messages.context_snapshot` - AI context used for generating responses
- `project_submissions.review_feedback` - AI code review feedback
- `user_events.event_data` - Flexible event metadata

## Requirements Validation

These migrations satisfy the following requirements from the design document:

- **Requirement 1.3, 1.4** - User profile storage
- **Requirement 3.1, 3.5** - Roadmap and lesson storage
- **Requirement 4.1, 4.6** - AI conversation and message storage
- **Requirement 5.1** - Lesson progress tracking
- **Requirement 6.1** - Code save functionality
- **Requirement 8.1, 8.3** - Project and submission storage
- **Requirement 16.5** - Row Level Security for data isolation
- **Requirement 17.1, 17.7** - Analytics and event tracking

## TypeScript Types

For TypeScript type definitions that match this schema, see `lib/types/database.ts` in the main application.

## Troubleshooting

### Migration Fails with "relation already exists"
If you've already run some migrations, you may need to drop existing tables first or skip already-applied migrations.

### RLS Policies Block Queries
Ensure you're using the authenticated Supabase client with a valid user session. RLS policies require `auth.uid()` to be set.

### Foreign Key Violations
Ensure migrations are applied in order. Later migrations depend on tables created in earlier migrations.

## Next Steps

After applying these migrations:

1. Verify all tables were created: Check the Supabase dashboard Table Editor
2. Test RLS policies: Try querying tables with different user sessions
3. Seed test data: Create sample users, roadmaps, and lessons for development
4. Configure database backups: Set up automated backups in Supabase settings
