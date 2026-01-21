-- Force fix RLS policies for barbers table
-- Drop ALL existing policies first

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'barbers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON barbers';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view active barbers
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
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'barbers'
ORDER BY policyname;
