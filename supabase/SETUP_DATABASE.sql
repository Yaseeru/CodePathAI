-- ============================================================================
-- CODEPATH AI - COMPLETE DATABASE SETUP SCRIPT
-- Run this entire script in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 001: CREATE CORE TABLES
-- ============================================================================

-- USER PROFILES TABLE
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  learning_goal TEXT,
  time_commitment INTEGER,
  experience_level VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ROADMAPS TABLE
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_status ON roadmaps(status);

-- LESSONS TABLE
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  difficulty_level INTEGER DEFAULT 1,
  prerequisites UUID[],
  language VARCHAR(50),
  starter_code TEXT,
  test_cases JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_roadmap_id ON lessons(roadmap_id);
CREATE INDEX idx_lessons_order ON lessons(roadmap_id, order_index);

-- PROJECTS TABLE
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  success_criteria JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  unlock_after_lesson UUID REFERENCES lessons(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_roadmap_id ON projects(roadmap_id);

-- LESSON PROGRESS TABLE
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_time INTEGER,
  attempts INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(user_id, status);

-- PROJECT SUBMISSIONS TABLE
CREATE TABLE project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted',
  review_feedback JSONB,
  score INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_project_submissions_user_id ON project_submissions(user_id);
CREATE INDEX idx_project_submissions_project_id ON project_submissions(project_id);

-- USER PROGRESS TABLE
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  current_roadmap_id UUID REFERENCES roadmaps(id),
  current_lesson_id UUID REFERENCES lessons(id),
  total_lessons_completed INTEGER DEFAULT 0,
  total_projects_completed INTEGER DEFAULT 0,
  total_learning_time INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  difficulty_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MIGRATION 002: CREATE AI INTERACTION TABLES
-- ============================================================================

-- CONVERSATIONS TABLE
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_lesson_id ON conversations(lesson_id);

-- MESSAGES TABLE
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  context_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at);

-- CODE SAVES TABLE
CREATE TABLE code_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  project_id UUID REFERENCES projects(id),
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_code_saves_user_lesson ON code_saves(user_id, lesson_id);
CREATE INDEX idx_code_saves_user_project ON code_saves(user_id, project_id);

-- ============================================================================
-- MIGRATION 003: CREATE ANALYTICS TABLES
-- ============================================================================

-- USER EVENTS TABLE
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_type ON user_events(event_type);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);

-- DAILY ACTIVITY TABLE
CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  code_executions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date DESC);

-- ============================================================================
-- MIGRATION 004: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
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

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Roadmaps Policies
CREATE POLICY "Users can view own roadmaps" ON roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own roadmaps" ON roadmaps FOR DELETE USING (auth.uid() = user_id);

-- Lessons Policies
CREATE POLICY "Users can view lessons from own roadmaps" ON lessons FOR SELECT
  USING (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = lessons.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can insert lessons into own roadmaps" ON lessons FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = lessons.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can update lessons in own roadmaps" ON lessons FOR UPDATE
  USING (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = lessons.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can delete lessons from own roadmaps" ON lessons FOR DELETE
  USING (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = lessons.roadmap_id AND roadmaps.user_id = auth.uid()));

-- Projects Policies
CREATE POLICY "Users can view projects from own roadmaps" ON projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = projects.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can insert projects into own roadmaps" ON projects FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = projects.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can update projects in own roadmaps" ON projects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = projects.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can delete projects from own roadmaps" ON projects FOR DELETE
  USING (EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = projects.roadmap_id AND roadmaps.user_id = auth.uid()));

-- Lesson Progress Policies
CREATE POLICY "Users can view own lesson progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lesson progress" ON lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- Project Submissions Policies
CREATE POLICY "Users can view own project submissions" ON project_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project submissions" ON project_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project submissions" ON project_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project submissions" ON project_submissions FOR DELETE USING (auth.uid() = user_id);

-- User Progress Policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON user_progress FOR DELETE USING (auth.uid() = user_id);

-- Conversations Policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can view messages from own conversations" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can insert messages into own conversations" ON messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can update messages in own conversations" ON messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can delete messages from own conversations" ON messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));

-- Code Saves Policies
CREATE POLICY "Users can view own code saves" ON code_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own code saves" ON code_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own code saves" ON code_saves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own code saves" ON code_saves FOR DELETE USING (auth.uid() = user_id);

-- User Events Policies
CREATE POLICY "Users can view own events" ON user_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON user_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Activity Policies
CREATE POLICY "Users can view own daily activity" ON daily_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily activity" ON daily_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily activity" ON daily_activity FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily activity" ON daily_activity FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION 005: ADD LESSON STATE FIELD
-- ============================================================================

ALTER TABLE lesson_progress ADD COLUMN state JSONB DEFAULT '{}'::jsonb;
COMMENT ON COLUMN lesson_progress.state IS 'Stores UI state for pause/resume: scrollPosition, timerElapsed, etc.';

-- ============================================================================
-- MIGRATION 005B: CREATE NPS RESPONSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nps_responses_user_id ON nps_responses(user_id);
CREATE INDEX idx_nps_responses_created_at ON nps_responses(created_at);

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own NPS responses" ON nps_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own NPS responses" ON nps_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION 006: ADD EMAIL PREFERENCES
-- ============================================================================

ALTER TABLE user_profiles
ADD COLUMN reengagement_emails_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN last_reengagement_email_sent_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  email_id VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_tracking_user_id ON email_tracking(user_id);
CREATE INDEX idx_email_tracking_email_type ON email_tracking(email_type);
CREATE INDEX idx_email_tracking_sent_at ON email_tracking(sent_at DESC);
CREATE INDEX idx_email_tracking_email_id ON email_tracking(email_id);

-- ============================================================================
-- MIGRATION 007: ADD LESSON VERSIONING
-- ============================================================================

ALTER TABLE lessons ADD COLUMN version INTEGER DEFAULT 1 NOT NULL;
CREATE INDEX idx_lessons_version ON lessons(id, version);

CREATE TABLE lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  difficulty_level INTEGER DEFAULT 1,
  prerequisites UUID[],
  language VARCHAR(50),
  starter_code TEXT,
  test_cases JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  change_notes TEXT,
  UNIQUE(lesson_id, version)
);

CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
CREATE INDEX idx_lesson_versions_created_at ON lesson_versions(lesson_id, created_at DESC);

CREATE OR REPLACE FUNCTION save_lesson_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content OR
     OLD.title IS DISTINCT FROM NEW.title OR
     OLD.description IS DISTINCT FROM NEW.description THEN
    
    INSERT INTO lesson_versions (
      lesson_id, version, title, description, content, order_index,
      estimated_duration, difficulty_level, prerequisites, language,
      starter_code, test_cases, created_at
    ) VALUES (
      OLD.id, OLD.version, OLD.title, OLD.description, OLD.content, OLD.order_index,
      OLD.estimated_duration, OLD.difficulty_level, OLD.prerequisites, OLD.language,
      OLD.starter_code, OLD.test_cases, OLD.updated_at
    );
    
    NEW.version := OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_version_trigger
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION save_lesson_version();

-- ============================================================================
-- MIGRATION 008: ADD PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_status ON lesson_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_code_saves_user_lesson ON code_saves(user_id, lesson_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_saves_user_project ON code_saves(user_id, project_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_project_status ON project_submissions(user_id, project_id, status);
CREATE INDEX IF NOT EXISTS idx_lessons_roadmap_order ON lessons(roadmap_id, order_index);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_status ON roadmaps(user_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_user_lesson ON conversations(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_type_created ON user_events(user_id, event_type, created_at DESC);

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
