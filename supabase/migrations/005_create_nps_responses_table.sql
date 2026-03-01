-- Create NPS responses table
CREATE TABLE IF NOT EXISTS nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id
CREATE INDEX idx_nps_responses_user_id ON nps_responses(user_id);

-- Create index for created_at for time-based queries
CREATE INDEX idx_nps_responses_created_at ON nps_responses(created_at);

-- Enable Row Level Security
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own NPS responses
CREATE POLICY "Users can view own NPS responses"
  ON nps_responses FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own NPS responses
CREATE POLICY "Users can insert own NPS responses"
  ON nps_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users cannot update NPS responses (one-time submission)
-- No update policy needed

-- RLS Policy: Users cannot delete NPS responses
-- No delete policy needed
