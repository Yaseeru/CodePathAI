-- Migration: Add lesson content versioning
-- This migration adds version tracking to lessons and creates a lesson_versions table
-- to preserve previous versions when content is updated

-- ============================================================================
-- ADD VERSION COLUMN TO LESSONS TABLE
-- ============================================================================
ALTER TABLE lessons
ADD COLUMN version INTEGER DEFAULT 1 NOT NULL;

-- Index for version queries
CREATE INDEX idx_lessons_version ON lessons(id, version);

-- ============================================================================
-- CREATE LESSON_VERSIONS TABLE
-- ============================================================================
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

-- Indexes for version queries
CREATE INDEX idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
CREATE INDEX idx_lesson_versions_created_at ON lesson_versions(lesson_id, created_at DESC);

-- ============================================================================
-- CREATE TRIGGER TO AUTO-VERSION LESSONS
-- ============================================================================
-- Function to save previous version before update
CREATE OR REPLACE FUNCTION save_lesson_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only save version if content has changed
  IF OLD.content IS DISTINCT FROM NEW.content OR
     OLD.title IS DISTINCT FROM NEW.title OR
     OLD.description IS DISTINCT FROM NEW.description THEN
    
    -- Insert old version into lesson_versions
    INSERT INTO lesson_versions (
      lesson_id,
      version,
      title,
      description,
      content,
      order_index,
      estimated_duration,
      difficulty_level,
      prerequisites,
      language,
      starter_code,
      test_cases,
      created_at
    ) VALUES (
      OLD.id,
      OLD.version,
      OLD.title,
      OLD.description,
      OLD.content,
      OLD.order_index,
      OLD.estimated_duration,
      OLD.difficulty_level,
      OLD.prerequisites,
      OLD.language,
      OLD.starter_code,
      OLD.test_cases,
      OLD.updated_at
    );
    
    -- Increment version number
    NEW.version := OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER lesson_version_trigger
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION save_lesson_version();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE lesson_versions IS 'Stores historical versions of lesson content for tracking changes and rollback';
COMMENT ON COLUMN lessons.version IS 'Current version number of the lesson content';
COMMENT ON COLUMN lesson_versions.version IS 'Version number of this historical snapshot';
COMMENT ON COLUMN lesson_versions.change_notes IS 'Optional notes describing what changed in this version';
