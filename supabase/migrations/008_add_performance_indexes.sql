-- Migration: Add Performance Optimization Indexes
-- Description: Add composite indexes for common queries to improve performance
-- Date: 2025-01-XX

-- Composite index for lesson progress queries (user + status)
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_status 
  ON lesson_progress(user_id, status);

-- Composite index for lesson progress queries (user + lesson)
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson 
  ON lesson_progress(user_id, lesson_id);

-- Composite index for messages (conversation + created_at for chronological ordering)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC);

-- Composite index for daily activity (user + date for streak calculations)
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date 
  ON daily_activity(user_id, activity_date DESC);

-- Composite index for code saves (user + lesson for quick retrieval)
CREATE INDEX IF NOT EXISTS idx_code_saves_user_lesson 
  ON code_saves(user_id, lesson_id, saved_at DESC);

-- Composite index for code saves (user + project)
CREATE INDEX IF NOT EXISTS idx_code_saves_user_project 
  ON code_saves(user_id, project_id, saved_at DESC);

-- Composite index for project submissions (user + project + status)
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_project_status 
  ON project_submissions(user_id, project_id, status);

-- Composite index for lessons (roadmap + order for sequential access)
CREATE INDEX IF NOT EXISTS idx_lessons_roadmap_order 
  ON lessons(roadmap_id, order_index);

-- Composite index for roadmaps (user + status for active roadmap queries)
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_status 
  ON roadmaps(user_id, status);

-- Composite index for conversations (user + lesson for context queries)
CREATE INDEX IF NOT EXISTS idx_conversations_user_lesson 
  ON conversations(user_id, lesson_id);

-- Composite index for user events (user + type + created_at for analytics)
CREATE INDEX IF NOT EXISTS idx_user_events_user_type_created 
  ON user_events(user_id, event_type, created_at DESC);

-- Add query performance monitoring comment
COMMENT ON INDEX idx_lesson_progress_user_status IS 'Optimizes queries filtering by user and status';
COMMENT ON INDEX idx_messages_conversation_created IS 'Optimizes chronological message retrieval';
COMMENT ON INDEX idx_daily_activity_user_date IS 'Optimizes streak calculation queries';
