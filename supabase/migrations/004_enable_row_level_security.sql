-- Migration: Enable Row Level Security (RLS) policies for CodePath AI MVP
-- This migration enables RLS on all tables and creates policies to ensure users can only access their own data

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ROADMAPS POLICIES
-- ============================================================================
-- Users can view their own roadmaps
CREATE POLICY "Users can view own roadmaps"
  ON roadmaps FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own roadmaps
CREATE POLICY "Users can insert own roadmaps"
  ON roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own roadmaps
CREATE POLICY "Users can update own roadmaps"
  ON roadmaps FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own roadmaps
CREATE POLICY "Users can delete own roadmaps"
  ON roadmaps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- LESSONS POLICIES
-- ============================================================================
-- Users can view lessons from their own roadmaps
CREATE POLICY "Users can view lessons from own roadmaps"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = lessons.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- Users can insert lessons into their own roadmaps
CREATE POLICY "Users can insert lessons into own roadmaps"
  ON lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = lessons.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- Users can update lessons in their own roadmaps
CREATE POLICY "Users can update lessons in own roadmaps"
  ON lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = lessons.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- Users can delete lessons from their own roadmaps
CREATE POLICY "Users can delete lessons from own roadmaps"
  ON lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = lessons.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================
-- Users can view projects from their own roadmaps
CREATE POLICY "Users can view projects from own roadmaps"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = projects.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- Users can insert projects into their own roadmaps
CREATE POLICY "Users can insert projects into own roadmaps"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = projects.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- Users can update projects in their own roadmaps
CREATE POLICY "Users can update projects in own roadmaps"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = projects.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- Users can delete projects from their own roadmaps
CREATE POLICY "Users can delete projects from own roadmaps"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM roadmaps
      WHERE roadmaps.id = projects.roadmap_id
      AND roadmaps.user_id = auth.uid()
    )
  );

-- ============================================================================
-- LESSON PROGRESS POLICIES
-- ============================================================================
-- Users can view their own lesson progress
CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own lesson progress
CREATE POLICY "Users can insert own lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lesson progress
CREATE POLICY "Users can update own lesson progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own lesson progress
CREATE POLICY "Users can delete own lesson progress"
  ON lesson_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PROJECT SUBMISSIONS POLICIES
-- ============================================================================
-- Users can view their own project submissions
CREATE POLICY "Users can view own project submissions"
  ON project_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own project submissions
CREATE POLICY "Users can insert own project submissions"
  ON project_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own project submissions
CREATE POLICY "Users can update own project submissions"
  ON project_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own project submissions
CREATE POLICY "Users can delete own project submissions"
  ON project_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER PROGRESS POLICIES
-- ============================================================================
-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================
-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own conversations
CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================
-- Users can view messages from their own conversations
CREATE POLICY "Users can view messages from own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can insert messages into their own conversations
CREATE POLICY "Users can insert messages into own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can update messages in their own conversations
CREATE POLICY "Users can update messages in own conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can delete messages from their own conversations
CREATE POLICY "Users can delete messages from own conversations"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CODE SAVES POLICIES
-- ============================================================================
-- Users can view their own code saves
CREATE POLICY "Users can view own code saves"
  ON code_saves FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own code saves
CREATE POLICY "Users can insert own code saves"
  ON code_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own code saves
CREATE POLICY "Users can update own code saves"
  ON code_saves FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own code saves
CREATE POLICY "Users can delete own code saves"
  ON code_saves FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER EVENTS POLICIES
-- ============================================================================
-- Users can view their own events
CREATE POLICY "Users can view own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DAILY ACTIVITY POLICIES
-- ============================================================================
-- Users can view their own daily activity
CREATE POLICY "Users can view own daily activity"
  ON daily_activity FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own daily activity
CREATE POLICY "Users can insert own daily activity"
  ON daily_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own daily activity
CREATE POLICY "Users can update own daily activity"
  ON daily_activity FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own daily activity
CREATE POLICY "Users can delete own daily activity"
  ON daily_activity FOR DELETE
  USING (auth.uid() = user_id);
