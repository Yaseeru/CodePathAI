-- ============================================================================
-- FIX: Allow service role to create user profiles during registration
-- ============================================================================

-- Drop the existing insert policy for user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create a new policy that allows both authenticated users AND service role to insert
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR 
    auth.jwt()->>'role' = 'service_role'
  );

-- Alternative: You can also create a separate policy for service role
-- This is cleaner and more explicit
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;

CREATE POLICY "Service role can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- You can verify the policies are created by running:
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
