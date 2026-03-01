-- Migration: Add state field to lesson_progress table
-- This migration adds a JSONB field to store lesson UI state (scroll position, timer, etc.)

ALTER TABLE lesson_progress
ADD COLUMN state JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the field
COMMENT ON COLUMN lesson_progress.state IS 'Stores UI state for pause/resume: scrollPosition, timerElapsed, etc.';
