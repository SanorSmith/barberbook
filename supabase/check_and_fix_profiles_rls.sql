-- First, check what policies currently exist on profiles
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Now let's completely reset and fix the policies
-- The issue is likely a circular dependency where the policy checks profiles.role
-- but can't read profiles because of RLS

-- Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Disable RLS temporarily to fix the circular dependency
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can ALWAYS view their own profile (no circular dependency)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (id = auth.uid());

-- Simple policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Verify the new policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
