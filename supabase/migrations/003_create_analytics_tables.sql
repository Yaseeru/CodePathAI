-- Migration: Create analytics and tracking tables for CodePath AI MVP
-- This migration creates tables for event tracking and daily activity

-- ============================================================================
-- USER EVENTS TABLE
-- ============================================================================
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for event queries
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_type ON user_events(event_type);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);

-- ============================================================================
-- DAILY ACTIVITY TABLE
-- ============================================================================
CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- minutes
  messages_sent INTEGER DEFAULT 0,
  code_executions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Index for daily activity queries
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date DESC);
