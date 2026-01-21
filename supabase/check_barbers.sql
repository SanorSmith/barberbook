-- Check if barbers exist in the database
SELECT 
  b.id,
  b.user_id,
  b.name,
  b.bio,
  b.is_active,
  b.created_at,
  p.username,
  p.email,
  p.role
FROM barbers b
LEFT JOIN profiles p ON b.user_id = p.id
ORDER BY b.created_at DESC;

-- Check total count
SELECT COUNT(*) as total_barbers FROM barbers;

-- Check if RLS is blocking the query
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'barbers';
