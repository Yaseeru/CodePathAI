-- Migration: Add email preferences and tracking for re-engagement system
-- This migration adds fields to user_profiles for email preferences and creates a table for tracking sent emails

-- ============================================================================
-- ADD EMAIL PREFERENCE FIELDS TO USER_PROFILES
-- ============================================================================
ALTER TABLE user_profiles
ADD COLUMN reengagement_emails_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN last_reengagement_email_sent_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- CREATE EMAIL TRACKING TABLE
-- ============================================================================
CREATE TABLE email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'reengagement'
  email_id VARCHAR(255), -- Resend email ID
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email tracking queries
CREATE INDEX idx_email_tracking_user_id ON email_tracking(user_id);
CREATE INDEX idx_email_tracking_email_type ON email_tracking(email_type);
CREATE INDEX idx_email_tracking_sent_at ON email_tracking(sent_at DESC);
CREATE INDEX idx_email_tracking_email_id ON email_tracking(email_id);
