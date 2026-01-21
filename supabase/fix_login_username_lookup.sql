-- Fix RLS policy to allow public username lookup during login
-- This allows unauthenticated users to look up email by username for login

-- Add policy to allow anyone to read username and email for login purposes
CREATE POLICY "Allow public username lookup for login"
ON profiles FOR SELECT
USING (true)
WITH CHECK (false);

-- Note: This only allows SELECT (read), not write operations
-- Users can look up username->email mapping but cannot modify profiles

-- Verify the new policy
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
