-- Fix RLS policies on profiles table to allow admin operations
-- This allows the admin API to create and update profiles when managing barbers

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Policy 3: Service role can do everything (for admin API operations)
-- This allows the admin API with service role key to create/update profiles
CREATE POLICY "Service role full access"
ON profiles FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy 4: Admins can view all profiles (for admin dashboard)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Policy 5: Admins can update all profiles (for admin dashboard)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Verify policies
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
