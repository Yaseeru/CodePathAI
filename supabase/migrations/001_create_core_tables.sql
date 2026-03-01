-- Migration: Create core database tables for CodePath AI MVP
-- This migration creates the foundational tables for user profiles, roadmaps, lessons, projects, and progress tracking

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  learning_goal TEXT,
  time_commitment INTEGER, -- hours per week
  experience_level VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ============================================================================
-- ROADMAPS TABLE
-- ============================================================================
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, archived, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for roadmap queries
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_status ON roadmaps(status);

-- ============================================================================
-- LESSONS TABLE
-- ============================================================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- structured lesson content
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL, -- minutes
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  prerequisites UUID[], -- array of lesson IDs
  language VARCHAR(50), -- javascript, python, html
  starter_code TEXT,
  test_cases JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lesson queries
CREATE INDEX idx_lessons_roadmap_id ON lessons(roadmap_id);
CREATE INDEX idx_lessons_order ON lessons(roadmap_id, order_index);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  success_criteria JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL, -- minutes
  unlock_after_lesson UUID REFERENCES lessons(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project queries
CREATE INDEX idx_projects_roadmap_id ON projects(roadmap_id);

-- ============================================================================
-- LESSON PROGRESS TABLE
-- ============================================================================
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_time INTEGER, -- minutes taken
  attempts INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes for progress queries
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(user_id, status);

-- ============================================================================
-- PROJECT SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted', -- submitted, reviewed, approved
  review_feedback JSONB,
  score INTEGER, -- 0-100
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for submission queries
CREATE INDEX idx_project_submissions_user_id ON project_submissions(user_id);
CREATE INDEX idx_project_submissions_project_id ON project_submissions(project_id);

-- ============================================================================
-- USER PROGRESS TABLE
-- ============================================================================
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  current_roadmap_id UUID REFERENCES roadmaps(id),
  current_lesson_id UUID REFERENCES lessons(id),
  total_lessons_completed INTEGER DEFAULT 0,
  total_projects_completed INTEGER DEFAULT 0,
  total_learning_time INTEGER DEFAULT 0, -- minutes
  current_streak INTEGER DEFAULT 0, -- days
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
