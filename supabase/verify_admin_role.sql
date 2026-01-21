-- Verify your admin user has the correct role
SELECT 
  id,
  email,
  role,
  full_name,
  username
FROM profiles
WHERE role = 'admin';

-- Check what user is currently logged in (run this while logged in)
SELECT 
  auth.uid() as current_user_id,
  p.email,
  p.role,
  p.full_name
FROM profiles p
WHERE p.id = auth.uid();

-- Test if admin can see barbers with current policies
SELECT 
  b.id,
  b.name,
  b.is_active,
  p.username
FROM barbers b
LEFT JOIN profiles p ON b.user_id = p.id
WHERE EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
LIMIT 5;
