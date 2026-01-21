-- Fix RLS policies for barbers table to allow admin access
-- This ensures admin users can view all barbers in the admin panel

-- Drop existing policies
DROP POLICY IF EXISTS "Public barbers are viewable by everyone" ON barbers;
DROP POLICY IF EXISTS "Barbers can update own profile" ON barbers;
DROP POLICY IF EXISTS "Admins can do everything with barbers" ON barbers;

-- Enable RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view active barbers (for public pages)
CREATE POLICY "Anyone can view active barbers"
ON barbers FOR SELECT
USING (is_active = true);

-- Policy 2: Admins can do everything
CREATE POLICY "Admins have full access to barbers"
ON barbers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 3: Barbers can update their own profile
CREATE POLICY "Barbers can update own profile"
ON barbers FOR UPDATE
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'barber'
  )
);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'barbers'
ORDER BY policyname;
