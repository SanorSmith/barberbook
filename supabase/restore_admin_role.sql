-- Check current admin user status
SELECT 
  id,
  email,
  role,
  full_name,
  created_at
FROM profiles
WHERE email LIKE '%admin%' OR role = 'admin'
ORDER BY created_at;

-- If you know your admin email, check specifically
-- Replace 'your-admin-email@example.com' with your actual admin email
-- SELECT id, email, role FROM profiles WHERE email = 'your-admin-email@example.com';

-- Restore admin role for your user
-- Replace 'your-admin-email@example.com' with your actual admin email
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-admin-email@example.com';

-- Or if you know the user ID:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- Verify the update
-- SELECT id, email, role FROM profiles WHERE email = 'your-admin-email@example.com';
